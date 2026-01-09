import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  setAvailabilities,
  getAvailabilities,
  getCoachSlots,
} from "../controllers/availabilityController";

const router = Router();

router.use(authenticateToken);

// Pour le coach : configurer ses dispos
router.post("/config", setAvailabilities);
router.get("/config", getAvailabilities);

// Pour l'élève (et le coach) : voir les créneaux libres pour une date
router.get("/slots", getCoachSlots);

export default router;

