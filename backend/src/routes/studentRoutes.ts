import { Router } from "express";
import {
  getStudents,
  getStudentDetails,
  createVirtualStudent,
  updateVirtualStudent,
  deleteVirtualStudent,
} from "../controllers/studentController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Liste des élèves (actifs + fiches clients)
router.get("/", getStudents);

// Fiches clients (élèves virtuels)
router.post("/virtual", createVirtualStudent);
router.put("/virtual/:studentId", updateVirtualStudent);
router.delete("/virtual/:studentId", deleteVirtualStudent);

// Détails d'un élève
router.get("/:studentId", getStudentDetails);

export default router;







