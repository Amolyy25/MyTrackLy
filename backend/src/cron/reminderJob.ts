import cron from "node-cron";
import prisma from "../config/database";
import { Frequency } from "@prisma/client";
import { sendEmail } from "../email/emailService";

const MOTIVATION_MESSAGES = [
  "La discipline bat la motivation. Continue !",
  "Chaque jour compte. Tu es plus proche de ton objectif.",
  "Les petites habitudes menent aux grands changements.",
  "La constance est la cle du succes.",
  "Tu ne regretteras jamais d'avoir fait l'effort.",
  "Un jour a la fois. Tu geres.",
  "Ta future version te remerciera.",
];

function getRandomMotivation(): string {
  return MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
}

export const initReminderCron = () => {
  // Run every 15 minutes to catch habit-specific reminder times
  cron.schedule("*/15 * * * *", async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(Math.floor(currentMinute / 15) * 15).padStart(2, "0")}`;
    const currentDay = now.getDay();
    const currentDate = now.getDate();

    console.log(`[CRON] Checking habit reminders at ${currentTimeStr}...`);

    try {
      const habits = await prisma.habit.findMany({
        where: { reminderEnabled: true },
        include: {
          user: { select: { email: true, name: true, allowEmails: true, isVirtual: true } },
          logs: { orderBy: { completedAt: "desc" }, take: 1 },
        },
      });

      const appUrl = process.env.FRONTEND_URL || "https://mytrackly.fr";

      for (const habit of habits) {
        if (!habit.user.email || habit.user.isVirtual) continue;
        if (!habit.user.allowEmails) continue;

        // Check if this habit's reminder time matches current window (±15 min)
        const reminderTime = habit.reminderTime;
        if (!reminderTime) {
          // No specific time: use defaults (20:00 DAILY, 19:00 SUN weekly, 18:00 30th monthly)
          if (habit.targetFrequency === Frequency.DAILY && currentHour !== 20) continue;
          if (habit.targetFrequency === Frequency.WEEKLY && (currentDay !== 0 || currentHour !== 19)) continue;
          if (habit.targetFrequency === Frequency.MONTHLY && (currentDate !== 28 || currentHour !== 18)) continue;
        } else {
          // Has specific reminder time: check if it matches
          const [rH, rM] = reminderTime.split(":").map(Number);
          const reminderMinutes = rH * 60 + rM;
          const currentMinutes = currentHour * 60 + currentMinute;
          // Match within 15-minute window
          if (Math.abs(reminderMinutes - currentMinutes) > 7) continue;

          // For WEEKLY: only on reminder day (or any day if no daysOfWeek set)
          if (habit.targetFrequency === Frequency.WEEKLY && currentDay !== 0) continue;
          if (habit.targetFrequency === Frequency.MONTHLY && currentDate !== 1) continue;
        }

        // Check if already completed for this period
        let alreadyCompleted = false;
        const lastLog = habit.logs[0];

        if (lastLog) {
          const logDate = new Date(lastLog.completedAt);
          if (habit.targetFrequency === Frequency.DAILY) {
            alreadyCompleted = logDate.toDateString() === now.toDateString();
          } else if (habit.targetFrequency === Frequency.WEEKLY) {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + 1);
            startOfWeek.setHours(0, 0, 0, 0);
            alreadyCompleted = logDate >= startOfWeek;
          } else if (habit.targetFrequency === Frequency.MONTHLY) {
            alreadyCompleted =
              logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
          }
        }

        if (alreadyCompleted) continue;

        // Build email data
        const streakText = habit.currentStreak > 0 ? `🔥 Streak : ${habit.currentStreak} jours` : "";
        const targetText =
          habit.targetCount != null
            ? `${habit.targetCount}${(habit as any).targetUnit ? " " + (habit as any).targetUnit : ""}`
            : "";

        const periodLabels: Record<string, string> = {
          DAILY: "Rappel quotidien",
          WEEKLY: "Rappel hebdomadaire",
          MONTHLY: "Rappel mensuel",
        };

        const categoryEmojis: Record<string, string> = {
          hydration: "💧", sleep: "😴", nutrition: "🥗", exercise: "💪",
          wellness: "🧘", stretching: "🤸", meditation: "🧠", supplements: "💊",
          cardio: "🏃", posture: "🧍", journaling: "📝", cold_exposure: "🥶",
          reading: "📖", screen_limit: "📵", custom: "⭐",
        };

        await sendEmail(
          habit.user.email,
          `Rappel : ${habit.name} ${streakText}`,
          "habitReminder",
          {
            name: habit.user.name || "Champion",
            habitName: habit.name,
            habitEmoji: (habit as any).icon || categoryEmojis[habit.category] || "✅",
            habitTarget: targetText,
            streak: streakText,
            motivationText: getRandomMotivation(),
            periodLabel: periodLabels[habit.targetFrequency] || "Rappel",
            appUrl,
          }
        );

        console.log(`[CRON] Reminder sent for habit "${habit.name}" to ${habit.user.email}`);
      }
    } catch (err) {
      console.error("[CRON] Reminder job error:", err);
    }
  });
};
