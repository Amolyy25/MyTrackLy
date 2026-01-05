import crypto from "crypto";

/**
 * Génère un token sécurisé et unique pour la réinitialisation de mot de passe
 * @returns Token hexadécimal de 64 caractères
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
