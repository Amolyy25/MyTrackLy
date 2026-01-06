import { Router } from "express";
import { sendEmailConfirmation, confirmEmail } from "../email/emailService";
import { Request, Response } from "express";
const nodemailer = require("nodemailer");

const router = Router();

router.post("/sendEmailConfirmation", sendEmailConfirmation);
router.get("/confirm", confirmEmail);

// Route de test SMTP (temporaire pour diagnostic)
router.get("/test-smtp", async (req: Request, res: Response) => {
  try {
    const host = process.env.SMTP_HOST || "erable.o2switch.net";
    const port = parseInt(process.env.SMTP_PORT || "465");
    const secure = port === 465;

    console.log(`[TEST SMTP] Tentative connexion à ${host}:${port}`);

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: true,
      logger: true,
    });

    // Test de connexion uniquement (sans envoyer d'email)
    await transporter.verify();

    res.json({
      success: true,
      message: "Connexion SMTP réussie",
      config: {
        host,
        port,
        secure,
        user: process.env.EMAIL_SENDER,
      },
    });
  } catch (error: any) {
    console.error("[TEST SMTP] Erreur:", error);
    res.status(500).json({
      success: false,
      error: {
        code: error?.code,
        message: error?.message,
        command: error?.command,
        response: error?.response,
      },
    });
  }
});

export default router;
