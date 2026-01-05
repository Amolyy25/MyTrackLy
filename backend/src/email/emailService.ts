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

// Créer le transporter nodemailer
// En production, on crée un nouveau transporter à chaque fois pour éviter les problèmes de connexion persistante
function getTransporter() {
  // Détecter l'environnement de production (Railway, Render, etc.)
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_SERVICE_NAME ||
    process.env.RENDER || // Render définit RENDER=true
    process.env.RENDER_SERVICE_NAME ||
    (process.env.PORT && !process.env.NODE_ENV); // Les plateformes cloud définissent toujours PORT

  // Configuration SMTP : utiliser port 587 (TLS) en production, 465 (SSL) en local
  const smtpConfig: any = {
    host: "erable.o2switch.net",
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Timeouts augmentés pour production
    connectionTimeout: isProduction ? 60000 : 30000, // 60s en prod pour Render
    greetingTimeout: isProduction ? 60000 : 30000,
    socketTimeout: isProduction ? 60000 : 30000,
    // Options supplémentaires pour améliorer la connexion
    debug: false,
    logger: false,
  };

  if (isProduction) {
    // En production (Render) : utiliser port 587 avec TLS (plus fiable que 465)
    smtpConfig.port = 587;
    smtpConfig.secure = false; // false pour TLS
    smtpConfig.requireTLS = true;
    smtpConfig.tls = {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    };
    smtpConfig.pool = false; // Pas de pool en production
    smtpConfig.ignoreTLS = false;
    smtpConfig.opportunisticTLS = true;
  } else {
    // En développement : utiliser port 465 avec SSL
    smtpConfig.port = 465;
    smtpConfig.secure = true; // true pour SSL
    smtpConfig.pool = true;
    smtpConfig.maxConnections = 5;
    smtpConfig.maxMessages = 100;
  }

  return nodemailer.createTransport(smtpConfig);
}

/**
 * Envoie un email de manière asynchrone (ne bloque pas)
 * Gère les erreurs en les loggant sans faire échouer la requête principale
 */
/**
 * Envoie un email avec retry automatique en cas d'échec
 * Crée un nouveau transporter à chaque tentative en production pour éviter les problèmes de connexion persistante
 */
async function sendEmailWithRetry(
  mailOptions: any,
  maxRetries: number = 3,
  retryDelay: number = 3000
): Promise<void> {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let mailTransporter: any = null;
    try {
      // En production, créer un nouveau transporter à chaque tentative
      // Cela évite les problèmes de connexion persistante qui peuvent rester dans un mauvais état
      mailTransporter = getTransporter();

      await mailTransporter.sendMail(mailOptions);

      // Fermer la connexion proprement
      if (mailTransporter.close) {
        mailTransporter.close();
      }

      if (attempt > 1) {
        console.log(`Email envoyé avec succès après ${attempt} tentatives`);
      }
      return; // Succès, sortir de la fonction
    } catch (error: any) {
      lastError = error;

      // Fermer la connexion en cas d'erreur
      if (mailTransporter && mailTransporter.close) {
        try {
          mailTransporter.close();
        } catch (closeError) {
          // Ignorer les erreurs de fermeture
        }
      }

      // Si c'est un timeout et qu'il reste des tentatives, réessayer
      if (
        (error?.code === "ETIMEDOUT" ||
          error?.code === "ECONNRESET" ||
          error?.code === "ETIMEDOUT" ||
          error?.message?.includes("timeout") ||
          error?.message?.includes("Connection timeout")) &&
        attempt < maxRetries
      ) {
        console.warn(
          `Tentative ${attempt}/${maxRetries} échouée (${
            error?.code || error?.message
          }), nouvelle tentative dans ${retryDelay}ms...`
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

    const mailOptions = {
      from: `MyTrackLy <${process.env.EMAIL_SENDER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    // Utiliser retry automatique pour les timeouts (crée un nouveau transporter à chaque tentative en prod)
    await sendEmailWithRetry(mailOptions);

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
