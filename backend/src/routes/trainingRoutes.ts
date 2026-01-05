import { Router } from "express";
import {
  getTrainingSessions,
  getTrainingStats,
  CreateTrainingSession,
  getTrainingSession,
  updateTrainingSession,
  deleteTrainingSession,
  getCoachStudentsSessions,
  createTrainingSessionForStudent,
  addCoachComment,
} from "../controllers/trainingController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

router.get("/stats", getTrainingStats);

// Routes pour le coach
router.get("/coach/students", getCoachStudentsSessions);
router.post("/coach/:studentId", createTrainingSessionForStudent);
router.put("/:id/coach-comment", addCoachComment);

router.post("/", CreateTrainingSession);
router.get("/", getTrainingSessions);

router.get("/:id", getTrainingSession);
router.put("/:id", updateTrainingSession);
router.delete("/:id", deleteTrainingSession);

export default router;
