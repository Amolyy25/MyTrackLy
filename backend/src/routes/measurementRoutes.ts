import { Router } from "express";
import {
  getMeasurements,
  getMeasurement,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getStudentMeasurements,
} from "../controllers/measurementController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les mensurations personnelles
router.get("/", getMeasurements);
router.post("/", createMeasurement);
router.get("/:id", getMeasurement);
router.put("/:id", updateMeasurement);
router.delete("/:id", deleteMeasurement);

// Routes pour le coach (voir les mensurations de ses élèves)
router.get("/student/:studentId", getStudentMeasurements);

export default router;




