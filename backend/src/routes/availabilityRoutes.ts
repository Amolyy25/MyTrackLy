import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  setAvailabilities,
  getAvailabilities,
  getCoachSlots,
  getServices,
  createService,
  updateService,
  deleteService,
  getPublicCoachProfile
} from "../controllers/availabilityController";

const router = Router();

// --- Routes Publiques ---
// Pour l'élève ou le visiteur : voir les créneaux libres pour une date
router.get("/slots", getCoachSlots);
// Voir le profil public du coach (services, dispos, infos)
router.get("/public/:id", getPublicCoachProfile);

// --- Routes Protégées (Coach) ---
router.use(authenticateToken);

// Configurer ses dispos
router.post("/config", setAvailabilities);
router.get("/config", getAvailabilities);

// Gestion des types de séance (Services)
router.get("/services", getServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

export default router;

