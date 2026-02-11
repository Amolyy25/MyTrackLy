import { Router } from "express";
import {
  getSessionsStats,
  getMeasurementsStats,
  getOverviewStats,
  getStudentStats,
  getStudentProfileStats,
  getCoachOverviewStats,
} from "../controllers/statsController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes générales
router.get("/sessions", getSessionsStats);
router.get("/measurements", getMeasurementsStats);
router.get("/overview", getOverviewStats);

// Routes coach
router.get("/coach/overview", getCoachOverviewStats);
router.get("/coach/students/:studentId/profile", getStudentProfileStats);
router.get("/coach/students/:studentId", getStudentStats);

export default router;
