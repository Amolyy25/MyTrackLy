import { Request, Response } from "express";
import prisma from "../config/database";
import { StreakService } from "../services/streakService";
import { Frequency } from "@prisma/client";

/**
 * Utility function to extract userId from req.user and handle errors.
 */
function getUserIdFromRequest(req: Request, res: Response): string | undefined {
  const userPayload = (req as any).user;
  const userId = userPayload && (userPayload.userId || userPayload.id);
  if (!userId) {
    res
      .status(401)
      .json({ message: "Utilisateur non authentifié (userId manquant)" });
    return undefined;
  }
  return userId;
}

/**
 * Calculate streak for a habit (consecutive days with at least one log)
 */
async function calculateStreak(habitId: string): Promise<{ current: number; best: number }> {
  const logs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { completedAt: "desc" },
  });

  if (logs.length === 0) {
    return { current: 0, best: 0 };
  }

  // Get unique dates (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      logs.map((log) => {
        const date = new Date(log.completedAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort descending

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const dateStr = uniqueDates[i];
    const [year, month, day] = dateStr.split("-").map(Number);
    const logDate = new Date(year, month - 1, day);
    logDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);
    
    if (logDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate best streak
  let bestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const [year1, month1, day1] = uniqueDates[i - 1].split("-").map(Number);
    const [year2, month2, day2] = uniqueDates[i].split("-").map(Number);
    const date1 = new Date(year1, month1 - 1, day1);
    const date2 = new Date(year2, month2 - 1, day2);
    
    const diffDays = Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { current: currentStreak, best: bestStreak };
}

/**
 * Get completion status for today
 */
function isCompletedToday(logs: any[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  return logs.some((log) => {
    const logDate = new Date(log.completedAt);
    return logDate >= today && logDate <= todayEnd;
  });
}

// --- Récupérer toutes les habitudes de l'utilisateur ---
export async function getHabits(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { studentId } = req.query; // For coach viewing student habits

    // If studentId is provided, verify coach access
    let targetUserId = userId;
    if (studentId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== "coach") {
        return res.status(403).json({
          message: "Seuls les coaches peuvent voir les habitudes de leurs élèves.",
        });
      }

      const student = await prisma.user.findFirst({
        where: {
          id: studentId as string,
          coachId: userId,
          role: "eleve",
        },
      });

      if (!student) {
        return res.status(404).json({
          message: "Élève non trouvé ou vous n'avez pas accès à cet élève.",
        });
      }

      targetUserId = studentId as string;
    }

    const habits = await prisma.habit.findMany({
      where: { userId: targetUserId },
      include: {
        logs: {
          orderBy: { completedAt: "desc" },
          take: 30, // Last 30 logs for performance
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with completion status
    const enrichedHabits = habits.map((habit) => {
      const completedToday = isCompletedToday(habit.logs);

      return {
        ...habit,
        completedToday,
        streak: habit.currentStreak,
        bestStreak: habit.longestStreak,
      };
    });

    res.json(enrichedHabits);
  } catch (error) {
    console.error("GetHabits Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des habitudes.",
    });
  }
}

// --- Récupérer une habitude spécifique ---
export async function getHabit(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        logs: {
          orderBy: { completedAt: "desc" },
        },
      },
    });

    if (!habit) {
      res.status(404).json({
        message: "Habitude non trouvée.",
      });
      return;
    }

    const completedToday = isCompletedToday(habit.logs);

    res.json({
      ...habit,
      completedToday,
      streak: habit.currentStreak,
      bestStreak: habit.longestStreak,
    });
  } catch (error) {
    console.error("GetHabit Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération de l'habitude.",
    });
  }
}

// --- Créer une nouvelle habitude ---
export async function createHabit(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const {
      name,
      category,
      targetFrequency,
      targetCount,
      reminderTime,
      reminderEnabled = true,
      startDate,
    } = req.body;

    if (!name || !category || !targetFrequency) {
      return res.status(400).json({
        message: "Le nom, la catégorie et la fréquence cible sont requis.",
      });
    }

    const validCategories = ["hydration", "sleep", "nutrition", "exercise", "wellness"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: `Catégorie invalide. Valeurs acceptées: ${validCategories.join(", ")}`,
      });
    }

    const validFrequencies = ["DAILY", "WEEKLY", "MONTHLY"];
    if (!validFrequencies.includes(targetFrequency.toUpperCase())) {
      return res.status(400).json({
        message: "Fréquence invalide. Valeurs acceptées: DAILY, WEEKLY, MONTHLY",
      });
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        category,
        targetFrequency: targetFrequency.toUpperCase() as Frequency,
        targetCount: targetCount ? parseFloat(targetCount) : null,
        reminderTime: reminderTime || null,
        reminderEnabled: reminderEnabled !== false,
        startDate: startDate ? new Date(startDate) : new Date(),
      },
    });

    res.status(201).json({
      ...habit,
      completedToday: false,
      streak: 0,
      bestStreak: 0,
      logs: [],
    });
  } catch (error) {
    console.error("CreateHabit Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création de l'habitude.",
    });
  }
}

// --- Modifier une habitude ---
export async function updateHabit(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;
    const {
      name,
      category,
      targetFrequency,
      targetCount,
      reminderTime,
      reminderEnabled,
      startDate,
    } = req.body;

    // Vérifier que l'habitude appartient à l'utilisateur
    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingHabit) {
      return res.status(404).json({
        message: "Habitude non trouvée ou vous n'avez pas accès à cette habitude.",
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) {
      const validCategories = ["hydration", "sleep", "nutrition", "exercise", "wellness"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          message: `Catégorie invalide. Valeurs acceptées: ${validCategories.join(", ")}`,
        });
      }
      updateData.category = category;
    }
    if (targetFrequency !== undefined) {
      const validFrequencies = ["DAILY", "WEEKLY", "MONTHLY"];
      if (!validFrequencies.includes(targetFrequency.toUpperCase())) {
        return res.status(400).json({
          message: "Fréquence invalide. Valeurs acceptées: DAILY, WEEKLY, MONTHLY",
        });
      }
      updateData.targetFrequency = targetFrequency.toUpperCase() as Frequency;
    }
    if (targetCount !== undefined) updateData.targetCount = targetCount ? parseFloat(targetCount) : null;
    if (reminderTime !== undefined) updateData.reminderTime = reminderTime || null;
    if (reminderEnabled !== undefined) updateData.reminderEnabled = reminderEnabled;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);

    const habit = await prisma.habit.update({
      where: { id },
      data: updateData,
      include: {
        logs: {
          orderBy: { completedAt: "desc" },
          take: 30,
        },
      },
    });

    const streak = await calculateStreak(habit.id);
    const completedToday = isCompletedToday(habit.logs);

    res.json({
      ...habit,
      completedToday,
      streak: streak.current,
      bestStreak: streak.best,
    });
  } catch (error) {
    console.error("UpdateHabit Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la modification de l'habitude.",
    });
  }
}

// --- Supprimer une habitude ---
export async function deleteHabit(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habitude non trouvée ou vous n'avez pas accès à cette habitude.",
      });
    }

    await prisma.habit.delete({
      where: { id },
    });

    res.json({ message: "Habitude supprimée avec succès." });
  } catch (error) {
    console.error("DeleteHabit Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression de l'habitude.",
    });
  }
}

// --- Marquer une habitude comme complétée (aujourd'hui) ---
export async function checkHabit(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;
    const { value } = req.body; // Optional value for quantifiable habits

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habitude non trouvée ou vous n'avez pas accès à cette habitude.",
      });
    }

    // Check if already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        completedAt: {
          gte: today,
          lte: todayEnd,
        },
      },
    });

    if (existingLog) {
      return res.status(400).json({
        message: "Cette habitude est déjà complétée aujourd'hui.",
      });
    }

    // Create log
    const log = await prisma.habitLog.create({
      data: {
        habitId: id,
        completedAt: new Date(),
        value: value ? parseFloat(value) : null,
      },
    });

    // Update streak immediately
    const updatedHabitWithStreak = await StreakService.calculateAndWeightStreak(id);

    res.json({
      habit: {
        ...updatedHabitWithStreak!,
        completedToday: true,
        streak: updatedHabitWithStreak!.currentStreak,
        bestStreak: updatedHabitWithStreak!.longestStreak,
      },
      log,
    });
  } catch (error) {
    console.error("CheckHabit Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la complétion de l'habitude.",
    });
  }
}

// --- Démarquer une habitude (uncheck aujourd'hui) ---
export async function uncheckHabit(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Vérifier que l'habitude appartient à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habitude non trouvée ou vous n'avez pas accès à cette habitude.",
      });
    }

    // Find today's log
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const log = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        completedAt: {
          gte: today,
          lte: todayEnd,
        },
      },
    });

    if (!log) {
      return res.status(404).json({
        message: "Aucune complétion trouvée pour aujourd'hui.",
      });
    }

    await prisma.habitLog.delete({
      where: { id: log.id },
    });

    const updatedHabit = await prisma.habit.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { completedAt: "desc" },
          take: 30,
        },
      },
    });

    const streak = await calculateStreak(id);
    const completedToday = isCompletedToday(updatedHabit!.logs);

    res.json({
      habit: {
        ...updatedHabit!,
        completedToday,
        streak: streak.current,
        bestStreak: streak.best,
      },
    });
  } catch (error) {
    console.error("UncheckHabit Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la décomplétion de l'habitude.",
    });
  }
}

// --- Récupérer les statistiques des habitudes ---
export async function getHabitStats(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    // Convertir range en string pour éviter les erreurs de type
    const rangeParam = req.query.range;
    const range = typeof rangeParam === "string" ? rangeParam : Array.isArray(rangeParam) ? rangeParam[0] : "7d";
    const rangeString = typeof range === "string" ? range : "7d";

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        logs: true,
      },
    });

    const now = new Date();
    let startDate: Date;
    switch (rangeString) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const stats = habits.map((habit) => {
      const logsInRange = habit.logs.filter(
        (log) => new Date(log.completedAt) >= startDate
      );

      // Weekly heatmap data (last 7 days)
      const heatmapData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        const hasLog = habit.logs.some(
          (log) =>
            new Date(log.completedAt) >= date &&
            new Date(log.completedAt) <= dateEnd
        );
        heatmapData.push({
          date: date.toISOString().split("T")[0],
          completed: hasLog,
        });
      }

      // Calcul du completionRate
      let completionRate = 0;
      if (rangeString === "all") {
        const daysSinceStart = Math.max(
          1,
          Math.floor(
            (now.getTime() - new Date(habit.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        completionRate = logsInRange.length / daysSinceStart;
      } else {
        const days = parseInt(rangeString.replace("d", ""), 10);
        completionRate = days > 0 ? logsInRange.length / days : 0;
      }

      return {
        habitId: habit.id,
        habitName: habit.name,
        streak: habit.currentStreak,
        bestStreak: habit.longestStreak,
        completionRate,
        heatmap: heatmapData,
      };
    });

    res.json({ stats, dateRange: { from: startDate.toISOString(), to: now.toISOString() } });
  } catch (error) {
    console.error("GetHabitStats Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des statistiques.",
    });
  }
}
