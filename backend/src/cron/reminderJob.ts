import cron from "node-cron";
import prisma from "../config/database";
import { Frequency } from "@prisma/client";
import { sendEmail } from "../services/emailService"; // Assuming this exists or I'll create a stub

export const initReminderCron = () => {
  // Check every hour (at minute 0)
  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday
    const currentDate = now.getDate();

    console.log(`[CRON] Checking reminders for hour ${currentHour}...`);

    try {
      const habits = await prisma.habit.findMany({
        where: { reminderEnabled: true },
        include: { user: true, logs: { orderBy: { completedAt: "desc" }, take: 1 } },
      });

      for (const habit of habits) {
        if (!habit.user.email) continue;

        let shouldRemind = false;
        let periodName = "";

        if (habit.targetFrequency === Frequency.DAILY && currentHour === 20) {
          // Check if not completed today
          const lastLogToday = habit.logs[0] && new Date(habit.logs[0].completedAt).toDateString() === now.toDateString();
          if (!lastLogToday) {
            shouldRemind = true;
            periodName = "aujourd'hui";
          }
        } else if (habit.targetFrequency === Frequency.WEEKLY && currentDay === 0 && currentHour === 19) {
          // Check if any log this week
          // ... weekly check ...
          shouldRemind = true; // Placeholder
          periodName = "cette semaine";
        } else if (habit.targetFrequency === Frequency.MONTHLY && currentDate === 30 && currentHour === 18) {
          // Check if any log this month
          shouldRemind = true; // Placeholder
          periodName = "ce mois-ci";
        }

        if (shouldRemind) {
          const streakEmoji = habit.currentStreak > 0 ? `🔥 Streak ${habit.currentStreak}j` : "";
          await sendEmail({
            to: habit.user.email,
            subject: `Rappel Habitude : ${habit.name}`,
            text: `Hey ${habit.user.name} ! ${habit.name} ${periodName} ? ${streakEmoji}`,
            html: `<h3>Hey ${habit.user.name} !</h3><p>N'oublie pas ton habitude : <b>${habit.name}</b> ${periodName} !</p><p>${streakEmoji}</p>`
          });
        }
      }
    } catch (err) {
      console.error("[CRON] Reminder job error:", err);
    }
  });
};
