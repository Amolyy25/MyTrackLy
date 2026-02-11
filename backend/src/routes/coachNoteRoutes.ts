import { Router } from "express";
import {
  getCoachNotes,
  createCoachNote,
  updateCoachNote,
  deleteCoachNote,
} from "../controllers/coachNoteController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Notes par élève
router.get("/student/:studentId", getCoachNotes);
router.post("/student/:studentId", createCoachNote);

// Modification/suppression d'une note
router.put("/:noteId", updateCoachNote);
router.delete("/:noteId", deleteCoachNote);

export default router;
