import { Request, Response } from "express";
import prisma from "../config/database";

/**
 * Utility function to extract userId from req.user and handle errors.
 */
function getUserIdFromRequest(req: Request, res: Response): string | undefined {
  const userPayload = (req as any).user;
  const userId = userPayload && (userPayload.userId || userPayload.id);
  if (!userId) {
    res.status(401).json({ message: "Utilisateur non authentifié (userId manquant)" });
    return undefined;
  }
  return userId;
}

/**
 * Creates a training plan with nested PlanDays and PlanExercises in a Prisma transaction.
 */
export async function createPlan(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const {
      name,
      description,
      isActive,
      startDate,
      endDate,
      targetWeightKg,
      bodyGoal,
      customGoal,
      initialWeightKg,
      initialNotes,
      days,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Le nom du plan est requis" });
    }

    if (!Array.isArray(days)) {
      return res.status(400).json({ message: "Le champ 'days' doit être un tableau" });
    }

    const timeOfDayRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    for (let i = 0; i < days.length; i++) {
      const day = days[i];

      if (day.dayOfWeek === undefined || day.dayOfWeek === null || day.dayOfWeek < 0 || day.dayOfWeek > 6) {
        return res.status(400).json({
          message: `Le jour ${i} doit avoir un 'dayOfWeek' entre 0 et 6`,
        });
      }

      if (!day.timeOfDay || !timeOfDayRegex.test(day.timeOfDay)) {
        return res.status(400).json({
          message: `Le jour ${i} doit avoir un 'timeOfDay' au format HH:mm`,
        });
      }

      if (!day.trainingType || !day.trainingType.trim()) {
        return res.status(400).json({
          message: `Le jour ${i} doit avoir un 'trainingType'`,
        });
      }
    }

    const plan = await prisma.$transaction(async (tx) => {
      return tx.trainingPlan.create({
        data: {
          userId,
          name: name.trim(),
          description: description || undefined,
          isActive: isActive !== undefined ? isActive : true,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          targetWeightKg: targetWeightKg || undefined,
          bodyGoal: bodyGoal || undefined,
          customGoal: customGoal || undefined,
          initialWeightKg: initialWeightKg || undefined,
          initialNotes: initialNotes || undefined,
          days: {
            create: days.map((day: any) => ({
              dayOfWeek: day.dayOfWeek,
              timeOfDay: day.timeOfDay,
              label: day.label || undefined,
              trainingType: day.trainingType,
              customType: day.customType || undefined,
              exercises: {
                create: Array.isArray(day.exercises)
                  ? day.exercises.map((ex: any, idx: number) => ({
                      exerciseId: ex.exerciseId,
                      plannedSets: ex.plannedSets,
                      plannedReps: ex.plannedReps,
                      plannedWeightKg: ex.plannedWeightKg || undefined,
                      orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : idx,
                      notes: ex.notes || undefined,
                    }))
                  : [],
              },
            })),
          },
        },
        include: {
          days: {
            include: {
              exercises: {
                include: {
                  exercise: true,
                },
                orderBy: { orderIndex: "asc" },
              },
            },
            orderBy: { dayOfWeek: "asc" },
          },
        },
      });
    });

    res.status(201).json(plan);
  } catch (error: any) {
    console.error("Error creating training plan:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Un ou plusieurs exercices n'existent pas dans la base de données",
        error: "Foreign key constraint violation",
      });
    }

    res.status(500).json({
      message: "Une erreur est survenue lors de la création du plan",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Returns all training plans for the authenticated user.
 * Active plans first, then by createdAt desc.
 */
export async function getMyPlans(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const plans = await prisma.trainingPlan.findMany({
      where: { userId },
      include: {
        days: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    res.json(plans);
  } catch (error) {
    console.error("Error fetching training plans:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Gets a training plan by id, checking ownership.
 * Includes days with exercises and last 5 sessions.
 */
export async function getPlanById(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    const plan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        days: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { dayOfWeek: "asc" },
        },
        sessions: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan non trouvé" });
    }

    if (plan.userId !== userId) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    res.json(plan);
  } catch (error) {
    console.error("Error fetching training plan:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Updates plan fields (not days).
 */
export async function updatePlan(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Check ownership
    const existingPlan = await prisma.trainingPlan.findUnique({ where: { id } });

    if (!existingPlan) {
      return res.status(404).json({ message: "Plan non trouvé" });
    }

    if (existingPlan.userId !== userId) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const {
      name,
      description,
      isActive,
      startDate,
      endDate,
      targetWeightKg,
      bodyGoal,
      customGoal,
      initialWeightKg,
      initialNotes,
    } = req.body;

    const updatedPlan = await prisma.trainingPlan.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        targetWeightKg: targetWeightKg !== undefined ? targetWeightKg : undefined,
        bodyGoal: bodyGoal !== undefined ? bodyGoal : undefined,
        customGoal: customGoal !== undefined ? customGoal : undefined,
        initialWeightKg: initialWeightKg !== undefined ? initialWeightKg : undefined,
        initialNotes: initialNotes !== undefined ? initialNotes : undefined,
      },
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error("Error updating training plan:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Deletes a training plan (cascade handles days/exercises/logs).
 */
export async function deletePlan(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    const existingPlan = await prisma.trainingPlan.findUnique({ where: { id } });

    if (!existingPlan) {
      return res.status(404).json({ message: "Plan non trouvé" });
    }

    if (existingPlan.userId !== userId) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await prisma.trainingPlan.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting training plan:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Returns progress stats for a plan (last 30 days).
 */
export async function getPlanProgress(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    const plan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        days: true,
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan non trouvé" });
    }

    if (plan.userId !== userId) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all session logs in last 30 days
    const logs = await prisma.planSessionLog.findMany({
      where: {
        planId: id,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: "desc" },
    });

    const totalLoggedSessions = logs.filter((l) => !l.skipped).length;
    const skippedSessions = logs.filter((l) => l.skipped).length;

    // totalPlannedSessions: count unique (planDayId, week) combinations in last 30 days
    // Each plan day occurs once per week, so for 30 days (~4.28 weeks), count per day
    const planDaysCount = plan.days.length;
    // Number of weeks in 30 days (floor)
    const weeksInPeriod = Math.floor(30 / 7);
    const remainingDays = 30 % 7;

    // Count how many times each day of week occurs in the last 30 days
    let totalPlannedSessions = 0;
    const dayOfWeekCounts: Record<number, number> = {};

    for (let d = 0; d < 30; d++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - d);
      const dow = checkDate.getDay();
      dayOfWeekCounts[dow] = (dayOfWeekCounts[dow] || 0) + 1;
    }

    for (const planDay of plan.days) {
      totalPlannedSessions += dayOfWeekCounts[planDay.dayOfWeek] || 0;
    }

    const completionRate =
      totalPlannedSessions > 0
        ? Math.round((totalLoggedSessions / totalPlannedSessions) * 100)
        : 0;

    // Average mood score from logs that have one
    const logsWithMood = logs.filter((l) => l.moodScore !== null && l.moodScore !== undefined);
    const averageMoodScore =
      logsWithMood.length > 0
        ? logsWithMood.reduce((sum, l) => sum + (l.moodScore as number), 0) / logsWithMood.length
        : null;

    // Streak: consecutive days with a logged session looking backward from today
    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loggedDates = new Set(
      logs
        .filter((l) => !l.skipped)
        .map((l) => {
          const d = new Date(l.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
    );

    let checkDate = new Date(today);
    while (loggedDates.has(checkDate.getTime())) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Weekly breakdown: last 4 weeks
    const weeklyBreakdown = [];
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      weekEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const weekLogs = logs.filter((l) => {
        const logDate = new Date(l.date);
        return logDate >= weekStart && logDate <= weekEnd;
      });

      // Planned for this week: count plan days whose dayOfWeek falls in this week
      let weekPlanned = 0;
      const dayOfWeekCountsThisWeek: Record<number, number> = {};
      const tempDate = new Date(weekStart);
      while (tempDate <= weekEnd) {
        const dow = tempDate.getDay();
        dayOfWeekCountsThisWeek[dow] = (dayOfWeekCountsThisWeek[dow] || 0) + 1;
        tempDate.setDate(tempDate.getDate() + 1);
      }
      for (const planDay of plan.days) {
        weekPlanned += dayOfWeekCountsThisWeek[planDay.dayOfWeek] || 0;
      }

      weeklyBreakdown.push({
        weekStart: weekStart.toISOString(),
        planned: weekPlanned,
        logged: weekLogs.filter((l) => !l.skipped).length,
      });
    }

    res.json({
      totalPlannedSessions,
      totalLoggedSessions,
      skippedSessions,
      completionRate,
      averageMoodScore,
      streakDays,
      weeklyBreakdown,
    });
  } catch (error) {
    console.error("Error fetching plan progress:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Placeholder for AI suggestions — returns 501.
 */
export async function getAISuggestions(req: Request, res: Response) {
  res.status(501).json({ message: "AI suggestions not yet implemented" });
}

/**
 * Creates a PlanSessionLog for a plan.
 */
export async function logPlanSession(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;
    const {
      planDayId,
      trainingSessionId,
      date,
      moodScore,
      moodNote,
      performanceNote,
      skipped,
      skipReason,
    } = req.body;

    // Validation
    if (!date) {
      return res.status(400).json({ message: "La date est requise" });
    }

    if (moodScore !== undefined && moodScore !== null) {
      if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5) {
        return res.status(400).json({ message: "moodScore doit être un entier entre 1 et 5" });
      }
    }

    // Check plan ownership
    const plan = await prisma.trainingPlan.findUnique({ where: { id } });

    if (!plan) {
      return res.status(404).json({ message: "Plan non trouvé" });
    }

    if (plan.userId !== userId) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    // If trainingSessionId provided, verify it belongs to the user
    if (trainingSessionId) {
      const trainingSession = await prisma.trainingSession.findFirst({
        where: { id: trainingSessionId, userId },
      });

      if (!trainingSession) {
        return res.status(400).json({
          message: "La séance d'entraînement n'existe pas ou ne vous appartient pas",
        });
      }
    }

    const log = await prisma.planSessionLog.create({
      data: {
        planId: id,
        planDayId: planDayId || undefined,
        trainingSessionId: trainingSessionId || undefined,
        date: new Date(date),
        moodScore: moodScore || undefined,
        moodNote: moodNote || undefined,
        performanceNote: performanceNote || undefined,
        skipped: skipped !== undefined ? skipped : false,
        skipReason: skipReason || undefined,
      },
    });

    res.status(201).json(log);
  } catch (error: any) {
    console.error("Error logging plan session:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Une entrée pour cette séance existe déjà",
      });
    }

    res.status(500).json({
      message: "Une erreur est survenue lors de l'enregistrement",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
