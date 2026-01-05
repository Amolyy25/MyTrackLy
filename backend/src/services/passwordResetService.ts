import prisma from "../config/database";
import { hashPassword } from "../utils/bcrypt";
import { sendEmail } from "../email/emailService";
import { generateResetToken } from "../utils/tokenGenerator";

// Constantes de configuration
const TOKEN_EXPIRATION_HOURS = 1;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Génère et enregistre un token de réinitialisation de mot de passe
 * @param email - Email de l'utilisateur
 * @returns Message de succès (toujours retourné pour des raisons de sécurité)
 */
export async function requestPasswordReset(email: string): Promise<string> {
  // Normaliser l'email
  const normalizedEmail = email.toLowerCase().trim();

  // Chercher l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
  // On retourne toujours un message de succès
  if (!user) {
    return "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.";
  }

  // Supprimer les anciens tokens de reset pour cet utilisateur
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  // Générer un token unique
  const resetToken = generateResetToken();

  // Créer le token avec expiration
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt: expiresAt,
    },
  });

  // Construire l'URL de reset
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  // Envoyer l'email de reset (asynchrone, ne bloque pas la réponse)
  sendEmail(
    user.email,
    "Réinitialisation de votre mot de passe - MyTrackLy",
    "passwordReset",
    {
      userName: user.name,
      resetUrl: resetUrl,
    }
  ).catch((error) => {
    console.error("Erreur lors de l'envoi de l'email de reset:", error);
  });

  return "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.";
}

/**
 * Valide et utilise un token de réinitialisation pour changer le mot de passe
 * @param token - Token de réinitialisation
 * @param newPassword - Nouveau mot de passe
 * @throws Error si le token est invalide, expiré ou si le mot de passe ne respecte pas les critères
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<void> {
  // Validation du mot de passe
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`
    );
  }

  // Chercher le token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    throw new Error("Token invalide ou expiré.");
  }

  // Vérifier l'expiration
  if (resetToken.expiresAt < new Date()) {
    // Supprimer le token expiré
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    throw new Error("Token invalide ou expiré.");
  }

  // Hacher le nouveau mot de passe
  const passwordHash = await hashPassword(newPassword);

  // Mettre à jour le mot de passe de l'utilisateur
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  // Supprimer le token utilisé
  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });
}
