import { Router } from "express";
import {
  getStudents,
  getStudentDetails,
} from "../controllers/studentController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

router.get("/", getStudents);
router.get("/:studentId", getStudentDetails);

export default router;







