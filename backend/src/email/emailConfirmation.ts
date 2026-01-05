import { Request, Response } from "express";
import dotenv from "dotenv";
import prisma from "../config/database";
import { verifyToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
const nodemailer = require("nodemailer");

dotenv.config();

// Fonction pour lire le template HTML
function getEmailTemplate(name: string, data: Record<string, string>): string {
  // Construire le chemin du template de manière fiable
  // __dirname pointe vers le répertoire du fichier source avec ts-node
  const templatePath = path.resolve(__dirname, "templates", `${name}.html`);

  // Vérifier que le fichier existe, sinon essayer avec process.cwd()
  let finalPath = templatePath;
  if (!fs.existsSync(templatePath)) {
    // Fallback: utiliser process.cwd() depuis le répertoire backend/
    finalPath = path.resolve(
      process.cwd(),
      "src",
      "email",
      "templates",
      `${name}.html`
    );
  }

  let template = fs.readFileSync(finalPath, "utf-8");

  // Remplacer les placeholders
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, data[key]);
  });

  return template;
}

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

    // Générer un token de confirmation (valide 24h)
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

    // Construire l'URL de confirmation
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const confirmationUrl = `${frontendUrl}/confirm-email?token=${confirmationToken}`;

    // Charger et remplir le template HTML
    const htmlContent = getEmailTemplate("emailConfirmation", {
      name: user.name,
      confirmationUrl: confirmationUrl,
    });

    // Configuration adaptée pour Railway (port 587 TLS) ou local (port 465 SSL)
    const isProduction = 
      process.env.NODE_ENV === "production" || 
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_SERVICE_NAME ||
      (process.env.PORT && !process.env.NODE_ENV);
    
    const smtpConfig: any = {
      host: "erable.o2switch.net",
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: isProduction ? 90000 : 30000, // 90s en prod
      greetingTimeout: isProduction ? 90000 : 30000,
      socketTimeout: isProduction ? 90000 : 30000,
      debug: false,
      logger: false,
    };

    if (isProduction) {
      // Railway : port 587 avec TLS
      smtpConfig.port = 587;
      smtpConfig.secure = false;
      smtpConfig.requireTLS = true;
      smtpConfig.tls = {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      };
      smtpConfig.pool = false;
      smtpConfig.ignoreTLS = false;
      smtpConfig.opportunisticTLS = true;
    } else {
      // Local : port 465 avec SSL
      smtpConfig.port = 465;
      smtpConfig.secure = true;
      smtpConfig.pool = true;
    }

    const transporter = nodemailer.createTransport(smtpConfig);

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

    // Vérifier le token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    // Mettre à jour l'utilisateur (marquer l'email comme vérifié)
    // Note: Tu devras ajouter un champ emailVerified dans ton schéma Prisma si tu veux suivre ça
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Pour l'instant, on considère que l'email est confirmé si le token est valide
    // Tu peux ajouter un champ emailVerified dans le schéma plus tard si besoin

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
