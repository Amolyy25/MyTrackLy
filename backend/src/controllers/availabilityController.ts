import { Request, Response } from "express";
import prisma from "../config/database";
import {
  getGoogleCalendarBusySlots,
  createSecondaryCalendar,
} from "../services/googleCalendarService";

/**
 * Utility function to extract userId from req.user
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
 * Définit les disponibilités récurrentes du coach et sa configuration
 */
export async function setAvailabilities(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: {
        role: true,
        myTrackLyCalendarId: true,
        googleCalendarAccessToken: true,
      },
    });

    if (!coach || coach.role !== "coach") {
      return res.status(403).json({
        message: "Seuls les coaches peuvent définir leurs disponibilités.",
      });
    }

    // availabilities: [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }, ...]
    // slotDuration: 60 (minutes)
    const { availabilities, slotDuration } = req.body;

    if (!Array.isArray(availabilities)) {
      return res.status(400).json({
        message: "Le format des disponibilités est invalide.",
      });
    }

    // Validation basique des données
    for (const slot of availabilities) {
      if (
        typeof slot.dayOfWeek !== "number" ||
        slot.dayOfWeek < 0 ||
        slot.dayOfWeek > 6 ||
        !slot.startTime ||
        !slot.endTime
      ) {
        return res.status(400).json({
          message: "Format de créneau invalide (jour 0-6, startTime, endTime).",
        });
      }
    }

    // Création automatique du calendrier "Séances MyTrackLy" si connecté et pas encore créé
    let myTrackLyCalendarId = coach.myTrackLyCalendarId;
    if (coach.googleCalendarAccessToken && !myTrackLyCalendarId) {
      myTrackLyCalendarId = await createSecondaryCalendar(coachId);
    }

    // Transaction : mise à jour coach (duration + calendarId) et dispos
    await prisma.$transaction(async (tx) => {
      // Mettre à jour la config du coach
      await tx.user.update({
        where: { id: coachId },
        data: {
          slotDuration: typeof slotDuration === "number" ? slotDuration : 60,
          myTrackLyCalendarId: myTrackLyCalendarId,
        },
      });

      // Supprimer toutes les disponibilités existantes du coach
      await tx.coachAvailability.deleteMany({
        where: { coachId },
      });

      // Créer les nouvelles
      if (availabilities.length > 0) {
        await tx.coachAvailability.createMany({
          data: availabilities.map((slot: any) => ({
            coachId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: true,
          })),
        });
      }
    });

    res.json({ message: "Disponibilités et configuration mises à jour." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des disponibilités:", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la mise à jour des disponibilités.",
    });
  }
}

/**
 * Récupère les disponibilités configurées par le coach
 */
export async function getAvailabilities(req: Request, res: Response) {
  try {
    const coachId = getUserIdFromRequest(req, res);
    if (!coachId) return;

    // Récupérer la config du coach (durée)
    const coachConfig = await prisma.user.findUnique({
      where: { id: coachId },
      select: { slotDuration: true },
    });

    const availabilities = await prisma.coachAvailability.findMany({
      where: { coachId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    res.json({
      availabilities,
      slotDuration: coachConfig?.slotDuration || 60,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des disponibilités:", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la récupération des disponibilités.",
    });
  }
}

/**
 * Récupère les créneaux disponibles pour une date donnée (pour l'élève)
 * Prend en compte :
 * 1. Les disponibilités théoriques du coach (CoachAvailability)
 * 2. Les réservations existantes (Reservation)
 * 3. (Futur) Les événements Google Calendar
 */
export async function getCoachSlots(req: Request, res: Response) {
  try {
    const { coachId, date } = req.query;

    if (!coachId || typeof coachId !== "string") {
      return res.status(400).json({ message: "coachId est requis." });
    }

    if (!date || typeof date !== "string") {
      return res
        .status(400)
        .json({ message: "date est requise (YYYY-MM-DD)." });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Date invalide." });
    }

    // Récupérer la durée configurée par le coach
    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: { slotDuration: true, googleCalendarAccessToken: true },
    });
    const slotDurationMinutes = coach?.slotDuration || 60;

    // 1. Récupérer les disponibilités pour ce jour de la semaine
    const dayOfWeek = targetDate.getDay(); // 0-6

    const availabilities = await prisma.coachAvailability.findMany({
      where: {
        coachId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (availabilities.length === 0) {
      return res.json([]); // Pas de disponibilité ce jour-là
    }

    // 2. Générer tous les créneaux possibles avec la durée configurée
    const possibleSlots: { start: string; end: string }[] = [];

    for (const availability of availabilities) {
      const [startHour, startMinute] = availability.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = availability.endTime.split(":").map(Number);

      let currentMinute = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      while (currentMinute + slotDurationMinutes <= endTotalMinutes) {
        const h = Math.floor(currentMinute / 60);
        const m = currentMinute % 60;
        const startStr = `${String(h).padStart(2, "0")}:${String(m).padStart(
          2,
          "0"
        )}`;

        const endH = Math.floor((currentMinute + slotDurationMinutes) / 60);
        const endM = (currentMinute + slotDurationMinutes) % 60;
        const endStr = `${String(endH).padStart(2, "0")}:${String(
          endM
        ).padStart(2, "0")}`;

        possibleSlots.push({ start: startStr, end: endStr });
        currentMinute += slotDurationMinutes;
      }
    }

    // 3. Récupérer les réservations existantes pour ce jour
    // On prend toute la journée en UTC pour être sûr
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingReservations = await prisma.reservation.findMany({
      where: {
        coachId,
        status: { in: ["pending", "confirmed"] },
        startDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 4. Filtrer les créneaux qui chevauchent des réservations
    let availableSlots = possibleSlots.filter((slot) => {
      // Convertir le créneau en Date complète pour comparer
      const slotStart = new Date(`${date}T${slot.start}:00`);
      const slotEnd = new Date(`${date}T${slot.end}:00`);

      // Vérifier le chevauchement avec chaque réservation
      const hasConflict = existingReservations.some((reservation) => {
        // Logique de chevauchement : (StartA < EndB) et (EndA > StartB)
        return (
          slotStart < reservation.endDateTime &&
          slotEnd > reservation.startDateTime
        );
      });

      return !hasConflict;
    });

    // 5. Filtrer avec Google Calendar (Busy times)
    try {
      if (coach?.googleCalendarAccessToken) {
        // Récupérer les créneaux occupés sur Google Calendar
        const busySlots = await getGoogleCalendarBusySlots(
          coachId,
          startOfDay,
          endOfDay
        );

        if (busySlots.length > 0) {
          availableSlots = availableSlots.filter((slot) => {
            const slotStart = new Date(`${date}T${slot.start}:00`);
            const slotEnd = new Date(`${date}T${slot.end}:00`);

            const hasGoogleConflict = busySlots.some((busy) => {
              return slotStart < busy.end && slotEnd > busy.start;
            });

            return !hasGoogleConflict;
          });
        }
      }
    } catch (googleError) {
      console.warn(
        "Erreur lors de la récupération des dispos Google Calendar (non bloquant):",
        googleError
      );
    }

    res.json(availableSlots);
  } catch (error) {
    console.error("Erreur lors du calcul des créneaux:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors du calcul des créneaux.",
    });
  }
}
