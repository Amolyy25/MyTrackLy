import { Router } from "express";
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  checkHabit,
  uncheckHabit,
  getHabitStats,
} from "../controllers/habitController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les habitudes
router.get("/", getHabits);
router.post("/", createHabit);
router.get("/stats", getHabitStats);
router.get("/:id", getHabit);
router.patch("/:id", updateHabit);
router.delete("/:id", deleteHabit);
router.post("/:id/check", checkHabit);
router.delete("/:id/uncheck", uncheckHabit);

export default router;
