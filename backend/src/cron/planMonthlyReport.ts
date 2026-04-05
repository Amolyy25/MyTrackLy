import cron from "node-cron";
import prisma from "../config/database";
import { sendEmail } from "../services/emailService";
import { getAISuggestions, GeminiContext } from "../services/geminiService";
import * as fs from "fs";
import * as path from "path";

const MOOD_EMOJIS: Record<number, string> = {
  1: "&#128553;", // very sad
  2: "&#128533;", // sad
  3: "&#128528;", // neutral
  4: "&#128522;", // happy
  5: "&#128293;", // fire
};

function loadTemplate(): string {
  const templatePath = path.join(__dirname, "../email/templates/planMonthlyReport.html");
  return fs.readFileSync(templatePath, "utf-8");
}

function getMonthName(month: number): string {
  const months = [
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
  ];
  return months[month] || "";
}

export const initPlanMonthlyReport = () => {
  // 1st of month at 8am
  cron.schedule("0 8 1 * *", async () => {
    console.log("[CRON] Monthly plan report starting...");

    try {
      const now = new Date();
      const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthIndex = firstOfLastMonth.getMonth();
      const lastMonthYear = firstOfLastMonth.getFullYear();

      // Get all active plans with their users and last month's sessions
      const plans = await prisma.trainingPlan.findMany({
        where: { isActive: true },
        include: {
          user: true,
          days: true,
          sessions: {
            where: {
              createdAt: { gte: firstOfLastMonth, lt: firstOfThisMonth },
            },
          },
        },
      });

      if (plans.length === 0) {
        console.log("[CRON] No active plans found for monthly report");
        return;
      }

      let template: string;
      try {
        template = loadTemplate();
      } catch {
        console.error("[CRON] Monthly report template not found");
        return;
      }

      for (const plan of plans) {
        const user = plan.user;
        if (!user.allowEmails) continue;

        // Count sessions logged vs planned
        const sessionsLogged = plan.sessions.filter((s) => !s.skipped).length;
        const skippedSessions = plan.sessions.filter((s) => s.skipped).length;

        // Estimate planned: days per week * weeks in last month
        const daysInLastMonth = new Date(lastMonthYear, lastMonthIndex + 1, 0).getDate();
        const weeksInMonth = daysInLastMonth / 7;

        // Count actual day-of-week occurrences in last month
        let sessionsPlanned = 0;
        const dayOfWeekCounts: Record<number, number> = {};
        for (let d = 0; d < daysInLastMonth; d++) {
          const date = new Date(lastMonthYear, lastMonthIndex, d + 1);
          const dow = date.getDay();
          dayOfWeekCounts[dow] = (dayOfWeekCounts[dow] || 0) + 1;
        }
        for (const planDay of plan.days) {
          sessionsPlanned += dayOfWeekCounts[planDay.dayOfWeek] || 0;
        }

        const completionRate =
          sessionsPlanned > 0
            ? Math.round((sessionsLogged / sessionsPlanned) * 100)
            : 0;

        // Average mood score
        const logsWithMood = plan.sessions.filter(
          (s) => s.moodScore !== null && s.moodScore !== undefined
        );
        const avgMood =
          logsWithMood.length > 0
            ? Math.round(
                logsWithMood.reduce((sum, s) => sum + (s.moodScore as number), 0) /
                  logsWithMood.length
              )
            : null;
        const avgMoodEmoji = avgMood ? (MOOD_EMOJIS[avgMood] || `${avgMood}/5`) : "N/A";

        // Weight change from measurements
        const startMeasurement = await prisma.measurement.findFirst({
          where: {
            userId: user.id,
            date: { gte: firstOfLastMonth, lt: firstOfThisMonth },
            bodyWeightKg: { not: null },
          },
          orderBy: { date: "asc" },
        });
        const endMeasurement = await prisma.measurement.findFirst({
          where: {
            userId: user.id,
            date: { gte: firstOfLastMonth, lt: firstOfThisMonth },
            bodyWeightKg: { not: null },
          },
          orderBy: { date: "desc" },
        });

        let weightChange = "N/A";
        if (startMeasurement?.bodyWeightKg && endMeasurement?.bodyWeightKg) {
          const diff = endMeasurement.bodyWeightKg - startMeasurement.bodyWeightKg;
          weightChange = `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`;
        }

        // Get AI summary
        let aiSummary = "";
        try {
          const ctx: GeminiContext = {
            user: { name: user.name, goalType: user.goalType, role: user.role },
            plan: {
              name: plan.name,
              bodyGoal: plan.bodyGoal,
              targetWeightKg: plan.targetWeightKg,
              customGoal: plan.customGoal,
              initialNotes: plan.initialNotes,
              days: plan.days.map((d) => ({
                trainingType: d.trainingType,
                label: d.label,
                dayOfWeek: d.dayOfWeek,
                timeOfDay: d.timeOfDay,
              })),
            },
            recentSessions: plan.sessions.map((s) => ({
              date: s.date,
              durationMinutes: null,
              notes: s.performanceNote,
              exercises: [],
            })),
            recentMoodLogs: logsWithMood.map((s) => ({
              date: s.date,
              moodScore: s.moodScore,
              moodNote: s.moodNote,
              performanceNote: s.performanceNote,
            })),
            latestMeasurement: endMeasurement
              ? {
                  bodyWeightKg: endMeasurement.bodyWeightKg,
                  waistCm: null,
                  chestCm: null,
                }
              : null,
            weightTrend:
              startMeasurement?.bodyWeightKg && endMeasurement?.bodyWeightKg
                ? endMeasurement.bodyWeightKg - startMeasurement.bodyWeightKg
                : null,
          };

          const suggestions = await getAISuggestions(ctx);
          aiSummary = suggestions
            .map((s) => `<strong>${s.title}</strong>: ${s.content}`)
            .join("<br/><br/>");
        } catch {
          aiSummary = "Les conseils IA ne sont pas disponibles ce mois-ci.";
        }

        const monthLabel = `${getMonthName(lastMonthIndex)} ${lastMonthYear}`;

        // Build email
        let html = template
          .replace(/\{\{userName\}\}/g, user.name)
          .replace(/\{\{planName\}\}/g, plan.name)
          .replace(/\{\{month\}\}/g, monthLabel)
          .replace(/\{\{sessionsLogged\}\}/g, sessionsLogged.toString())
          .replace(/\{\{sessionsPlanned\}\}/g, sessionsPlanned.toString())
          .replace(/\{\{completionRate\}\}/g, completionRate.toString())
          .replace(/\{\{avgMoodEmoji\}\}/g, avgMoodEmoji)
          .replace(/\{\{weightChange\}\}/g, weightChange)
          .replace(/\{\{aiSummary\}\}/g, aiSummary);

        await sendEmail({
          to: user.email,
          subject: `Votre bilan mensuel MyTrackLy - ${monthLabel}`,
          text: `Bonjour ${user.name}, voici votre bilan mensuel pour ${monthLabel}. Seances: ${sessionsLogged}/${sessionsPlanned} (${completionRate}%). Plan: ${plan.name}`,
          html,
        });

        console.log(`[CRON] Monthly report sent to ${user.email} for plan ${plan.name}`);
      }
    } catch (err) {
      console.error("[CRON] Monthly report job error:", err);
    }
  });
};
