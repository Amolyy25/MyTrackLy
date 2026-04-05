import cron from "node-cron";
import prisma from "../config/database";
import { sendEmail } from "../services/emailService";
import * as fs from "fs";
import * as path from "path";

const TRAINING_TYPE_LABELS: Record<string, string> = {
  full_body: "Full Body",
  upper_body: "Haut du corps",
  lower_body: "Bas du corps",
  push: "Push",
  pull: "Pull",
  cardio: "Cardio",
  core: "Core / Gainage",
  custom: "Personnalise",
};

/**
 * Generate all HH:mm strings from +offsetStart to +offsetEnd minutes from now.
 */
function getTimeWindow(now: Date, offsetStart: number, offsetEnd: number): string[] {
  const times: string[] = [];
  for (let offset = offsetStart; offset <= offsetEnd; offset++) {
    const target = new Date(now.getTime() + offset * 60 * 1000);
    const hh = target.getHours().toString().padStart(2, "0");
    const mm = target.getMinutes().toString().padStart(2, "0");
    times.push(`${hh}:${mm}`);
  }
  // Deduplicate
  return [...new Set(times)];
}

function loadTemplate(): string {
  const templatePath = path.join(__dirname, "../email/templates/planSessionReminder.html");
  return fs.readFileSync(templatePath, "utf-8");
}

export const initPlanReminderCron = () => {
  cron.schedule("*/15 * * * *", async () => {
    const now = new Date();
    const todayDow = now.getDay(); // 0=Sunday

    console.log(`[CRON] Plan reminder check at ${now.toISOString()}`);

    try {
      // Get time window: sessions whose timeOfDay is within [now+28min, now+32min]
      const windowTimes = getTimeWindow(now, 28, 32);

      if (windowTimes.length === 0) return;

      // Query plan days matching today's day of week and time window
      const planDays = await prisma.planDay.findMany({
        where: {
          dayOfWeek: todayDow,
          plan: { isActive: true },
          timeOfDay: { in: windowTimes },
        },
        include: {
          plan: {
            include: {
              user: true,
            },
          },
          exercises: {
            include: { exercise: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      if (planDays.length === 0) return;

      // Get today's date at midnight for log check
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      let template: string;
      try {
        template = loadTemplate();
      } catch {
        console.error("[CRON] Plan reminder template not found");
        return;
      }

      for (const planDay of planDays) {
        const user = planDay.plan.user;

        // Skip if user does not allow emails
        if (!user.allowEmails) continue;

        // Check if a log already exists for today and this planDayId
        const existingLog = await prisma.planSessionLog.findFirst({
          where: {
            planDayId: planDay.id,
            date: { gte: todayStart, lte: todayEnd },
          },
        });

        if (existingLog) continue;

        // Get last session log of the same training type for comparison
        const lastSimilar = await prisma.planSessionLog.findFirst({
          where: {
            planId: planDay.planId,
            planDay: { trainingType: planDay.trainingType },
            date: { lt: todayStart },
            skipped: false,
          },
          orderBy: { date: "desc" },
        });

        const typeLabel = TRAINING_TYPE_LABELS[planDay.trainingType] || planDay.trainingType;

        // Build exercises list HTML
        const exercisesList = planDay.exercises
          .map(
            (ex) =>
              `<li style="padding: 4px 0;">${ex.exercise.name} - ${ex.plannedSets} x ${ex.plannedReps}${ex.plannedWeightKg ? ` @ ${ex.plannedWeightKg}kg` : ""}</li>`
          )
          .join("");

        const lastSimilarDate = lastSimilar
          ? new Date(lastSimilar.date).toLocaleDateString("fr-FR")
          : "Aucune";
        const lastSimilarSummary = lastSimilar
          ? `${lastSimilar.moodScore ? `Humeur: ${lastSimilar.moodScore}/5` : ""}${lastSimilar.performanceNote ? ` - ${lastSimilar.performanceNote}` : ""}`
          : "Pas de seance precedente de ce type";

        // Build email
        let html = template
          .replace(/\{\{userName\}\}/g, user.name)
          .replace(/\{\{sessionTime\}\}/g, planDay.timeOfDay)
          .replace(/\{\{trainingTypeLabel\}\}/g, typeLabel)
          .replace(/\{\{exercisesList\}\}/g, exercisesList || "<li>Aucun exercice planifie</li>")
          .replace(/\{\{lastSimilarDate\}\}/g, lastSimilarDate)
          .replace(/\{\{lastSimilarSummary\}\}/g, lastSimilarSummary || "N/A")
          .replace(/\{\{planName\}\}/g, planDay.plan.name);

        await sendEmail({
          to: user.email,
          subject: `Rappel: Seance ${typeLabel} a ${planDay.timeOfDay} - ${planDay.plan.name}`,
          text: `Bonjour ${user.name}, votre seance ${typeLabel} est prevue a ${planDay.timeOfDay}. Plan: ${planDay.plan.name}`,
          html,
        });

        console.log(
          `[CRON] Plan reminder sent to ${user.email} for ${typeLabel} at ${planDay.timeOfDay}`
        );
      }
    } catch (err) {
      console.error("[CRON] Plan reminder job error:", err);
    }
  });
};
