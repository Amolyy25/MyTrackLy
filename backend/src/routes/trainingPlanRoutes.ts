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

export default router;
