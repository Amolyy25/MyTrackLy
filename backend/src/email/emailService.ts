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
    const htmlContent = getEmailTemplate(templateName, templateData);
    const mailTransporter = getTransporter();

    await mailTransporter.sendMail({
      from: `MyTrackLy <${process.env.EMAIL_SENDER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Email envoyé avec succès à ${to} (template: ${templateName})`);
  } catch (error) {
    // Logger l'erreur mais ne pas faire échouer la requête principale
    console.error(`Erreur lors de l'envoi d'email à ${to}:`, error);
    // Ne pas throw l'erreur pour ne pas bloquer l'UI
  }
}


