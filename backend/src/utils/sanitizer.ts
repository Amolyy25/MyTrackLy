/**
 * Utilitaires de sanitization pour prévenir les attaques XSS
 */

/**
 * Échappe les caractères HTML pour prévenir XSS
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Nettoie les notes en échappant le HTML et en limitant la longueur
 */
export function sanitizeNotes(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const cleaned = escapeHtml(notes.trim());
  return cleaned.length > 500 ? cleaned.substring(0, 500) : cleaned;
}

/**
 * Nettoie un nom (supprime les caractères dangereux, limite la longueur)
 */
export function sanitizeName(name: string | null | undefined): string {
  if (!name) return "";
  return escapeHtml(name.trim()).substring(0, 100);
}

/**
 * Nettoie une description (échappe HTML, limite longueur)
 */
export function sanitizeDescription(
  description: string | null | undefined,
  maxLength: number = 1000
): string | null {
  if (!description) return null;
  const cleaned = escapeHtml(description.trim());
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength) : cleaned;
}



