/**
 * Utilitaires pour le formatage et la manipulation des dates
 */

/**
 * Obtient le numéro de semaine ISO (1-53)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Formate une date pour l'affichage du mois (ex: "janv. 24")
 */
export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

/**
 * Formate une date pour l'affichage court (ex: "15 janv.")
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/**
 * Formate le label de la semaine (ex: "S12")
 */
export function formatWeekLabel(year: number, week: number): string {
  return `S${week}`;
}

/**
 * Génère une clé de mois au format "YYYY-M"
 */
export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/**
 * Génère une clé de semaine au format "YYYY-W"
 */
export function getWeekKey(date: Date): string {
  return `${date.getFullYear()}-${getWeekNumber(date)}`;
}

/**
 * Crée un tableau de dates pour les N derniers mois
 */
export function getLastMonths(count: number): Date[] {
  const now = new Date();
  const months: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  return months;
}

/**
 * Crée un tableau de dates pour les N dernières semaines
 */
export function getLastWeeks(count: number): Date[] {
  const now = new Date();
  const weeks: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(d);
  }
  return weeks;
}
