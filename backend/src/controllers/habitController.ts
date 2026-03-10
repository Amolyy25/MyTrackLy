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
 * Get completion status for today
 */
function isCompletedToday(logs: any[]): boolean {
  if (!logs || logs.length === 0) return false;
  
  const getLocalDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateStr(new Date());
  return logs.some((log) => getLocalDateStr(new Date(log.completedAt)) === todayStr);
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

    const updatedHabit = await StreakService.calculateAndWeightStreak(habit.id);
    const completedToday = isCompletedToday(updatedHabit?.logs || habit.logs);

    res.json({
      ...updatedHabit,
      completedToday,
      streak: updatedHabit?.currentStreak,
      bestStreak: updatedHabit?.longestStreak,
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
    const getLocalDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateStr(new Date());

    // On récupère tous les logs de l'habitude pour vérifier aujourd'hui
    // (Plus robuste que findFirst avec des dates complexes)
    const allLogs = await prisma.habitLog.findMany({
      where: { habitId: id }
    });

    const existingLog = allLogs.find(log => getLocalDateStr(new Date(log.completedAt)) === todayStr);

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

    const updatedHabit = await StreakService.calculateAndWeightStreak(id);
    const completedToday = isCompletedToday(updatedHabit?.logs || []);

    res.json({
      habit: {
        ...updatedHabit!,
        completedToday,
        streak: updatedHabit?.currentStreak,
        bestStreak: updatedHabit?.longestStreak,
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
