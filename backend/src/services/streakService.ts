import prisma from "../config/database";
import { Frequency, Prisma } from "@prisma/client";

export class StreakService {
  /**
   * Recalculates the streak for a specific habit based on its frequency.
   */
  static async calculateAndWeightStreak(habitId: string): Promise<Prisma.HabitGetPayload<{ include: { logs: true } }> | null> {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { logs: { orderBy: { completedAt: "desc" } } },
    });

    if (!habit) return null;

    const { logs, targetFrequency } = habit;
    if (logs.length === 0) {
      return await prisma.habit.update({
        where: { id: habitId },
        data: { currentStreak: 0, lastLogDate: null },
        include: { logs: true },
      });
    }

    let currentStreak = 0;
    const now = new Date();
    
    // Get unique dates/periods
    const logDates = logs.map(l => new Date(l.completedAt));
    
    if (targetFrequency === Frequency.DAILY) {
      currentStreak = this.calculateDailyStreak(logDates, now);
    } else if (targetFrequency === Frequency.WEEKLY) {
      currentStreak = this.calculateWeeklyStreak(logDates, now);
    } else if (targetFrequency === Frequency.MONTHLY) {
      currentStreak = this.calculateMonthlyStreak(logDates, now);
    }

    const longestStreak = Math.max(habit.longestStreak, currentStreak);
    const lastLogDate = logDates[0];

    return await prisma.habit.update({
      where: { id: habitId },
      data: {
        currentStreak,
        longestStreak,
        lastLogDate,
      },
      include: { logs: true },
    });
  }

  private static calculateDailyStreak(dates: Date[], now: Date): number {
    const uniqueDates = Array.from(new Set(dates.map(d => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }))).sort().reverse();
    
    if (uniqueDates.length === 0) return 0;

    const getLocalDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateStr(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateStr(yesterday);

    // Check if the streak is still alive (last log today or yesterday)
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    const startDate = new Date(uniqueDates[0]);
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const expected = new Date(startDate);
        expected.setDate(startDate.getDate() - i);
        const expectedStr = getLocalDateStr(expected);
        
        if (uniqueDates[i] === expectedStr) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  }

  private static calculateWeeklyStreak(dates: Date[], now: Date): number {
    const getWeekKey = (d: Date) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const jan4 = new Date(date.getFullYear(), 0, 4);
        const weekNumber = 1 + Math.round(((date.getTime() - jan4.getTime()) / 86400000 - 3 + (jan4.getDay() + 6) % 7) / 7);
        return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    };

    const uniqueWeeks = Array.from(new Set(dates.map(getWeekKey))).sort().reverse();
    if (uniqueWeeks.length === 0) return 0;

    const currentWeekKey = getWeekKey(now);
    
    // Last week key
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekKey = getWeekKey(lastWeek);

    // Check if streak alive (last log this week or last week)
    if (uniqueWeeks[0] !== currentWeekKey && uniqueWeeks[0] !== lastWeekKey) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < uniqueWeeks.length; i++) {
        const prevWeekKey = uniqueWeeks[i-1];
        const currWeekKey = uniqueWeeks[i];
        
        // Check if currWeekKey is exactly one week before prevWeekKey
        // Complex to do with keys, easier to use dates
        const [pYear, pWeek] = prevWeekKey.split('-W').map(Number);
        const [cYear, cWeek] = currWeekKey.split('-W').map(Number);
        
        let isConsecutive = false;
        if (pYear === cYear && pWeek === cWeek + 1) {
            isConsecutive = true;
        } else if (pYear === cYear + 1 && pWeek === 1) {
            // Check if curr was the last week of previous year
            // Rough approximation: week 52 or 53
            if (cWeek >= 52) isConsecutive = true;
        }
        
        if (isConsecutive) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  }

  private static calculateMonthlyStreak(dates: Date[], now: Date): number {
    const getMonthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const uniqueMonths = Array.from(new Set(dates.map(getMonthKey))).sort().reverse();
    if (uniqueMonths.length === 0) return 0;

    const currentMonthKey = getMonthKey(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = getMonthKey(lastMonthDate);

    if (uniqueMonths[0] !== currentMonthKey && uniqueMonths[0] !== lastMonthKey) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < uniqueMonths.length; i++) {
        const [pYear, pMonth] = uniqueMonths[i-1].split('-').map(Number);
        const [cYear, cMonth] = uniqueMonths[i].split('-').map(Number);
        
        if ((pYear === cYear && pMonth === cMonth + 1) || 
            (pYear === cYear + 1 && pMonth === 1 && cMonth === 12)) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  }

  static async recalculateAllStreaks() {
    const habits = await prisma.habit.findMany({ select: { id: true } });
    for (const habit of habits) {
      await this.calculateAndWeightStreak(habit.id);
    }
  }
}
