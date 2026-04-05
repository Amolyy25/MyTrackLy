import { Request, Response } from "express";
import prisma from "../config/database";

/**
 * Utility: validate a date string, return Date or null if invalid.
 */
function parseDate(value: string): Date | null {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Creates a training plan with nested PlanDays and PlanExercises.
 * A single prisma.trainingPlan.create with nested writes is already atomic.
 */
export async function createPlan(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
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
      days,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Le nom du plan est requis" });
    }

    if (!Array.isArray(days)) {
      return res.status(400).json({ message: "Le champ 'days' doit etre un tableau" });
    }

    // Validate dates if provided
    if (startDate) {
      const parsed = parseDate(startDate);
      if (!parsed) {
        return res.status(400).json({ message: "startDate est une date invalide" });
      }
    }
    if (endDate) {
      const parsed = parseDate(endDate);
      if (!parsed) {
        return res.status(400).json({ message: "endDate est une date invalide" });
      }
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

      // Validate exercises if present
      if (Array.isArray(day.exercises)) {
        for (let j = 0; j < day.exercises.length; j++) {
          const ex = day.exercises[j];
          if (!ex.plannedSets || !Number.isInteger(ex.plannedSets) || ex.plannedSets <= 0) {
            return res.status(400).json({
              message: `Jour ${i}, exercice ${j}: plannedSets doit etre un entier > 0`,
            });
          }
          if (!ex.plannedReps || !Number.isInteger(ex.plannedReps) || ex.plannedReps <= 0) {
            return res.status(400).json({
              message: `Jour ${i}, exercice ${j}: plannedReps doit etre un entier > 0`,
            });
          }
        }
      }
    }

    const plan = await prisma.trainingPlan.create({
      data: {
        userId,
        name: name.trim(),
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        targetWeightKg: targetWeightKg !== undefined ? targetWeightKg : undefined,
        bodyGoal: bodyGoal !== undefined ? bodyGoal : undefined,
        customGoal: customGoal !== undefined ? customGoal : undefined,
        initialWeightKg: initialWeightKg !== undefined ? initialWeightKg : undefined,
        initialNotes: initialNotes !== undefined ? initialNotes : undefined,
        days: {
          create: days.map((day: any) => ({
            dayOfWeek: day.dayOfWeek,
            timeOfDay: day.timeOfDay,
            label: day.label !== undefined ? day.label : undefined,
            trainingType: day.trainingType,
            customType: day.customType !== undefined ? day.customType : undefined,
            exercises: {
              create: Array.isArray(day.exercises)
                ? day.exercises.map((ex: any, idx: number) => ({
                    exerciseId: ex.exerciseId,
                    plannedSets: ex.plannedSets,
                    plannedReps: ex.plannedReps,
                    plannedWeightKg: ex.plannedWeightKg !== undefined ? ex.plannedWeightKg : undefined,
                    orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : idx,
                    notes: ex.notes !== undefined ? ex.notes : undefined,
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

    res.status(201).json(plan);
  } catch (error: any) {
    console.error("Error creating training plan:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Un ou plusieurs exercices n'existent pas dans la base de donnees",
        error: "Foreign key constraint violation",
      });
    }

    res.status(500).json({
      message: "Une erreur est survenue lors de la creation du plan",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Returns all training plans for the authenticated user with pagination.
 * Active plans first, then by createdAt desc.
 */
export async function getMyPlans(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const plans = await prisma.trainingPlan.findMany({
      where: { userId },
      include: {
        days: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
    });

    res.json(plans);
  } catch (error) {
    console.error("Error fetching training plans:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Gets a training plan by id, checking ownership via combined query.
 * Includes days with exercises and last 5 sessions.
 */
export async function getPlanById(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id } = req.params;

    const plan = await prisma.trainingPlan.findFirst({
      where: { id, userId },
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
      return res.status(404).json({ message: "Plan non trouve" });
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
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id } = req.params;

    // Check ownership via combined query
    const existingPlan = await prisma.trainingPlan.findFirst({ where: { id, userId } });

    if (!existingPlan) {
      return res.status(404).json({ message: "Plan non trouve" });
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

    // Validate dates if provided
    if (startDate !== undefined && startDate !== null) {
      const parsed = parseDate(startDate);
      if (!parsed) {
        return res.status(400).json({ message: "startDate est une date invalide" });
      }
    }
    if (endDate !== undefined && endDate !== null) {
      const parsed = parseDate(endDate);
      if (!parsed) {
        return res.status(400).json({ message: "endDate est une date invalide" });
      }
    }

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
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id } = req.params;

    const existingPlan = await prisma.trainingPlan.findFirst({ where: { id, userId } });

    if (!existingPlan) {
      return res.status(404).json({ message: "Plan non trouve" });
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
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id } = req.params;

    const plan = await prisma.trainingPlan.findFirst({
      where: { id, userId },
      include: {
        days: true,
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
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
 * Returns AI suggestions for a training plan.
 */
export async function getAISuggestions(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id } = req.params;

    // Fetch plan with full context
    const plan = await prisma.trainingPlan.findFirst({
      where: { id, userId },
      include: {
        user: { select: { name: true, goalType: true, role: true } },
        days: {
          include: {
            exercises: { include: { exercise: true }, orderBy: { orderIndex: "asc" } },
          },
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
    }

    // Get recent sessions (last 10)
    const recentSessions = await prisma.planSessionLog.findMany({
      where: { planId: id },
      orderBy: { date: "desc" },
      take: 10,
    });

    // Get recent mood logs (last 5 with mood data)
    const recentMoodLogs = await prisma.planSessionLog.findMany({
      where: { planId: id, moodScore: { not: null } },
      orderBy: { date: "desc" },
      take: 5,
    });

    // Get latest measurement
    const latestMeasurement = await prisma.measurement.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // Calculate weight trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const measurements = await prisma.measurement.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
        bodyWeightKg: { not: null },
      },
      orderBy: { date: "asc" },
    });

    let weightTrend: number | null = null;
    if (measurements.length >= 2) {
      const first = measurements[0].bodyWeightKg!;
      const last = measurements[measurements.length - 1].bodyWeightKg!;
      weightTrend = last - first;
    }

    // Import and call gemini service
    const { getAISuggestions: fetchSuggestions } = await import("../services/geminiService");

    const suggestions = await fetchSuggestions({
      user: { name: plan.user.name, goalType: plan.user.goalType, role: plan.user.role },
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
      recentSessions: recentSessions.map((s) => ({
        date: s.date,
        durationMinutes: null,
        notes: s.performanceNote,
        exercises: [],
      })),
      recentMoodLogs: recentMoodLogs.map((s) => ({
        date: s.date,
        moodScore: s.moodScore,
        moodNote: s.moodNote,
        performanceNote: s.performanceNote,
      })),
      latestMeasurement: latestMeasurement
        ? {
            bodyWeightKg: latestMeasurement.bodyWeightKg,
            waistCm: latestMeasurement.waistCm,
            chestCm: latestMeasurement.chestCm,
          }
        : null,
      weightTrend,
    });

    res.json({ suggestions });
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Creates a PlanSessionLog for a plan.
 */
export async function logPlanSession(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

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

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      return res.status(400).json({ message: "La date fournie est invalide" });
    }

    if (moodScore !== undefined && moodScore !== null) {
      if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5) {
        return res.status(400).json({ message: "moodScore doit etre un entier entre 1 et 5" });
      }
    }

    // Check plan ownership via combined query
    const plan = await prisma.trainingPlan.findFirst({ where: { id, userId } });

    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
    }

    // Validate planDayId belongs to this plan
    if (planDayId) {
      const planDay = await prisma.planDay.findFirst({
        where: { id: planDayId, planId: id },
      });
      if (!planDay) {
        return res.status(400).json({
          message: "Le jour de plan specifie n'appartient pas a ce plan",
        });
      }
    }

    // If trainingSessionId provided, verify it belongs to the user
    if (trainingSessionId) {
      const trainingSession = await prisma.trainingSession.findFirst({
        where: { id: trainingSessionId, userId },
      });

      if (!trainingSession) {
        return res.status(400).json({
          message: "La seance d'entrainement n'existe pas ou ne vous appartient pas",
        });
      }
    }

    // If not skipped and no trainingSessionId provided, create a real TrainingSession
    let finalTrainingSessionId = trainingSessionId;
    if (!skipped && !finalTrainingSessionId && planDayId) {
      // Fetch plan day with its exercises to copy them
      const planDay = await prisma.planDay.findFirst({
        where: { id: planDayId },
        include: { exercises: true },
      });

      if (planDay) {
        const newSession = await prisma.trainingSession.create({
          data: {
            userId,
            date: parsedDate,
            notes: moodNote || performanceNote || `Séance du plan: ${plan.name}`,
            exercises: {
              create: planDay.exercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                sets: ex.plannedSets,
                repsUniform: ex.plannedReps,
                weightKg: ex.plannedWeightKg,
                orderIndex: ex.orderIndex,
              })),
            },
          },
        });
        finalTrainingSessionId = newSession.id;
      }
    }

    const log = await prisma.planSessionLog.create({
      data: {
        planId: id,
        planDayId: planDayId !== undefined ? planDayId : undefined,
        trainingSessionId: finalTrainingSessionId !== undefined ? finalTrainingSessionId : undefined,
        date: parsedDate,
        moodScore: moodScore !== undefined ? moodScore : undefined,
        moodNote: moodNote !== undefined ? moodNote : undefined,
        performanceNote: performanceNote !== undefined ? performanceNote : undefined,
        skipped: skipped !== undefined ? skipped : false,
        skipReason: skipReason !== undefined ? skipReason : undefined,
      },
    });

    res.status(201).json(log);
  } catch (error: any) {
    console.error("Error logging plan session:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Une entree pour cette seance existe deja",
      });
    }

    res.status(500).json({
      message: "Une erreur est survenue lors de l'enregistrement",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Adds a new PlanDay to an existing plan.
 */
export async function addPlanDay(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id } = req.params;
    const { dayOfWeek, timeOfDay, trainingType, customType, label } = req.body;

    const plan = await prisma.trainingPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
    }

    if (dayOfWeek === undefined || dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ message: "dayOfWeek doit etre entre 0 et 6" });
    }

    const timeOfDayRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeOfDay || !timeOfDayRegex.test(timeOfDay)) {
      return res.status(400).json({ message: "timeOfDay doit etre au format HH:mm" });
    }

    if (!trainingType || !trainingType.trim()) {
      return res.status(400).json({ message: "trainingType est requis" });
    }

    const day = await prisma.planDay.create({
      data: {
        planId: id,
        dayOfWeek,
        timeOfDay,
        trainingType,
        customType: customType !== undefined ? customType : undefined,
        label: label !== undefined ? label : undefined,
      },
      include: {
        exercises: { include: { exercise: true }, orderBy: { orderIndex: "asc" } },
      },
    });

    res.status(201).json(day);
  } catch (error) {
    console.error("Error adding plan day:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Updates an existing PlanDay.
 */
export async function updatePlanDay(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id, dayId } = req.params;
    const { timeOfDay, trainingType, customType, label } = req.body;

    const plan = await prisma.trainingPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
    }

    const existingDay = await prisma.planDay.findFirst({ where: { id: dayId, planId: id } });
    if (!existingDay) {
      return res.status(404).json({ message: "Jour non trouve" });
    }

    if (timeOfDay !== undefined) {
      const timeOfDayRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeOfDayRegex.test(timeOfDay)) {
        return res.status(400).json({ message: "timeOfDay doit etre au format HH:mm" });
      }
    }

    const updatedDay = await prisma.planDay.update({
      where: { id: dayId },
      data: {
        timeOfDay: timeOfDay !== undefined ? timeOfDay : undefined,
        trainingType: trainingType !== undefined ? trainingType : undefined,
        customType: customType !== undefined ? customType : undefined,
        label: label !== undefined ? label : undefined,
      },
      include: {
        exercises: { include: { exercise: true }, orderBy: { orderIndex: "asc" } },
      },
    });

    res.json(updatedDay);
  } catch (error) {
    console.error("Error updating plan day:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Deletes a PlanDay (cascade removes exercises).
 */
export async function deletePlanDay(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id, dayId } = req.params;

    const plan = await prisma.trainingPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
    }

    const existingDay = await prisma.planDay.findFirst({ where: { id: dayId, planId: id } });
    if (!existingDay) {
      return res.status(404).json({ message: "Jour non trouve" });
    }

    await prisma.planDay.delete({ where: { id: dayId } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting plan day:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Adds a new PlanExercise to a PlanDay.
 */
export async function addPlanExercise(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id, dayId } = req.params;
    const { exerciseId, plannedSets, plannedReps, plannedWeightKg } = req.body;

    const plan = await prisma.trainingPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
    }

    const day = await prisma.planDay.findFirst({ where: { id: dayId, planId: id } });
    if (!day) {
      return res.status(404).json({ message: "Jour non trouve" });
    }

    if (!plannedSets || !Number.isInteger(plannedSets) || plannedSets <= 0) {
      return res.status(400).json({ message: "plannedSets doit etre un entier > 0" });
    }

    if (!plannedReps || !Number.isInteger(plannedReps) || plannedReps <= 0) {
      return res.status(400).json({ message: "plannedReps doit etre un entier > 0" });
    }

    // Auto-assign orderIndex = current max + 1
    const maxOrderResult = await prisma.planExercise.aggregate({
      where: { planDayId: dayId },
      _max: { orderIndex: true },
    });
    const nextOrderIndex = (maxOrderResult._max.orderIndex ?? -1) + 1;

    const exercise = await prisma.planExercise.create({
      data: {
        planDayId: dayId,
        exerciseId,
        plannedSets,
        plannedReps,
        plannedWeightKg: plannedWeightKg !== undefined ? plannedWeightKg : undefined,
        orderIndex: nextOrderIndex,
      },
      include: { exercise: true },
    });

    res.status(201).json(exercise);
  } catch (error: any) {
    console.error("Error adding plan exercise:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "L'exercice n'existe pas dans la base de donnees",
      });
    }

    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Updates an existing PlanExercise.
 */
export async function updatePlanExercise(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id, dayId, exId } = req.params;
    const { plannedSets, plannedReps, plannedWeightKg, notes } = req.body;

    const plan = await prisma.trainingPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
    }

    const day = await prisma.planDay.findFirst({ where: { id: dayId, planId: id } });
    if (!day) {
      return res.status(404).json({ message: "Jour non trouve" });
    }

    const existingExercise = await prisma.planExercise.findFirst({ where: { id: exId, planDayId: dayId } });
    if (!existingExercise) {
      return res.status(404).json({ message: "Exercice non trouve" });
    }

    const updatedExercise = await prisma.planExercise.update({
      where: { id: exId },
      data: {
        plannedSets: plannedSets !== undefined ? plannedSets : undefined,
        plannedReps: plannedReps !== undefined ? plannedReps : undefined,
        plannedWeightKg: plannedWeightKg !== undefined ? plannedWeightKg : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      include: { exercise: true },
    });

    res.json(updatedExercise);
  } catch (error) {
    console.error("Error updating plan exercise:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Deletes a PlanExercise.
 */
export async function deletePlanExercise(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifie (userId manquant)" });
    }

    const { id, dayId, exId } = req.params;

    const plan = await prisma.trainingPlan.findFirst({ where: { id, userId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan non trouve" });
    }

    const day = await prisma.planDay.findFirst({ where: { id: dayId, planId: id } });
    if (!day) {
      return res.status(404).json({ message: "Jour non trouve" });
    }

    const existingExercise = await prisma.planExercise.findFirst({ where: { id: exId, planDayId: dayId } });
    if (!existingExercise) {
      return res.status(404).json({ message: "Exercice non trouve" });
    }

    await prisma.planExercise.delete({ where: { id: exId } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting plan exercise:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}
