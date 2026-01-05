import { Request, Response } from "express";
import prisma from "../config/database";
import { sendEmail } from "../email/emailService";
import {
  formatDateFrench,
  getGoalMessage,
  calculateSimpleStats,
} from "../email/emailUtils";

/**
 * Utility function to extract userId from req.user and handle errors.
 */
function getUserIdFromRequest(req: Request, res: Response): string | undefined {
  const userPayload = (req as any).user;

  // Accept userId or id for backward compatibility (for strictness, use only userId if that's the standard)
  const userId = userPayload && (userPayload.userId || userPayload.id);
  if (!userId) {
    res
      .status(401)
      .json({ message: "Utilisateur non authentifié (userId manquant)" });
    return undefined;
  }
  return userId;
}

export async function getTrainingSessions(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { dateFrom, dateTo, limit = 50, offset = 0 } = req.query;

    const where: any = { userId };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json(sessions);
  } catch (error) {
    console.log("Error :", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}

export async function CreateTrainingSession(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { date, durationMinutes, notes, exercises } = req.body;

    if (!date || !exercises || exercises.length === 0) {
      return res.status(400).json({
        message: "Date et au moins un exercice sont requis",
      });
    }

    // Séparer les exercices existants et les exercices custom à créer
    const exerciseIds = exercises.map((ex: any) => ex.exerciseId);
    const existingExercises = await prisma.exercise.findMany({
      where: {
        id: {
          in: exerciseIds,
        },
      },
      select: {
        id: true,
      },
    });

    const existingExerciseIds = existingExercises.map((ex: { id: string }) => ex.id);
    const customExercises = exercises.filter(
      (ex: any) =>
        !existingExerciseIds.includes(ex.exerciseId) &&
        (ex.exerciseId?.startsWith("custom-") || ex.exerciseName)
    );

    // Créer les exercices custom manquants
    const exerciseIdMap = new Map<string, string>();
    for (const ex of exercises) {
      if (existingExerciseIds.includes(ex.exerciseId)) {
        // Exercice existant, garder l'ID
        exerciseIdMap.set(ex.exerciseId, ex.exerciseId);
      } else if (
        customExercises.some((ce: any) => ce.exerciseId === ex.exerciseId)
      ) {
        // Exercice custom à créer
        const customEx = customExercises.find(
          (ce: any) => ce.exerciseId === ex.exerciseId
        );

        if (!customEx.exerciseName) {
          return res.status(400).json({
            message: `Le nom de l'exercice est requis pour l'exercice custom (ID: ${ex.exerciseId})`,
          });
        }

        // Vérifier si un exercice avec ce nom existe déjà pour cet utilisateur
        const existingCustomExercise = await prisma.exercise.findFirst({
          where: {
            name: {
              equals: customEx.exerciseName.trim(),
              mode: "insensitive",
            },
            OR: [
              { isCustom: false },
              { isCustom: true, createdByUserId: userId },
            ],
          },
        });

        let exerciseId: string;

        if (existingCustomExercise) {
          // Utiliser l'exercice existant
          exerciseId = existingCustomExercise.id;
        } else {
          // Créer le nouvel exercice custom
          const newExercise = await prisma.exercise.create({
            data: {
              name: customEx.exerciseName.trim(),
              category: customEx.exerciseCategory || "other",
              muscleGroups: customEx.exerciseMuscleGroups || null,
              defaultUnit: customEx.exerciseDefaultUnit || "reps",
              isCustom: true,
              createdByUserId: userId,
            },
          });
          exerciseId = newExercise.id;
        }

        exerciseIdMap.set(ex.exerciseId, exerciseId);
      } else {
        // Exercice qui n'existe pas et n'est pas custom
        return res.status(400).json({
          message: `L'exercice avec l'ID ${ex.exerciseId} n'existe pas et aucune information n'a été fournie pour le créer`,
        });
      }
    }

    // Créer la séance avec les exercices (en utilisant les vrais IDs)
    const session = await prisma.trainingSession.create({
      data: {
        userId,
        date: new Date(date),
        durationMinutes,
        notes,
        exercises: {
          create: exercises.map((ex: any, index: number) => ({
            exerciseId: exerciseIdMap.get(ex.exerciseId) || ex.exerciseId,
            sets: ex.sets,
            repsPerSet: ex.repsPerSet,
            repsUniform: ex.repsUniform,
            weightKg: ex.weightKg,
            durationSeconds: ex.durationSeconds,
            restSeconds: ex.restSeconds,
            orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : index,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    // Envoyer les emails de notification (asynchrone, ne bloque pas la réponse)
    // Récupérer les informations de l'utilisateur pour les emails
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        goalType: true,
        coachId: true,
      },
    });

    if (user) {
      // Envoyer un email à l'utilisateur (élève ou personnel) pour confirmer la séance
      if (user.role === "eleve" || user.role === "personnel") {
        // Calculer les stats simplifiées
        const stats = await calculateSimpleStats(userId, prisma);

        // Calculer le message intelligent
        const goalMessage = getGoalMessage(user.goalType, stats.weightChange);

        // Construire le HTML du message goal (optionnel)
        let goalMessageHTML = "";
        if (goalMessage) {
          const bgColor = goalMessage.color === "green" ? "#f0fdf4" : "#fff7ed";
          const borderColor =
            goalMessage.color === "green" ? "#22c55e" : "#f97316";
          const textColor =
            goalMessage.color === "green" ? "#166534" : "#9a3412";
          goalMessageHTML = `<div
            style="
              background-color: ${bgColor};
              border-left: 4px solid ${borderColor};
              border-radius: 8px;
              padding: 16px;
              margin: 0 0 32px;
            "
          >
            <p
              style="
                margin: 0;
                font-size: 16px;
                line-height: 24px;
                color: ${textColor};
                font-weight: 500;
              "
            >
              ${goalMessage.message}
            </p>
          </div>`;
        }

        // Construire le HTML du poids (optionnel)
        let weightHTML = "";
        if (stats.latestWeight) {
          weightHTML = `<div
            style="
              background-color: #ffffff;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
            "
          >
            <p
              style="
                margin: 0 0 8px;
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              "
            >
              Poids actuel
            </p>
            <p
              style="
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                color: #111827;
              "
            >
              ${stats.latestWeight.toFixed(1)} kg
            </p>
          </div>`;
        }

        sendEmail(
          user.email,
          "Séance d'entraînement enregistrée - MyTrackLy",
          "trainingSessionConfirmation",
          {
            userName: user.name,
            sessionDate: formatDateFrench(session.date),
            totalSessions: stats.totalSessions.toString(),
            currentStreak: stats.currentStreak.toString(),
            weeklyFrequency: stats.weeklyFrequency,
            goalMessageHTML: goalMessageHTML,
            weightHTML: weightHTML,
          }
        ).catch((error) => {
          console.error(
            "Erreur lors de l'envoi de l'email de confirmation:",
            error
          );
        });

        // Si c'est un élève, envoyer aussi un email au coach
        if (user.role === "eleve" && user.coachId) {
          const coach = await prisma.user.findUnique({
            where: { id: user.coachId },
            select: {
              id: true,
              name: true,
              email: true,
            },
          });

          if (coach && coach.email) {
            // Construire le HTML du poids pour le coach (optionnel)
            let coachWeightHTML = "";
            if (stats.latestWeight) {
              coachWeightHTML = `<div
                style="
                  background-color: #ffffff;
                  border-radius: 8px;
                  padding: 16px;
                  text-align: center;
                "
              >
                <p
                  style="
                    margin: 0 0 8px;
                    font-size: 11px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  "
                >
                  Poids actuel
                </p>
                <p
                  style="
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    color: #111827;
                  "
                >
                  ${stats.latestWeight.toFixed(1)} kg
                </p>
              </div>`;
            }

            sendEmail(
              coach.email,
              `${user.name} a créé une séance d'entraînement - MyTrackLy`,
              "coachStudentSessionNotification",
              {
                coachName: coach.name,
                studentName: user.name,
                sessionDate: formatDateFrench(session.date),
                totalSessions: stats.totalSessions.toString(),
                currentStreak: stats.currentStreak.toString(),
                weeklyFrequency: stats.weeklyFrequency,
                weightHTML: coachWeightHTML,
              }
            ).catch((error) => {
              console.error(
                "Erreur lors de l'envoi de l'email au coach:",
                error
              );
            });
          }
        }
      }
    }

    res.status(201).json(session);
  } catch (error: any) {
    console.error("Error creating training session:", error);

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2003") {
      return res.status(400).json({
        message:
          "Un ou plusieurs exercices n'existent pas dans la base de données",
        error: "Foreign key constraint violation",
      });
    }

    res.status(500).json({
      message: "Une erreur est survenue lors de la création de la séance",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export async function getTrainingSession(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    const session = await prisma.trainingSession.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching training session:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

export async function updateTrainingSession(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;
    const { date, durationMinutes, notes, exercises } = req.body;

    // Vérifier que la séance appartient à l'utilisateur
    const existingSession = await prisma.trainingSession.findFirst({
      where: { id, userId },
    });

    if (!existingSession) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    // Supprimer les anciens exercices et créer les nouveaux
    await prisma.sessionExercise.deleteMany({
      where: { sessionId: id },
    });

    const session = await prisma.trainingSession.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        durationMinutes,
        notes,
        exercises: exercises
          ? {
              create: exercises.map((ex: any, index: number) => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets,
                repsPerSet: ex.repsPerSet,
                repsUniform: ex.repsUniform,
                weightKg: ex.weightKg,
                durationSeconds: ex.durationSeconds,
                restSeconds: ex.restSeconds,
                orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : index,
                notes: ex.notes,
              })),
            }
          : undefined,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    res.json(session);
  } catch (error) {
    console.error("Error updating training session:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

export async function deleteTrainingSession(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Vérifier que la séance appartient à l'utilisateur
    const session = await prisma.trainingSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    await prisma.trainingSession.delete({
      where: { id },
    });

    res.json({ message: "Séance supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting training session:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

export async function getTrainingStats(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    // Statistiques de base
    const totalSessions = await prisma.trainingSession.count({
      where: { userId },
    });

    // Volume total et exercices
    const sessions = await prisma.trainingSession.findMany({
      where: { userId },
      include: {
        exercises: true,
      },
    });

    let totalVolume = 0;
    let totalExercises = 0;

    sessions.forEach((session: { exercises: any[] }) => {
      session.exercises.forEach((ex) => {
        totalExercises++;
        const reps = ex.repsUniform
          ? ex.sets * ex.repsUniform
          : ex.repsPerSet
          ? (ex.repsPerSet as number[]).reduce((sum, r) => sum + r, 0)
          : 0;
        totalVolume += reps * (ex.weightKg || 0);
      });
    });

    // Streak (jours consécutifs)
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

      // Vérifier si la dernière séance est aujourd'hui ou hier
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

    // Fréquence hebdomadaire (4 dernières semaines)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentSessions = await prisma.trainingSession.count({
      where: {
        userId,
        date: {
          gte: fourWeeksAgo,
        },
      },
    });

    const weeklyFrequency = recentSessions / 4;

    // Dernière séance
    const lastSession = await prisma.trainingSession.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    // Récupérer le dernier poids (latestWeight)
    const latestMeasurement = await prisma.measurement.findFirst({
      where: {
        userId,
        bodyWeightKg: { not: null },
      },
      orderBy: { date: "desc" },
      select: { bodyWeightKg: true, date: true },
    });

    const latestWeight = latestMeasurement?.bodyWeightKg ?? null;

    // Calculer weightChange (différence avec il y a ~30 jours)
    let weightChange: number | null = null;
    if (latestWeight) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const previousMeasurement = await prisma.measurement.findFirst({
        where: {
          userId,
          bodyWeightKg: { not: null },
          date: { lte: oneMonthAgo },
        },
        orderBy: { date: "desc" },
        select: { bodyWeightKg: true },
      });

      if (previousMeasurement?.bodyWeightKg) {
        weightChange = latestWeight - previousMeasurement.bodyWeightKg;
      }
    }

    res.json({
      totalSessions,
      totalExercises,
      totalVolume,
      currentStreak,
      weeklyFrequency,
      lastSession,
      latestWeight,
      weightChange,
    });
  } catch (error) {
    console.error("Error fetching training stats:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

/**
 * Récupère toutes les séances des élèves d'un coach
 */
export async function getCoachStudentsSessions(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    // Vérifier que l'utilisateur est un coach
    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: { role: true },
    });

    if (!coach || coach.role !== "coach") {
      return res.status(403).json({
        message: "Seuls les coaches peuvent voir les séances de leurs élèves.",
      });
    }

    // Récupérer tous les élèves du coach
    const students = await prisma.user.findMany({
      where: {
        coachId: coachId,
        role: "eleve",
      },
      select: {
        id: true,
      },
    });

    const studentIds = students.map((s: { id: string }) => s.id);

    if (studentIds.length === 0) {
      return res.json([]);
    }

    const { dateFrom, dateTo, limit = 100, offset = 0 } = req.query;

    const where: any = {
      userId: {
        in: studentIds,
      },
    };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching coach students sessions:", error);
    res.status(500).json({ message: "Une erreur est survenue" });
  }
}

/**
 * Crée une séance d'entraînement pour un élève spécifique (par le coach)
 */
export async function createTrainingSessionForStudent(
  req: Request,
  res: Response
) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    // Vérifier que l'utilisateur est un coach
    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: { role: true, name: true, email: true },
    });

    if (!coach || coach.role !== "coach") {
      return res.status(403).json({
        message:
          "Seuls les coaches peuvent créer des séances pour leurs élèves.",
      });
    }

    const { studentId } = req.params;
    const { date, durationMinutes, notes, exercises } = req.body;

    if (!date || !exercises || exercises.length === 0) {
      return res.status(400).json({
        message: "Date et au moins un exercice sont requis",
      });
    }

    // Vérifier que l'élève appartient bien au coach
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        coachId: coachId,
        role: "eleve",
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalType: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Élève non trouvé ou vous n'avez pas accès à cet élève.",
      });
    }

    // Séparer les exercices existants et les exercices custom à créer
    const exerciseIds = exercises.map((ex: any) => ex.exerciseId);
    const existingExercises = await prisma.exercise.findMany({
      where: {
        id: {
          in: exerciseIds,
        },
      },
      select: {
        id: true,
      },
    });

    const existingExerciseIds = existingExercises.map((ex: { id: string }) => ex.id);
    const customExercises = exercises.filter(
      (ex: any) =>
        !existingExerciseIds.includes(ex.exerciseId) &&
        (ex.exerciseId?.startsWith("custom-") || ex.exerciseName)
    );

    // Créer les exercices custom manquants
    const exerciseIdMap = new Map<string, string>();
    for (const ex of exercises) {
      if (existingExerciseIds.includes(ex.exerciseId)) {
        exerciseIdMap.set(ex.exerciseId, ex.exerciseId);
      } else if (
        customExercises.some((ce: any) => ce.exerciseId === ex.exerciseId)
      ) {
        const customEx = customExercises.find(
          (ce: any) => ce.exerciseId === ex.exerciseId
        );

        if (!customEx.exerciseName) {
          return res.status(400).json({
            message: `Le nom de l'exercice est requis pour l'exercice custom (ID: ${ex.exerciseId})`,
          });
        }

        const existingCustomExercise = await prisma.exercise.findFirst({
          where: {
            name: {
              equals: customEx.exerciseName.trim(),
              mode: "insensitive",
            },
            OR: [
              { isCustom: false },
              { isCustom: true, createdByUserId: studentId },
            ],
          },
        });

        let exerciseId: string;

        if (existingCustomExercise) {
          exerciseId = existingCustomExercise.id;
        } else {
          const newExercise = await prisma.exercise.create({
            data: {
              name: customEx.exerciseName.trim(),
              category: customEx.exerciseCategory || "other",
              muscleGroups: customEx.exerciseMuscleGroups || null,
              defaultUnit: customEx.exerciseDefaultUnit || "reps",
              isCustom: true,
              createdByUserId: studentId,
            },
          });
          exerciseId = newExercise.id;
        }

        exerciseIdMap.set(ex.exerciseId, exerciseId);
      } else {
        return res.status(400).json({
          message: `L'exercice avec l'ID ${ex.exerciseId} n'existe pas et aucune information n'a été fournie pour le créer`,
        });
      }
    }

    // Créer la séance avec les exercices (userId = studentId)
    const session = await prisma.trainingSession.create({
      data: {
        userId: studentId,
        date: new Date(date),
        durationMinutes,
        notes,
        exercises: {
          create: exercises.map((ex: any, index: number) => ({
            exerciseId: exerciseIdMap.get(ex.exerciseId) || ex.exerciseId,
            sets: ex.sets,
            repsPerSet: ex.repsPerSet,
            repsUniform: ex.repsUniform,
            weightKg: ex.weightKg,
            durationSeconds: ex.durationSeconds,
            restSeconds: ex.restSeconds,
            orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : index,
            notes: ex.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Envoyer un email à l'élève pour l'informer que le coach a créé une séance
    if (student.email) {
      sendEmail(
        student.email,
        `${coach.name} a créé une séance d'entraînement pour vous - MyTrackLy`,
        "coachCreatedSessionNotification",
        {
          studentName: student.name,
          coachName: coach.name,
          sessionDate: formatDateFrench(session.date),
          sessionNotes: notes || "Aucune note",
          exercisesCount: exercises.length.toString(),
        }
      ).catch((error) => {
        console.error("Erreur lors de l'envoi de l'email à l'élève:", error);
      });
    }

    res.status(201).json(session);
  } catch (error: any) {
    console.error("Error creating training session for student:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        message:
          "Un ou plusieurs exercices n'existent pas dans la base de données",
        error: "Foreign key constraint violation",
      });
    }

    res.status(500).json({
      message: "Une erreur est survenue lors de la création de la séance",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Ajoute ou modifie un commentaire du coach sur une séance
 */
export async function addCoachComment(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    // Vérifier que l'utilisateur est un coach
    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: { role: true, name: true, email: true },
    });

    if (!coach || coach.role !== "coach") {
      return res.status(403).json({
        message: "Seuls les coaches peuvent ajouter des commentaires.",
      });
    }

    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Le commentaire ne peut pas être vide",
      });
    }

    // Récupérer la séance avec l'élève
    const session = await prisma.trainingSession.findFirst({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            coachId: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ message: "Séance non trouvée" });
    }

    // Vérifier que l'élève appartient bien au coach
    if (session.user.coachId !== coachId) {
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette séance.",
      });
    }

    // Mettre à jour le commentaire
    const updatedSession = await prisma.trainingSession.update({
      where: { id },
      data: {
        coachComment: comment.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    // Envoyer un email à l'élève pour l'informer du commentaire
    if (session.user.email) {
      sendEmail(
        session.user.email,
        `${coach.name} a ajouté un commentaire sur votre séance - MyTrackLy`,
        "coachCommentNotification",
        {
          studentName: session.user.name,
          coachName: coach.name,
          sessionDate: formatDateFrench(session.date),
          comment: comment.trim(),
        }
      ).catch((error) => {
        console.error("Erreur lors de l'envoi de l'email à l'élève:", error);
      });
    }

    res.json(updatedSession);
  } catch (error) {
    console.error("Error adding coach comment:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}
