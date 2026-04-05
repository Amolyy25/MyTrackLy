import { Router } from "express";
import {
  createPlan,
  getMyPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getPlanProgress,
  getAISuggestions,
  logPlanSession,
  addPlanDay,
  updatePlanDay,
  deletePlanDay,
  addPlanExercise,
  updatePlanExercise,
  deletePlanExercise,
} from "../controllers/trainingPlanController";

const router = Router();

router.post("/", createPlan);
router.get("/", getMyPlans);
router.get("/:id", getPlanById);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);
router.get("/:id/progress", getPlanProgress);
router.post("/:id/ai-suggestions", getAISuggestions);
router.post("/:id/log-session", logPlanSession);

// Plan day routes
router.post("/:id/days", addPlanDay);
router.put("/:id/days/:dayId", updatePlanDay);
router.delete("/:id/days/:dayId", deletePlanDay);

// Plan exercise routes
router.post("/:id/days/:dayId/exercises", addPlanExercise);
router.put("/:id/days/:dayId/exercises/:exId", updatePlanExercise);
router.delete("/:id/days/:dayId/exercises/:exId", deletePlanExercise);

export default router;
