import { Request, Response } from "express";
import prisma from "../config/database";
import { verifyToken } from "../utils/jwt";
import {
  generateAuthUrl,
  handleOAuthCallback,
  createEventInCoachCalendar,
  updateEventInCoachCalendar,
  deleteEventFromCoachCalendar,
  createEventInStudentCalendar,
} from "../services/googleCalendarService";
import { sendEmail } from "../email/emailService";
import { formatDateTimeFrench } from "../email/emailUtils";
import {
  validateSessionType,
  validateISODate,
  validateFutureDate,
  validateDateRange,
  validateNotes,
  validateUUID,
} from "../utils/validation";
import { sanitizeNotes } from "../utils/sanitizer";

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

export async function getGoogleAuthUrl(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== "coach" && user.role !== "eleve")) {
      return res.status(403).json({
        message:
          "Seuls les coaches et les élèves peuvent connecter un Google Calendar.",
      });
    }

    // Redirection par défaut selon le rôle
    const defaultRedirect =
      user.role === "coach" ? "/dashboard" : "/dashboard/reservations";
    const frontendRedirect =
      (req.query.redirect as string | undefined) || defaultRedirect;

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message:
          "Token manquant pour initialiser la connexion Google Calendar.",
      });
    }

    const statePayload = {
      redirect: frontendRedirect,
      token,
    };

    const state = Buffer.from(JSON.stringify(statePayload)).toString(
      "base64url"
    );

    const url = generateAuthUrl(state);

    res.json({ url });
  } catch (error) {
    console.error(
      "[Calendar] Erreur lors de la génération de l'URL OAuth:",
      error
    );
    res.status(500).json({
      message: "Une erreur est survenue lors de la connexion Google.",
    });
  }
}

export async function googleOAuthCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== "string") {
      return res
        .status(400)
        .send("Paramètre 'code' manquant dans la réponse Google.");
    }

    if (!state || typeof state !== "string") {
      return res
        .status(400)
        .send("Paramètre 'state' manquant dans la réponse Google.");
    }

    let redirectPath = "/dashboard";
    let userId: string;

    try {
      const decoded = Buffer.from(state, "base64url").toString("utf8");
      const parsed = JSON.parse(decoded) as {
        redirect?: string;
        token?: string;
      };

      if (!parsed.token) {
        return res
          .status(400)
          .send("Token d'authentification manquant dans le state OAuth.");
      }

      const payload = verifyToken(parsed.token);
      userId = payload.userId;
      redirectPath = parsed.redirect || redirectPath;
    } catch (e) {
      console.error("[Calendar] Erreur lors du décodage du state OAuth:", e);
      return res
        .status(400)
        .send("State OAuth invalide. Veuillez relancer la connexion.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== "coach" && user.role !== "eleve")) {
      return res
        .status(403)
        .send(
          "Seuls les coaches et les élèves peuvent connecter un Google Calendar."
        );
    }

    await handleOAuthCallback(code, userId);

    const redirectBase = process.env.FRONTEND_URL || "http://localhost:5173";

    res.redirect(`${redirectBase}${redirectPath}?googleCalendar=connected`);
  } catch (error) {
    console.error("[Calendar] Erreur lors du callback OAuth Google:", error);
    res
      .status(500)
      .send(
        "Une erreur est survenue lors de la connexion à Google Calendar. Vous pouvez réessayer depuis votre dashboard."
      );
  }
}

export async function createReservation(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        name: true,
        coachId: true,
        googleCalendarAccessToken: true,
        googleCalendarId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.role !== "eleve") {
      return res.status(403).json({
        message: "Seuls les élèves peuvent créer une réservation.",
      });
    }

    // Vérifier que l'élève a connecté son Google Calendar
    if (!user.googleCalendarAccessToken || !user.googleCalendarId) {
      return res.status(403).json({
        message:
          "Vous devez connecter votre Google Calendar pour réserver une séance.",
      });
    }

    const { coachId, startDateTime, endDateTime, sessionType, notes } =
      req.body || {};

    // Validation des champs requis
    if (!coachId || !startDateTime || !endDateTime || !sessionType) {
      return res.status(400).json({
        message:
          "coachId, startDateTime, endDateTime et sessionType sont requis.",
      });
    }

    // Validation du format UUID
    if (!validateUUID(coachId)) {
      return res.status(400).json({
        message: "Format de coachId invalide.",
      });
    }

    // Validation du type de session
    if (!validateSessionType(sessionType)) {
      return res.status(400).json({
        message: `Type de session invalide. Types acceptés: ${[
          "muscu",
          "yoga",
          "cardio",
          "autre",
        ].join(", ")}.`,
      });
    }

    // Validation des notes
    if (!validateNotes(notes)) {
      return res.status(400).json({
        message: "Les notes ne peuvent pas dépasser 500 caractères.",
      });
    }

    // Validation du format des dates
    if (!validateISODate(startDateTime) || !validateISODate(endDateTime)) {
      return res.status(400).json({
        message: "Format de date invalide. Utilisez le format ISO 8601.",
      });
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    // Validation de la plage de dates
    if (!validateDateRange(start, end)) {
      return res.status(400).json({
        message: "La date de fin doit être après la date de début.",
      });
    }

    // Validation que la date est dans le futur
    if (!validateFutureDate(start)) {
      return res.status(400).json({
        message: "Vous ne pouvez pas réserver un créneau dans le passé.",
      });
    }

    // Vérification que l'élève est bien lié à ce coach
    if (!user.coachId || user.coachId !== coachId) {
      return res.status(403).json({
        message:
          "Vous ne pouvez réserver qu'avec votre coach assigné dans l'application.",
      });
    }

    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        googleCalendarAccessToken: true,
        googleCalendarRefreshToken: true,
      },
    });

    if (!coach || coach.role !== "coach") {
      return res.status(400).json({
        message: "Le coach spécifié est invalide.",
      });
    }

    if (!coach.googleCalendarAccessToken || !coach.googleCalendarRefreshToken) {
      return res.status(400).json({
        message:
          "Ce coach n'a pas encore connecté son Google Calendar. La réservation n'est pas possible pour le moment.",
      });
    }

    const overlapping = await prisma.reservation.findFirst({
      where: {
        coachId,
        status: { in: ["pending", "confirmed"] },
        AND: [
          {
            startDateTime: {
              lt: end,
            },
          },
          {
            endDateTime: {
              gt: start,
            },
          },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({
        message:
          "Ce créneau est déjà réservé. Merci de choisir un autre horaire.",
      });
    }

    // Sanitization des notes
    const sanitizedNotes = sanitizeNotes(notes);

    const reservation = await prisma.reservation.create({
      data: {
        coachId,
        studentId: userId,
        startDateTime: start,
        endDateTime: end,
        sessionType,
        notes: sanitizedNotes,
        status: "pending",
        googleEventId: null,
      },
    });

    if (coach.email) {
      const reservationDateTime = formatDateTimeFrench(start);
      await sendEmail(
        coach.email,
        "Nouvelle demande de réservation - MyTrackLy",
        "reservationCoachNotification",
        {
          coachName: coach.name,
          studentName: user.name,
          reservationDateTime,
          sessionType,
          notes: notes || "",
        }
      );
    }

    res.status(201).json(reservation);
  } catch (error) {
    // Ne pas exposer les détails de l'erreur à l'utilisateur
    console.error(
      "[Calendar] Erreur lors de la création de la réservation:",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la création de la réservation. Veuillez réessayer.",
    });
  }
}

export async function getMyReservations(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const { dateFrom, dateTo } = req.query;

    const where: any = {};

    if (user.role === "coach") {
      where.coachId = userId;
    } else {
      where.studentId = userId;
    }

    if (dateFrom || dateTo) {
      where.startDateTime = {};
      if (dateFrom) where.startDateTime.gte = new Date(dateFrom as string);
      if (dateTo) where.startDateTime.lte = new Date(dateTo as string);
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { startDateTime: "asc" },
      include: {
        coach: {
          select: { id: true, name: true, email: true },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(reservations);
  } catch (error) {
    console.error(
      "[Calendar] Erreur lors de la récupération des réservations:",
      error
    );
    res
      .status(500)
      .json({ message: "Une erreur est survenue lors du chargement." });
  }
}

export async function updateReservationStatus(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: { role: true, name: true, email: true },
    });

    if (!coach || coach.role !== "coach") {
      return res.status(403).json({
        message: "Seuls les coaches peuvent gérer les réservations.",
      });
    }

    const { id } = req.params;
    const { action, startDateTime, endDateTime } = req.body as {
      action: "accept" | "reschedule" | "refuse";
      startDateTime?: string;
      endDateTime?: string;
    };

    if (!action || !["accept", "reschedule", "refuse"].includes(action)) {
      return res.status(400).json({
        message:
          "Action invalide. Actions possibles: 'accept', 'reschedule', 'refuse'.",
      });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        coach: {
          select: { id: true, name: true, email: true },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    if (reservation.coachId !== coachId) {
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette réservation.",
      });
    }

    let newStart = reservation.startDateTime;
    let newEnd = reservation.endDateTime;

    if (action === "reschedule") {
      if (!startDateTime || !endDateTime) {
        return res.status(400).json({
          message:
            "startDateTime et endDateTime sont requis pour décaler une réservation.",
        });
      }

      newStart = new Date(startDateTime);
      newEnd = new Date(endDateTime);

      if (
        isNaN(newStart.getTime()) ||
        isNaN(newEnd.getTime()) ||
        newEnd <= newStart
      ) {
        return res.status(400).json({
          message:
            "Les nouvelles dates de début et de fin de la réservation sont invalides.",
        });
      }

      // Valider que la nouvelle date de début est dans le futur
      const now = new Date();
      if (newStart < now) {
        return res.status(400).json({
          message: "Vous ne pouvez pas décaler une réservation dans le passé.",
        });
      }
    }

    let updatedReservation = reservation;

    if (action === "refuse") {
      if (reservation.googleEventId) {
        try {
          await deleteEventFromCoachCalendar(
            reservation.coachId,
            reservation.googleEventId
          );
        } catch (err) {
          console.error(
            "[Calendar] Erreur lors de la suppression de l'événement Google:",
            err
          );
        }
      }

      updatedReservation = await prisma.reservation.update({
        where: { id },
        data: {
          status: "refused",
          googleEventId: null,
        },
        include: {
          coach: {
            select: { id: true, name: true, email: true },
          },
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } else {
      const summary = `Séance ${reservation.sessionType} avec ${
        reservation.student?.name || ""
      }`;
      const description = reservation.notes
        ? `Motif: ${reservation.sessionType}\nNotes élève: ${reservation.notes}`
        : `Motif: ${reservation.sessionType}`;

      let googleEventId = reservation.googleEventId;

      try {
        // Créer/mettre à jour l'événement dans le calendrier du coach
        if (googleEventId) {
          await updateEventInCoachCalendar(reservation.coachId, googleEventId, {
            startDateTime: newStart,
            endDateTime: newEnd,
            summary,
            description,
          });
        } else {
          const event = await createEventInCoachCalendar({
            coachId: reservation.coachId,
            startDateTime: newStart,
            endDateTime: newEnd,
            summary,
            description,
          });
          googleEventId = event.id || null;
        }

        // Créer l'événement dans le calendrier de l'élève si connecté
        if (reservation.studentId) {
          const student = await prisma.user.findUnique({
            where: { id: reservation.studentId },
            select: {
              googleCalendarAccessToken: true,
              myTrackLyCalendarId: true,
              name: true,
            },
          });

          if (student?.googleCalendarAccessToken) {
            try {
              const studentSummary = `Séance ${reservation.sessionType} avec ${coach.name}`;
              const studentDescription = reservation.notes
                ? `Type: ${reservation.sessionType}\nNotes: ${reservation.notes}`
                : `Type: ${reservation.sessionType}`;

              await createEventInStudentCalendar(reservation.studentId, {
                startDateTime: newStart,
                endDateTime: newEnd,
                summary: studentSummary,
                description: studentDescription,
              });
            } catch (err) {
              // Ne pas bloquer si l'événement élève échoue, on log juste
              console.warn(
                "[Calendar] Erreur lors de la création de l'événement dans le calendrier de l'élève:",
                err
              );
            }
          }
        }
      } catch (err) {
        console.error(
          "[Calendar] Erreur lors de la création/mise à jour de l'événement Google:",
          err
        );
        return res.status(500).json({
          message:
            "Erreur lors de la synchronisation avec Google Calendar. La réservation n'a pas été confirmée. Veuillez réessayer.",
        });
      }

      updatedReservation = await prisma.reservation.update({
        where: { id },
        data: {
          startDateTime: newStart,
          endDateTime: newEnd,
          status: "confirmed",
          googleEventId,
        },
        include: {
          coach: {
            select: { id: true, name: true, email: true },
          },
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }

    if (reservation.student?.email) {
      const reservationDateTime = formatDateTimeFrench(newStart);
      let statusLabel = "mise à jour";

      if (action === "accept") statusLabel = "acceptée";
      if (action === "reschedule") statusLabel = "décalée";
      if (action === "refuse") statusLabel = "refusée";

      await sendEmail(
        reservation.student.email,
        "Mise à jour de votre réservation - MyTrackLy",
        "reservationStatusUpdate",
        {
          studentName: reservation.student.name,
          coachName: coach.name,
          reservationDateTime,
          sessionType: reservation.sessionType,
          notes: reservation.notes || "",
          statusLabel,
        }
      );
    }

    res.json(updatedReservation);
  } catch (error) {
    console.error(
      "[Calendar] Erreur lors de la mise à jour du statut de réservation:",
      error
    );
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la mise à jour de la réservation.",
    });
  }
}

export async function sendReservationReminder(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: { role: true, name: true },
    });

    if (!coach || coach.role !== "coach") {
      return res.status(403).json({
        message: "Seuls les coaches peuvent envoyer des rappels.",
      });
    }

    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        coach: {
          select: { id: true, name: true, email: true },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    if (reservation.coachId !== coachId) {
      return res.status(403).json({
        message: "Vous n'avez pas accès à cette réservation.",
      });
    }

    if (reservation.status !== "confirmed") {
      return res.status(400).json({
        message:
          "Vous ne pouvez envoyer un rappel que pour une réservation confirmée.",
      });
    }

    if (!reservation.student?.email) {
      return res.status(400).json({
        message: "L'élève n'a pas d'email valide.",
      });
    }

    const reservationDateTime = formatDateTimeFrench(reservation.startDateTime);

    await sendEmail(
      reservation.student.email,
      "Rappel de votre séance - MyTrackLy",
      "reservationReminder",
      {
        studentName: reservation.student.name,
        coachName: coach.name,
        reservationDateTime,
        sessionType: reservation.sessionType,
      }
    );

    res.json({ message: "Rappel envoyé avec succès." });
  } catch (error) {
    console.error(
      "[Calendar] Erreur lors de l'envoi du rappel de réservation:",
      error
    );
    res.status(500).json({
      message: "Une erreur est survenue lors de l'envoi du rappel.",
    });
  }
}

export async function cancelReservationByStudent(req: Request, res: Response) {
  try {
    const studentId = getUserIdFromRequest(req, res);
    if (!studentId) return;

    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        coach: {
          select: { id: true, name: true, email: true },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    if (reservation.studentId !== studentId) {
      return res.status(403).json({
        message: "Vous ne pouvez annuler que vos propres réservations.",
      });
    }

    if (
      reservation.status === "cancelled" ||
      reservation.status === "refused"
    ) {
      return res.status(400).json({
        message: "Cette réservation est déjà annulée ou refusée.",
      });
    }

    // Si la réservation est dans le passé
    const now = new Date();
    if (reservation.startDateTime < now) {
      return res.status(400).json({
        message: "Vous ne pouvez pas annuler une réservation passée.",
      });
    }

    // Supprimer l'événement Google si existant
    if (reservation.googleEventId && reservation.coachId) {
      try {
        await deleteEventFromCoachCalendar(
          reservation.coachId,
          reservation.googleEventId
        );
      } catch (err) {
        console.error(
          "[Calendar] Erreur lors de la suppression de l'événement Google (annulation):",
          err
        );
        // On continue même si erreur Google
      }
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: "cancelled",
        googleEventId: null,
      },
    });

    // Envoyer email au coach
    if (reservation.coach?.email) {
      const reservationDateTime = formatDateTimeFrench(
        reservation.startDateTime
      );

      await sendEmail(
        reservation.coach.email,
        "Annulation de réservation - MyTrackLy",
        "reservationCancelledNotification",
        {
          coachName: reservation.coach.name,
          studentName: reservation.student?.name || "Votre élève",
          reservationDateTime,
          sessionType: reservation.sessionType,
        }
      );
    }

    res.json({ message: "Réservation annulée avec succès." });
  } catch (error) {
    console.error(
      "[Calendar] Erreur lors de l'annulation de la réservation:",
      error
    );
    res.status(500).json({
      message: "Une erreur est survenue lors de l'annulation.",
    });
  }
}
