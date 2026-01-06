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

// Fonction utilitaire interne pour récupérer le transporter
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "erable.o2switch.net",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true, // SSL (465)
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// --- Fonctions exportées pour utilisation dans l'app ---

/**
 * Envoie un email générique (utilisé par les contrôleurs)
 */
export async function sendEmail(
  to: string,
  subject: string,
  templateName: string,
  templateData: Record<string, string>
): Promise<void> {
  try {
    if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASSWORD) {
      console.error(
        "Configuration email manquante (EMAIL_SENDER ou EMAIL_PASSWORD)"
      );
      return;
    }

    const htmlContent = getEmailTemplate(templateName, templateData);
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `MyTrackLy <${process.env.EMAIL_SENDER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Email envoyé à ${to} (template: ${templateName})`);
  } catch (error: any) {
    console.error(`Erreur envoi email à ${to}:`, error?.message || error);
    // On ne throw pas l'erreur ici pour ne pas bloquer le flux principal
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

    // Utilisation directe de la fonction sendEmail interne pour éviter la duplication
    // Mais ici on veut gérer la réponse HTTP, donc on garde la logique spécifique si besoin
    // Pour simplifier, on reconstruit juste le contenu et on envoie.

    const htmlContent = getEmailTemplate("emailConfirmation", {
      name: user.name,
      confirmationUrl: confirmationUrl,
    });

    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `MyTrackLy <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject: "Confirmez votre email - MyTrackLy",
      html: htmlContent,
    });

    if (info.error) {
      console.error("Erreur nodemailer:", info.error);
      return res.status(400).json({ message: "Erreur lors de l'envoi" });
    }

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
