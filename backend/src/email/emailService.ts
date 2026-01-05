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
    transporter = nodemailer.createTransport({
      host: "erable.o2switch.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Options de timeout pour éviter les erreurs de connexion
      connectionTimeout: 30000, // 30 secondes pour établir la connexion
      greetingTimeout: 30000, // 30 secondes pour la réponse du serveur
      socketTimeout: 30000, // 30 secondes pour les opérations socket
      // Options de retry
      pool: true, // Utiliser un pool de connexions
      maxConnections: 5, // Nombre max de connexions simultanées
      maxMessages: 100, // Nombre max de messages par connexion
    });
  }
  return transporter;
}

/**
 * Envoie un email de manière asynchrone (ne bloque pas)
 * Gère les erreurs en les loggant sans faire échouer la requête principale
 */
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

    await mailTransporter.sendMail({
      from: `MyTrackLy <${process.env.EMAIL_SENDER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

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
    };

    console.error(
      `Erreur lors de l'envoi d'email à ${to}:`,
      JSON.stringify(errorDetails, null, 2)
    );

    // Ne pas throw l'erreur pour ne pas bloquer la requête principale
    // L'erreur est déjà loggée pour diagnostic
  }
}
