import { Request, Response } from "express";
import dotenv from "dotenv";
import prisma from "../config/database";
import { verifyToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
const nodemailer = require("nodemailer");

dotenv.config();

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

    const htmlContent = getEmailTemplate("emailConfirmation", {
      name: user.name,
      confirmationUrl: confirmationUrl,
    });

    // Configuration SMTP standard
    const transporter = nodemailer.createTransport({
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
