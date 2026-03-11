import { Router } from "express";
import {
  getStudents,
  getStudentDetails,
  createVirtualStudent,
  updateVirtualStudent,
  deleteVirtualStudent,
  getMyCoach,
} from "../controllers/studentController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Liste des élèves (actifs + fiches clients)
router.get("/", getStudents);

// Infos sur le coach (pour l'élève)
router.get("/my-coach", getMyCoach);

// Fiches clients (élèves virtuels)
router.post("/virtual", createVirtualStudent);
router.put("/virtual/:studentId", updateVirtualStudent);
router.delete("/virtual/:studentId", deleteVirtualStudent);

// Détails d'un élève
router.get("/:studentId", getStudentDetails);

export default router;







