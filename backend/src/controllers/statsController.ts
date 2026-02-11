import { Request, Response } from "express";
import prisma from "../config/database";

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
 * Calculate date range from query parameter
 */
function getDateRange(range?: string): { from: Date; to: Date } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date();

  switch (range) {
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      break;
    case "1y":
      from.setFullYear(from.getFullYear() - 1);
      break;
    default:
      // Default to 30 days
      from.setDate(from.getDate() - 30);
  }

  from.setHours(0, 0, 0, 0);
  return { from, to };
}

/**
 * Calculate volume for a session exercise
 */
function calculateExerciseVolume(ex: any): number {
  const reps = ex.repsUniform
    ? ex.sets * ex.repsUniform
    : ex.repsPerSet
    ? (ex.repsPerSet as number[]).reduce((sum, r) => sum + r, 0)
    : 0;
  return reps * (ex.weightKg || 0);
}

/**
 * GET /api/stats/sessions
 * Get detailed session statistics
 */
export async function getSessionsStats(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { range = "30d" } = req.query;
    const { from, to } = getDateRange(range as string);

    // Get sessions in date range
    const sessions = await prisma.trainingSession.findMany({
      where: {
        userId,
        date: { gte: from, lte: to },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Calculate stats
    let totalVolume = 0;
    let totalSessions = sessions.length;
    let totalExercises = 0;
    let totalDuration = 0;
    const sessionsByWeek: { [key: string]: number } = {};
    const volumeByDate: { date: string; volume: number }[] = [];
    const exercisesCount: { [key: string]: number } = {};
    const muscleGroupsCount: { [key: string]: number } = {};

    sessions.forEach((session) => {
      // Volume and exercises
      session.exercises.forEach((ex) => {
        totalExercises++;
        const volume = calculateExerciseVolume(ex);
        totalVolume += volume;

        // Exercise count
        const exerciseName = ex.exercise?.name || "Unknown";
        exercisesCount[exerciseName] = (exercisesCount[exerciseName] || 0) + 1;

        // Muscle groups
        if (ex.exercise?.muscleGroups) {
          const groups = ex.exercise.muscleGroups as string[];
          groups.forEach((group) => {
            muscleGroupsCount[group] = (muscleGroupsCount[group] || 0) + 1;
          });
        }
      });

      // Duration
      if (session.durationMinutes) {
        totalDuration += session.durationMinutes;
      }

      // Sessions by week
      const weekKey = getWeekKey(session.date);
      sessionsByWeek[weekKey] = (sessionsByWeek[weekKey] || 0) + 1;

      // Volume by date
      const dateKey = session.date.toISOString().split("T")[0];
      const existing = volumeByDate.find((v) => v.date === dateKey);
      if (existing) {
        existing.volume += session.exercises.reduce(
          (sum, ex) => sum + calculateExerciseVolume(ex),
          0
        );
      } else {
        volumeByDate.push({
          date: dateKey,
          volume: session.exercises.reduce(
            (sum, ex) => sum + calculateExerciseVolume(ex),
            0
          ),
        });
      }
    });

    // Calculate Personal Records (PRs)
    const prs = await calculatePersonalRecords(userId, from, to);

    // Sessions per week average
    const weeks = Object.keys(sessionsByWeek).length || 1;
    const avgSessionsPerWeek = totalSessions / weeks;

    // Average session duration
    const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    res.json({
      totalSessions,
      totalVolume,
      totalExercises,
      totalDuration,
      avgSessionsPerWeek: Math.round(avgSessionsPerWeek * 10) / 10,
      avgDuration: Math.round(avgDuration),
      sessionsByWeek: Object.entries(sessionsByWeek).map(([week, count]) => ({
        week,
        count,
      })),
      volumeByDate: volumeByDate.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      topExercises: Object.entries(exercisesCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      muscleGroupsDistribution: Object.entries(muscleGroupsCount).map(
        ([group, count]) => ({ group, count })
      ),
      personalRecords: prs,
      dateRange: { from, to },
    });
  } catch (error) {
    console.error("Error getting sessions stats:", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}

/**
 * GET /api/stats/measurements
 * Get detailed measurement statistics
 */
export async function getMeasurementsStats(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { range = "30d" } = req.query;
    const { from, to } = getDateRange(range as string);

    const measurements = await prisma.measurement.findMany({
      where: {
        userId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: "asc" },
    });

    // Weight evolution
    const weightEvolution = measurements
      .filter((m) => m.bodyWeightKg)
      .map((m) => ({
        date: m.date.toISOString().split("T")[0],
        weight: m.bodyWeightKg,
      }));

    // Body measurements evolution
    const bodyMeasurements = {
      waist: measurements
        .filter((m) => m.waistCm)
        .map((m) => ({
          date: m.date.toISOString().split("T")[0],
          value: m.waistCm,
        })),
      chest: measurements
        .filter((m) => m.chestCm)
        .map((m) => ({
          date: m.date.toISOString().split("T")[0],
          value: m.chestCm,
        })),
      arms: measurements
        .filter((m) => m.leftArmCm || m.rightArmCm)
        .map((m) => ({
          date: m.date.toISOString().split("T")[0],
          value: ((m.leftArmCm || 0) + (m.rightArmCm || 0)) / 2,
        })),
      thighs: measurements
        .filter((m) => m.leftThighCm || m.rightThighCm)
        .map((m) => ({
          date: m.date.toISOString().split("T")[0],
          value: ((m.leftThighCm || 0) + (m.rightThighCm || 0)) / 2,
        })),
    };

    // Latest measurements
    const latest = measurements[measurements.length - 1];
    const previous = measurements.length > 1 ? measurements[measurements.length - 2] : null;

    const weightChange =
      latest?.bodyWeightKg && previous?.bodyWeightKg
        ? latest.bodyWeightKg - previous.bodyWeightKg
        : null;

    res.json({
      totalMeasurements: measurements.length,
      weightEvolution,
      bodyMeasurements,
      latest: latest
        ? {
            date: latest.date,
            bodyWeightKg: latest.bodyWeightKg,
            waistCm: latest.waistCm,
            chestCm: latest.chestCm,
            leftArmCm: latest.leftArmCm,
            rightArmCm: latest.rightArmCm,
            leftThighCm: latest.leftThighCm,
            rightThighCm: latest.rightThighCm,
          }
        : null,
      weightChange,
      dateRange: { from, to },
    });
  } catch (error) {
    console.error("Error getting measurements stats:", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}

/**
 * GET /api/stats/overview
 * Get overview statistics (quick stats)
 */
export async function getOverviewStats(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { range = "30d" } = req.query;
    const { from, to } = getDateRange(range as string);

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, coachId: true },
    });

    // Sessions stats
    const sessions = await prisma.trainingSession.findMany({
      where: {
        userId,
        date: { gte: from, lte: to },
      },
      include: {
        exercises: true,
      },
    });

    let totalVolume = 0;
    sessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        totalVolume += calculateExerciseVolume(ex);
      });
    });

    // Calculate streak
    const sortedSessions = await prisma.trainingSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: { date: true },
    });

    let currentStreak = 0;
    if (sortedSessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(sortedSessions[0].date);
      checkDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 1) {
        currentStreak = 1;
        for (let i = 1; i < sortedSessions.length; i++) {
          const prevDate = new Date(sortedSessions[i - 1].date);
          prevDate.setHours(0, 0, 0, 0);
          const currDate = new Date(sortedSessions[i].date);
          currDate.setHours(0, 0, 0, 0);
          const diff = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Latest weight
    const latestMeasurement = await prisma.measurement.findFirst({
      where: {
        userId,
        bodyWeightKg: { not: null },
      },
      orderBy: { date: "desc" },
      select: { bodyWeightKg: true },
    });

    // For students: get coach-related stats
    let coachStats = null;
    if (user?.role === "eleve") {
      const sessionsWithComments = await prisma.trainingSession.count({
        where: {
          userId,
          coachComment: { not: null },
        },
      });
      coachStats = {
        sessionsWithComments,
        totalSessions: sessions.length,
      };
    }

    res.json({
      totalSessions: sessions.length,
      totalVolume,
      currentStreak,
      latestWeight: latestMeasurement?.bodyWeightKg || null,
      coachStats,
      dateRange: { from, to },
    });
  } catch (error) {
    console.error("Error getting overview stats:", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}

/**
 * GET /api/stats/coach/students/:studentId
 * Get statistics for a specific student (coach only)
 */
export async function getStudentStats(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    const { studentId } = req.params;
    const { range = "30d" } = req.query;
    const { from, to } = getDateRange(range as string);

    // Verify coach-student relationship
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        coachId: coachId,
      },
    });

    if (!student) {
      return res.status(403).json({
        message: "Vous n'avez pas accès aux statistiques de cet élève",
      });
    }

    // Get sessions stats
    const sessions = await prisma.trainingSession.findMany({
      where: {
        userId: studentId,
        date: { gte: from, lte: to },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    let totalVolume = 0;
    sessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        totalVolume += calculateExerciseVolume(ex);
      });
    });

    // Get measurements
    const measurements = await prisma.measurement.findMany({
      where: {
        userId: studentId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: "asc" },
    });

    const weightEvolution = measurements
      .filter((m) => m.bodyWeightKg)
      .map((m) => ({
        date: m.date.toISOString().split("T")[0],
        weight: m.bodyWeightKg,
      }));

    // Sessions with coach comments
    const sessionsWithComments = await prisma.trainingSession.count({
      where: {
        userId: studentId,
        coachComment: { not: null },
        date: { gte: from, lte: to },
      },
    });

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
      totalSessions: sessions.length,
      totalVolume,
      sessionsWithComments,
      weightEvolution,
      dateRange: { from, to },
    });
  } catch (error) {
    console.error("Error getting student stats:", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}

/**
 * GET /api/stats/coach/overview
 * Get coach overview statistics
 */
export async function getCoachOverviewStats(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    const { range = "30d" } = req.query;
    const { from, to } = getDateRange(range as string);

    // Get all students
    const students = await prisma.user.findMany({
      where: { coachId },
      select: { id: true, name: true, email: true },
    });

    // Get all sessions from students
    const allSessions = await prisma.trainingSession.findMany({
      where: {
        userId: { in: students.map((s) => s.id) },
        date: { gte: from, lte: to },
      },
      include: {
        exercises: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Calculate per-student stats
    const studentStats = students.map((student) => {
      const studentSessions = allSessions.filter(
        (s) => s.userId === student.id
      );
      let volume = 0;
      studentSessions.forEach((session) => {
        session.exercises.forEach((ex) => {
          volume += calculateExerciseVolume(ex);
        });
      });

      // Last activity
      const lastSession = studentSessions.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      )[0];

      return {
        studentId: student.id,
        studentName: student.name,
        totalSessions: studentSessions.length,
        totalVolume: volume,
        lastActivity: lastSession?.date || null,
        daysSinceLastActivity: lastSession
          ? Math.floor(
              (new Date().getTime() - lastSession.date.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      };
    });

    // Most active / least active
    const sortedByActivity = [...studentStats].sort(
      (a, b) => (b.totalSessions || 0) - (a.totalSessions || 0)
    );

    res.json({
      totalStudents: students.length,
      totalSessions: allSessions.length,
      avgSessionsPerStudent:
        students.length > 0 ? allSessions.length / students.length : 0,
      studentStats,
      mostActiveStudents: sortedByActivity.slice(0, 5),
      leastActiveStudents: sortedByActivity.slice(-5).reverse(),
      studentsNeedingAttention: studentStats.filter(
        (s) => s.daysSinceLastActivity && s.daysSinceLastActivity > 7
      ),
      dateRange: { from, to },
    });
  } catch (error) {
    console.error("Error getting coach overview stats:", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}

/**
 * GET /api/stats/coach/students/:studentId/profile
 * Get detailed profile statistics for a student (coach only)
 * Returns: total sessions, top 3 exercises, total volume, weight evolution,
 * weekly frequency, recent sessions
 */
export async function getStudentProfileStats(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    const { studentId } = req.params;
    const { range = "all" } = req.query;

    // Verify coach-student relationship
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        coachId: coachId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalType: true,
        isVirtual: true,
        allowEmails: true,
        createdAt: true,
      },
    });

    if (!student) {
      return res.status(403).json({
        message: "Vous n'avez pas accès aux statistiques de cet élève",
      });
    }

    // Date range
    let dateFilter: { gte?: Date; lte?: Date } = {};
    if (range !== "all") {
      const { from, to } = getDateRange(range as string);
      dateFilter = { gte: from, lte: to };
    }

    // Get ALL sessions for this student (with exercises)
    const sessions = await prisma.trainingSession.findMany({
      where: {
        userId: studentId,
        ...(dateFilter.gte ? { date: dateFilter } : {}),
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Total sessions
    const totalSessions = sessions.length;

    // Total volume
    let totalVolume = 0;
    const exercisesCount: { [key: string]: { name: string; count: number } } = {};

    sessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        totalVolume += calculateExerciseVolume(ex);

        // Count exercises
        const exerciseName = ex.exercise?.name || "Unknown";
        const exerciseId = ex.exerciseId;
        if (!exercisesCount[exerciseId]) {
          exercisesCount[exerciseId] = { name: exerciseName, count: 0 };
        }
        exercisesCount[exerciseId].count++;
      });
    });

    // Top 3 exercises
    const topExercises = Object.values(exercisesCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Weekly frequency (sessions per week over the last 12 weeks)
    const weeklyFrequency: { week: string; count: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = sessions.filter((s) => {
        const d = new Date(s.date);
        return d >= weekStart && d < weekEnd;
      }).length;

      const weekLabel = weekStart.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });

      weeklyFrequency.push({ week: weekLabel, count });
    }

    // Weight evolution (from measurements)
    const measurements = await prisma.measurement.findMany({
      where: {
        userId: studentId,
        bodyWeightKg: { not: null },
      },
      orderBy: { date: "asc" },
      select: {
        date: true,
        bodyWeightKg: true,
      },
    });

    const weightEvolution = measurements.map((m) => ({
      date: m.date.toISOString().split("T")[0],
      weight: m.bodyWeightKg,
    }));

    // Recent sessions (last 10) with details
    const recentSessions = sessions.slice(0, 10).map((session) => ({
      id: session.id,
      date: session.date,
      durationMinutes: session.durationMinutes,
      notes: session.notes,
      coachComment: session.coachComment,
      exerciseCount: session.exercises.length,
      totalVolume: session.exercises.reduce(
        (sum, ex) => sum + calculateExerciseVolume(ex),
        0
      ),
      exercises: session.exercises.map((ex) => ({
        name: ex.exercise?.name || "Unknown",
        sets: ex.sets,
        repsUniform: ex.repsUniform,
        weightKg: ex.weightKg,
      })),
    }));

    // Coach notes count
    const notesCount = await prisma.coachNote.count({
      where: {
        coachId,
        studentId,
      },
    });

    // Sessions with coach comment
    const sessionsWithComments = sessions.filter(
      (s) => s.coachComment && s.coachComment.trim() !== ""
    ).length;

    // Current streak
    let currentStreak = 0;
    if (sessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(sessions[0].date);
      checkDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 7) {
        // Consider a weekly streak
        currentStreak = 1;
        for (let i = 1; i < sessions.length; i++) {
          const prevDate = new Date(sessions[i - 1].date);
          prevDate.setHours(0, 0, 0, 0);
          const currDate = new Date(sessions[i].date);
          currDate.setHours(0, 0, 0, 0);
          const diff = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff <= 7) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        goalType: student.goalType,
        isVirtual: student.isVirtual,
        allowEmails: student.allowEmails,
        createdAt: student.createdAt,
      },
      stats: {
        totalSessions,
        totalVolume: Math.round(totalVolume),
        topExercises,
        weeklyFrequency,
        weightEvolution,
        currentStreak,
        sessionsWithComments,
        notesCount,
      },
      recentSessions,
    });
  } catch (error) {
    console.error("Error getting student profile stats:", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}

// Helper functions

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = getWeekNumber(d);
  return `${year}-W${week}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

async function calculatePersonalRecords(
  userId: string,
  from: Date,
  to: Date
): Promise<
  Array<{
    exerciseName: string;
    exerciseId: string;
    maxWeight: number;
    maxReps: number;
    date: Date;
  }>
> {
  const sessions = await prisma.trainingSession.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  });

  const prs: {
    [key: string]: {
      exerciseName: string;
      exerciseId: string;
      maxWeight: number;
      maxReps: number;
      date: Date;
    };
  } = {};

  sessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      const exerciseId = ex.exerciseId;
      const exerciseName = ex.exercise?.name || "Unknown";

      if (!prs[exerciseId]) {
        prs[exerciseId] = {
          exerciseName,
          exerciseId,
          maxWeight: ex.weightKg || 0,
          maxReps: ex.repsUniform || 0,
          date: session.date,
        };
      } else {
        if ((ex.weightKg || 0) > prs[exerciseId].maxWeight) {
          prs[exerciseId].maxWeight = ex.weightKg || 0;
          prs[exerciseId].date = session.date;
        }
        const reps = ex.repsUniform || 0;
        if (reps > prs[exerciseId].maxReps) {
          prs[exerciseId].maxReps = reps;
        }
      }
    });
  });

  return Object.values(prs).filter((pr) => pr.maxWeight > 0 || pr.maxReps > 0);
}
