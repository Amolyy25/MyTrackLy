import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  reservationRateLimiter,
  googleOAuthRateLimiter,
} from "../middleware/rateLimiter";
import {
  getGoogleAuthUrl,
  googleOAuthCallback,
  createReservation,
  getMyReservations,
  updateReservationStatus,
  sendReservationReminder,
  cancelReservationByStudent,
} from "../controllers/calendarController";

const router = Router();

// Le callback Google ne peut pas utiliser authenticateToken car il vient directement de Google.
router.get("/google/callback", googleOAuthCallback);

// Toutes les autres routes nécessitent le JWT
router.use(authenticateToken);

// Rate limiting pour OAuth Google (5 requêtes/heure)
router.get("/google/auth-url", googleOAuthRateLimiter, getGoogleAuthUrl);

// Rate limiting pour les réservations (10 requêtes/heure)
router.post("/reservations", reservationRateLimiter, createReservation);

router.get("/reservations", getMyReservations);
router.patch("/reservations/:id/status", updateReservationStatus);
router.post("/reservations/:id/reminder", sendReservationReminder);
router.patch("/reservations/:id/cancel", cancelReservationByStudent);

export default router;
