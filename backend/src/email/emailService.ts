import dotenv from "dotenv";
import fs from "fs";
import path from "path";
const nodemailer = require("nodemailer");

dotenv.config();

// Fonction pour lire le template HTML (partagée avec emailConfirmation.ts)
export function getEmailTemplate(
  name: string,
  data: Record<string, string>
): string {
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

// Créer le transporter nodemailer (singleton)
let transporter: any = null;

function getTransporter() {
  if (!transporter) {
    // Détecter l'environnement (production = Railway, développement = local)
    const isProduction = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT;
    
    // Configuration pour Railway : utiliser port 587 (TLS) au lieu de 465 (SSL)
    // Le port 587 est souvent moins bloqué par les plateformes cloud
    const smtpConfig: any = {
      host: "erable.o2switch.net",
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Timeouts augmentés pour Railway (connexions plus lentes)
      connectionTimeout: isProduction ? 60000 : 30000, // 60s en prod, 30s en dev
      greetingTimeout: isProduction ? 60000 : 30000,
      socketTimeout: isProduction ? 60000 : 30000,
    };

    if (isProduction) {
      // En production (Railway) : utiliser port 587 avec TLS
      smtpConfig.port = 587;
      smtpConfig.secure = false; // false pour TLS
      smtpConfig.requireTLS = true; // Forcer TLS
      smtpConfig.tls = {
        rejectUnauthorized: false, // Accepter les certificats auto-signés si nécessaire
      };
      // Pas de pool en production pour éviter les problèmes de connexion persistante
      smtpConfig.pool = false;
    } else {
      // En développement : utiliser port 465 avec SSL (plus rapide)
      smtpConfig.port = 465;
      smtpConfig.secure = true; // true pour SSL
      smtpConfig.pool = true; // Pool OK en local
      smtpConfig.maxConnections = 5;
      smtpConfig.maxMessages = 100;
    }

    transporter = nodemailer.createTransport(smtpConfig);
  }
  return transporter;
}

/**
 * Envoie un email de manière asynchrone (ne bloque pas)
 * Gère les erreurs en les loggant sans faire échouer la requête principale
 */
/**
 * Envoie un email avec retry automatique en cas d'échec
 */
async function sendEmailWithRetry(
  mailTransporter: any,
  mailOptions: any,
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<void> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mailTransporter.sendMail(mailOptions);
      if (attempt > 1) {
        console.log(`Email envoyé avec succès après ${attempt} tentatives`);
      }
      return; // Succès, sortir de la fonction
    } catch (error: any) {
      lastError = error;
      
      // Si c'est un timeout et qu'il reste des tentatives, réessayer
      if (
        (error?.code === "ETIMEDOUT" || error?.code === "ECONNRESET") &&
        attempt < maxRetries
      ) {
        console.warn(
          `Tentative ${attempt}/${maxRetries} échouée (${error?.code}), nouvelle tentative dans ${retryDelay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        // Augmenter le délai pour la prochaine tentative (backoff exponentiel)
        retryDelay *= 2;
        continue;
      }
      
      // Si ce n'est pas un timeout ou dernière tentative, throw l'erreur
      throw error;
    }
  }

  // Si on arrive ici, toutes les tentatives ont échoué
  throw lastError;
}

export async function sendEmail(
  to: string,
  subject: string,
  templateName: string,
  templateData: Record<string, string>
): Promise<void> {
  try {
    // Vérifier que les variables d'environnement sont configurées
    if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASSWORD) {
      console.error(
        "Configuration email manquante: EMAIL_SENDER ou EMAIL_PASSWORD non défini"
      );
      return;
    }

    const htmlContent = getEmailTemplate(templateName, templateData);
    const mailTransporter = getTransporter();

    const mailOptions = {
      from: `MyTrackLy <${process.env.EMAIL_SENDER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    // Utiliser retry automatique pour les timeouts
    await sendEmailWithRetry(mailTransporter, mailOptions);

    console.log(`Email envoyé avec succès à ${to} (template: ${templateName})`);
  } catch (error: any) {
    // Logger l'erreur avec plus de détails pour le diagnostic
    const errorDetails = {
      to,
      template: templateName,
      errorCode: error?.code,
      errorMessage: error?.message,
      command: error?.command,
      response: error?.response,
      environment: process.env.NODE_ENV || "development",
      railwayEnv: process.env.RAILWAY_ENVIRONMENT || "not-set",
    };

    console.error(
      `Erreur lors de l'envoi d'email à ${to}:`,
      JSON.stringify(errorDetails, null, 2)
    );

    // Ne pas throw l'erreur pour ne pas bloquer la requête principale
    // L'erreur est déjà loggée pour diagnostic
  }
}
