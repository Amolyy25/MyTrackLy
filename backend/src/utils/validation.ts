/**
 * Utilitaires de validation pour les réservations et autres entités
 */

export const SESSION_TYPES = ["muscu", "yoga", "cardio", "autre"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "refused",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

/**
 * Valide le type de session
 */
export function validateSessionType(
  sessionType: unknown
): sessionType is SessionType {
  return (
    typeof sessionType === "string" &&
    SESSION_TYPES.includes(sessionType as SessionType)
  );
}

/**
 * Valide le statut de réservation
 */
export function validateReservationStatus(
  status: unknown
): status is ReservationStatus {
  return (
    typeof status === "string" &&
    RESERVATION_STATUSES.includes(status as ReservationStatus)
  );
}

/**
 * Valide une date ISO string
 */
export function validateISODate(dateString: unknown): boolean {
  if (typeof dateString !== "string") return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}

/**
 * Valide que la date est dans le futur
 */
export function validateFutureDate(date: Date): boolean {
  const now = new Date();
  return date > now;
}

/**
 * Valide que la date de fin est après la date de début
 */
export function validateDateRange(start: Date, end: Date): boolean {
  return end > start;
}

/**
 * Valide les notes (longueur max 500 caractères)
 */
export function validateNotes(notes: unknown): boolean {
  if (notes === null || notes === undefined) return true; // Optionnel
  if (typeof notes !== "string") return false;
  return notes.length <= 500;
}

/**
 * Valide un UUID
 */
export function validateUUID(uuid: unknown): boolean {
  if (typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valide un email
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un jour de la semaine (0-6)
 */
export function validateDayOfWeek(day: unknown): boolean {
  return typeof day === "number" && day >= 0 && day <= 6;
}

/**
 * Valide un format d'heure HH:mm
 */
export function validateTimeFormat(time: unknown): boolean {
  if (typeof time !== "string") return false;
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Valide que startTime < endTime
 */
export function validateTimeRange(
  startTime: string,
  endTime: string
): boolean {
  if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
    return false;
  }
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes > startMinutes;
}



