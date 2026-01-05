import { Router } from "express";
import {
  getExercises,
  getMyExercises,
} from "../controllers/exerciseController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

router.get("/", getExercises); // Tous les exercices (prédéfinis + custom de l'utilisateur)
router.get("/my-library", getMyExercises); // Uniquement les exercices custom de l'utilisateur

export default router;
