import { Router } from "express";
import { sendEmailConfirmation, confirmEmail } from "../email/emailService";

const router = Router();

router.post("/sendEmailConfirmation", sendEmailConfirmation);
router.get("/confirm", confirmEmail);

export default router;
