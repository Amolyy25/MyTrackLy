import { Router } from "express";
import {
  register,
  login,
  getMe,
  requestPasswordResetController,
  resetPasswordController,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", requestPasswordResetController);
router.post("/reset-password", resetPasswordController);

router.get("/me", authenticateToken, getMe);

export default router;
