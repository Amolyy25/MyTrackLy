import { Request, Response } from "express";
import dotenv from "dotenv";
import prisma from "../config/database";
import { verifyToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { Resend } from "resend";

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

  // Gérer les conditionnels {{#if key}}...{{/if}}
  // Supprimer les blocs si la valeur est vide/null/undefined
  template = template.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
    const value = data[key];
    if (value && value.trim() !== "") {
      // La valeur existe, garder le contenu et remplacer les variables à l'intérieur
      return content;
    }
    // La valeur est vide, supprimer le bloc
    return "";
  });

  // Remplacer les variables simples {{key}} (y compris avec espaces autour)
  Object.keys(data).forEach((key) => {
    // Gérer les espaces optionnels autour de la clé
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    template = template.replace(regex, data[key]);
  });

  return template;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_APIKEY;
    if (!apiKey) {
      throw new Error("RESEND_APIKEY manquante");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail(
  to: string,
  subject: string,
  templateName: string,
  templateData: Record<string, string>
): Promise<void> {
  try {
    if (!process.env.RESEND_APIKEY) {
      console.error("RESEND_APIKEY manquante");
      return;
    }

    const fromEmail = process.env.EMAIL_SENDER || "onboarding@resend.dev";
    const htmlContent = getEmailTemplate(templateName, templateData);
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: `MyTrackLy <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error(`Erreur envoi email à ${to}:`, error);
      return;
    }

    console.log(
      `Email envoyé à ${to} (template: ${templateName}, id: ${data?.id})`
    );
  } catch (error: any) {
    console.error(`Erreur envoi email à ${to}:`, error?.message || error);
  }
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
