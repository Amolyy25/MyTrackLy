import cron from "node-cron";
import { StreakService } from "../services/streakService";

// Daily streak update at 2:00 AM
export const initStreakCron = () => {
  cron.schedule("0 2 * * *", async () => {
    console.log("[CRON] Running daily streak recalculation...");
    try {
      await StreakService.recalculateAllStreaks();
      console.log("[CRON] Streak recalculation completed.");
    } catch (error) {
      console.error("[CRON] Streak recalculation failed:", error);
    }
  });
};
