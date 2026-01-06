import { Request, Response } from "express";
import dotenv from "dotenv";
import prisma from "../config/database";
import { verifyToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
const nodemailer = require("nodemailer");

dotenv.config();

// --- Utilitaires internes ---

function getEmailTemplate(name: string, data: Record<string, string>): string {
  const templatePath = path.resolve(__dirname, "templates", `${name}.html`);

  let finalPath = templatePath;
  if (!fs.existsSync(templatePath)) {
    finalPath = path.resolve(
      process.cwd(),
      "src",
      "email",
      "templates",
      `${name}.html`
    );
  }

  let template = fs.readFileSync(finalPath, "utf-8");

  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, data[key]);
  });

  return template;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || "erable.o2switch.net";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const secure = port === 465;

  console.log(`[SMTP] Connexion à ${host}:${port} (SSL: ${secure})`);

  return nodemailer.createTransport({
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
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
  });
}

// --- Fonctions exportées pour utilisation dans l'app ---

async function sendEmailWithRetry(
  mailOptions: any,
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<void> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let transporter: any = null;
    try {
      transporter = getTransporter();

      await transporter.sendMail(mailOptions);

      if (transporter.close) {
        transporter.close();
      }

      if (attempt > 1) {
        console.log(`[SMTP] Email envoyé après ${attempt} tentatives`);
      }
      return;
    } catch (error: any) {
      lastError = error;

      if (transporter && transporter.close) {
        try {
          transporter.close();
        } catch (e) {}
      }

      const isTimeout =
        error?.code === "ETIMEDOUT" ||
        error?.code === "ECONNRESET" ||
        error?.message?.includes("timeout") ||
        error?.message?.includes("Connection timeout");

      if (isTimeout && attempt < maxRetries) {
        console.warn(
          `[SMTP] Tentative ${attempt}/${maxRetries} échouée (timeout), retry dans ${retryDelay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 2;
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function sendEmail(
  to: string,
  subject: string,
  templateName: string,
  templateData: Record<string, string>
): Promise<void> {
  try {
    if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASSWORD) {
      console.error(
        "[SMTP] Configuration manquante (EMAIL_SENDER ou EMAIL_PASSWORD)"
      );
      return;
    }

    const htmlContent = getEmailTemplate(templateName, templateData);

    await sendEmailWithRetry({
      from: `MyTrackLy <${process.env.EMAIL_SENDER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log(`[SMTP] Email envoyé à ${to} (template: ${templateName})`);
  } catch (error: any) {
    console.error(
      `[SMTP] Erreur envoi email à ${to}:`,
      error?.code || error?.message || error
    );
  }
}

// --- Contrôleurs liés à la confirmation d'email ---

export async function sendEmailConfirmation(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const confirmationToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const confirmationUrl = `${frontendUrl}/confirm-email?token=${confirmationToken}`;

    await sendEmail(
      email,
      "Confirmez votre email - MyTrackLy",
      "emailConfirmation",
      {
        name: user.name,
        confirmationUrl: confirmationUrl,
      }
    );

    res.status(200).json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ message: "Erreur serveur interne" });
  }
}

export async function confirmEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token de confirmation requis" });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Email confirmé avec succès",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ message: "Erreur serveur interne" });
  }
}
