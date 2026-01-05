import { Router } from "express";
import {
  createInvitationCode,
  getInvitationCodes,
  validateInvitationCode,
} from "../controllers/invitationController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Route publique pour valider un code (utilisée lors de l'inscription)
router.post("/validate", validateInvitationCode);

// Routes protégées pour les coaches
router.use(authenticateToken);
router.post("/", createInvitationCode);
router.get("/", getInvitationCodes);

export default router;



