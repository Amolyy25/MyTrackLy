import { Request, Response } from "express";
import prisma from "../config/database";
import { sendEmail } from "../email/emailService";
import {
  formatDateFrench,
  formatMeasurementDetailsHTML,
} from "../email/emailUtils";

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
 * Parse measurement data from request body
 */
function parseMeasurementData(body: any) {
  return {
    date: body.date ? new Date(body.date) : null,
    bodyWeightKg: body.bodyWeightKg ? parseFloat(body.bodyWeightKg) : null,
    leftArmCm: body.leftArmCm ? parseFloat(body.leftArmCm) : null,
    rightArmCm: body.rightArmCm ? parseFloat(body.rightArmCm) : null,
    leftCalfCm: body.leftCalfCm ? parseFloat(body.leftCalfCm) : null,
    rightCalfCm: body.rightCalfCm ? parseFloat(body.rightCalfCm) : null,
    chestCm: body.chestCm ? parseFloat(body.chestCm) : null,
    waistCm: body.waistCm ? parseFloat(body.waistCm) : null,
    hipsCm: body.hipsCm ? parseFloat(body.hipsCm) : null,
    leftThighCm: body.leftThighCm ? parseFloat(body.leftThighCm) : null,
    rightThighCm: body.rightThighCm ? parseFloat(body.rightThighCm) : null,
    neckCm: body.neckCm ? parseFloat(body.neckCm) : null,
    shouldersCm: body.shouldersCm ? parseFloat(body.shouldersCm) : null,
    notes: body.notes || null,
  };
}

/**
 * Prepare measurement data for Prisma create/update
 */
function prepareMeasurementData(parsedData: ReturnType<typeof parseMeasurementData>) {
  return {
    date: parsedData.date!,
    bodyWeightKg: parsedData.bodyWeightKg,
    leftArmCm: parsedData.leftArmCm,
    rightArmCm: parsedData.rightArmCm,
    leftCalfCm: parsedData.leftCalfCm,
    rightCalfCm: parsedData.rightCalfCm,
    chestCm: parsedData.chestCm,
    waistCm: parsedData.waistCm,
    hipsCm: parsedData.hipsCm,
    leftThighCm: parsedData.leftThighCm,
    rightThighCm: parsedData.rightThighCm,
    neckCm: parsedData.neckCm,
    shouldersCm: parsedData.shouldersCm,
    notes: parsedData.notes,
  };
}

// --- Récupérer toutes les mensurations de l'utilisateur ---
export async function getMeasurements(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { dateFrom, dateTo, limit = 100, offset = 0 } = req.query;

    const where: any = { userId };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const measurements = await prisma.measurement.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json(measurements);
  } catch (error) {
    console.error("GetMeasurements Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des mensurations.",
    });
  }
}

// --- Récupérer une mensuration spécifique ---
export async function getMeasurement(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    const measurement = await prisma.measurement.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!measurement) {
      res.status(404).json({
        message: "Mensuration non trouvée.",
      });
      return;
    }

    res.json(measurement);
  } catch (error) {
    console.error("GetMeasurement Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération de la mensuration.",
    });
  }
}

// --- Créer une nouvelle mensuration ---
export async function createMeasurement(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const parsedData = parseMeasurementData(req.body);

    if (!parsedData.date) {
      return res.status(400).json({
        message: "La date est requise",
      });
    }

    // Vérifier s'il existe déjà une mesure pour cette date
    const existingMeasurement = await prisma.measurement.findFirst({
      where: {
        userId,
        date: parsedData.date,
      },
    });

    if (existingMeasurement) {
      return res.status(400).json({
        message: "Une mensuration existe déjà pour cette date. Utilisez PUT pour la modifier.",
      });
    }

    // Créer la mensuration
    const measurement = await prisma.measurement.create({
      data: {
        userId,
        ...prepareMeasurementData(parsedData),
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
        coachId: true,
      },
    });

    if (user) {
      // Envoyer un email de confirmation à l'utilisateur
      const measurementDetailsHTML = formatMeasurementDetailsHTML(measurement);

      sendEmail(
        user.email,
        "Mensuration enregistrée - MyTrackLy",
        "measurementConfirmation",
        {
          userName: user.name,
          measurementDate: formatDateFrench(measurement.date),
          measurementDetailsHTML: measurementDetailsHTML,
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

        if (coach) {
          sendEmail(
            coach.email,
            `${user.name} a enregistré une nouvelle mensuration - MyTrackLy`,
            "coachMeasurementNotification",
            {
              coachName: coach.name,
              studentName: user.name,
              measurementDate: formatDateFrench(measurement.date),
              measurementDetailsHTML: measurementDetailsHTML,
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

    res.status(201).json(measurement);
  } catch (error) {
    console.error("CreateMeasurement Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création de la mensuration.",
    });
  }
}

// --- Modifier une mensuration ---
export async function updateMeasurement(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;
    const parsedData = parseMeasurementData(req.body);

    // Vérifier que la mensuration appartient à l'utilisateur
    const existingMeasurement = await prisma.measurement.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingMeasurement) {
      return res.status(404).json({
        message: "Mensuration non trouvée ou vous n'avez pas accès à cette mensuration.",
      });
    }

    // Si la date change, vérifier qu'il n'y a pas déjà une mesure pour cette nouvelle date
    if (
      parsedData.date &&
      parsedData.date.getTime() !== existingMeasurement.date.getTime()
    ) {
      const duplicateMeasurement = await prisma.measurement.findFirst({
        where: {
          userId,
          date: parsedData.date,
          id: { not: id },
        },
      });

      if (duplicateMeasurement) {
        return res.status(400).json({
          message: "Une mensuration existe déjà pour cette date.",
        });
      }
    }

    // Construire l'objet de mise à jour avec seulement les champs fournis
    const updateData: any = {};
    if (parsedData.date) updateData.date = parsedData.date;
    if (req.body.bodyWeightKg !== undefined)
      updateData.bodyWeightKg = parsedData.bodyWeightKg;
    if (req.body.leftArmCm !== undefined)
      updateData.leftArmCm = parsedData.leftArmCm;
    if (req.body.rightArmCm !== undefined)
      updateData.rightArmCm = parsedData.rightArmCm;
    if (req.body.leftCalfCm !== undefined)
      updateData.leftCalfCm = parsedData.leftCalfCm;
    if (req.body.rightCalfCm !== undefined)
      updateData.rightCalfCm = parsedData.rightCalfCm;
    if (req.body.chestCm !== undefined) updateData.chestCm = parsedData.chestCm;
    if (req.body.waistCm !== undefined) updateData.waistCm = parsedData.waistCm;
    if (req.body.hipsCm !== undefined) updateData.hipsCm = parsedData.hipsCm;
    if (req.body.leftThighCm !== undefined)
      updateData.leftThighCm = parsedData.leftThighCm;
    if (req.body.rightThighCm !== undefined)
      updateData.rightThighCm = parsedData.rightThighCm;
    if (req.body.neckCm !== undefined) updateData.neckCm = parsedData.neckCm;
    if (req.body.shouldersCm !== undefined)
      updateData.shouldersCm = parsedData.shouldersCm;
    if (req.body.notes !== undefined) updateData.notes = parsedData.notes;

    const measurement = await prisma.measurement.update({
      where: { id },
      data: updateData,
    });

    res.json(measurement);
  } catch (error) {
    console.error("UpdateMeasurement Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la modification de la mensuration.",
    });
  }
}

// --- Supprimer une mensuration ---
export async function deleteMeasurement(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Vérifier que la mensuration appartient à l'utilisateur
    const measurement = await prisma.measurement.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!measurement) {
      return res.status(404).json({
        message: "Mensuration non trouvée ou vous n'avez pas accès à cette mensuration.",
      });
    }

    await prisma.measurement.delete({
      where: { id },
    });

    res.json({ message: "Mensuration supprimée avec succès." });
  } catch (error) {
    console.error("DeleteMeasurement Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression de la mensuration.",
    });
  }
}

// --- Récupérer les mensurations d'un élève (coach uniquement) ---
export async function getStudentMeasurements(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const coachId = userPayload.userId;

    // Vérifier que l'utilisateur est un coach
    const user = await prisma.user.findUnique({
      where: { id: coachId },
      select: { role: true },
    });

    if (!user || user.role !== "coach") {
      res.status(403).json({
        message: "Seuls les coaches peuvent voir les mensurations de leurs élèves.",
      });
      return;
    }

    const { studentId } = req.params;
    const { dateFrom, dateTo, limit = 100, offset = 0 } = req.query;

    // Vérifier que l'élève appartient bien au coach
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        coachId,
        role: "eleve",
      },
    });

    if (!student) {
      res.status(404).json({
        message: "Élève non trouvé ou vous n'avez pas accès à cet élève.",
      });
      return;
    }

    const where: any = { userId: studentId };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const measurements = await prisma.measurement.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json(measurements);
  } catch (error) {
    console.error("GetStudentMeasurements Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des mensurations.",
    });
  }
}

