import { HabitCategory } from "../types";

export interface HabitCategoryConfig {
  value: HabitCategory;
  label: string;
  emoji: string;
  color: string;
  colorClass: string;
  defaultUnit?: string;
}

export const HABIT_CATEGORIES: HabitCategoryConfig[] = [
  { value: "hydration", label: "Hydratation", emoji: "💧", color: "#3b82f6", colorClass: "bg-blue-500", defaultUnit: "L" },
  { value: "sleep", label: "Sommeil", emoji: "😴", color: "#8b5cf6", colorClass: "bg-violet-500", defaultUnit: "h" },
  { value: "nutrition", label: "Nutrition", emoji: "🥗", color: "#22c55e", colorClass: "bg-green-500" },
  { value: "exercise", label: "Exercice", emoji: "💪", color: "#f97316", colorClass: "bg-orange-500", defaultUnit: "min" },
  { value: "wellness", label: "Bien-etre", emoji: "🧘", color: "#ec4899", colorClass: "bg-pink-500" },
  { value: "stretching", label: "Etirements", emoji: "🤸", color: "#14b8a6", colorClass: "bg-teal-500", defaultUnit: "min" },
  { value: "meditation", label: "Meditation", emoji: "🧠", color: "#a855f7", colorClass: "bg-purple-500", defaultUnit: "min" },
  { value: "supplements", label: "Supplements", emoji: "💊", color: "#ef4444", colorClass: "bg-red-500" },
  { value: "cardio", label: "Cardio", emoji: "🏃", color: "#f59e0b", colorClass: "bg-amber-500", defaultUnit: "min" },
  { value: "posture", label: "Posture", emoji: "🧍", color: "#06b6d4", colorClass: "bg-cyan-500" },
  { value: "journaling", label: "Journal", emoji: "📝", color: "#84cc16", colorClass: "bg-lime-500" },
  { value: "cold_exposure", label: "Douche froide", emoji: "🥶", color: "#0ea5e9", colorClass: "bg-sky-500", defaultUnit: "min" },
  { value: "reading", label: "Lecture", emoji: "📖", color: "#d946ef", colorClass: "bg-fuchsia-500", defaultUnit: "pages" },
  { value: "screen_limit", label: "Limite ecran", emoji: "📵", color: "#64748b", colorClass: "bg-slate-500", defaultUnit: "h" },
  { value: "custom", label: "Personnalise", emoji: "⭐", color: "#6366f1", colorClass: "bg-indigo-500" },
];

export function getCategoryConfig(category: string): HabitCategoryConfig {
  return HABIT_CATEGORIES.find((c) => c.value === category) ?? HABIT_CATEGORIES[HABIT_CATEGORIES.length - 1];
}

export function getCategoryEmoji(category: string): string {
  return getCategoryConfig(category).emoji;
}

export function getCategoryLabel(category: string): string {
  return getCategoryConfig(category).label;
}

export function getCategoryColor(category: string): string {
  return getCategoryConfig(category).color;
}

export const HABIT_UNITS = [
  { value: "", label: "Aucune (check)" },
  { value: "L", label: "Litres" },
  { value: "ml", label: "Millilitres" },
  { value: "h", label: "Heures" },
  { value: "min", label: "Minutes" },
  { value: "cal", label: "Calories" },
  { value: "g", label: "Grammes" },
  { value: "kg", label: "Kilogrammes" },
  { value: "km", label: "Kilometres" },
  { value: "pas", label: "Pas" },
  { value: "pages", label: "Pages" },
  { value: "fois", label: "Fois" },
];

export const DAYS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/**
 * Suggested habits based on a training plan's body goal.
 */
export function getSuggestedHabits(bodyGoal: string | null | undefined): { name: string; category: HabitCategory; targetCount?: number; targetUnit?: string; emoji: string }[] {
  const base = [
    { name: "Boire 2L d'eau", category: "hydration" as HabitCategory, targetCount: 2, targetUnit: "L", emoji: "💧" },
    { name: "Dormir 8h", category: "sleep" as HabitCategory, targetCount: 8, targetUnit: "h", emoji: "😴" },
    { name: "10 min d'etirements", category: "stretching" as HabitCategory, targetCount: 10, targetUnit: "min", emoji: "🤸" },
  ];

  switch (bodyGoal) {
    case "muscle_gain":
      return [
        ...base,
        { name: "Manger 2g proteine/kg", category: "nutrition" as HabitCategory, emoji: "🥩" },
        { name: "Prendre creatine", category: "supplements" as HabitCategory, emoji: "💊" },
        { name: "3000+ cal/jour", category: "nutrition" as HabitCategory, targetCount: 3000, targetUnit: "cal", emoji: "🍽️" },
      ];
    case "weight_loss":
      return [
        ...base,
        { name: "Deficit calorique", category: "nutrition" as HabitCategory, emoji: "🥗" },
        { name: "30 min de cardio", category: "cardio" as HabitCategory, targetCount: 30, targetUnit: "min", emoji: "🏃" },
        { name: "Pas de sucre ajoute", category: "nutrition" as HabitCategory, emoji: "🚫" },
        { name: "10 000 pas", category: "cardio" as HabitCategory, targetCount: 10000, targetUnit: "pas", emoji: "👟" },
      ];
    case "sport_perf":
      return [
        ...base,
        { name: "Visualisation 5min", category: "meditation" as HabitCategory, targetCount: 5, targetUnit: "min", emoji: "🧠" },
        { name: "Foam rolling", category: "wellness" as HabitCategory, targetCount: 10, targetUnit: "min", emoji: "🧘" },
        { name: "Journal d'entrainement", category: "journaling" as HabitCategory, emoji: "📝" },
      ];
    case "maintenance":
      return [
        ...base,
        { name: "15 min meditation", category: "meditation" as HabitCategory, targetCount: 15, targetUnit: "min", emoji: "🧠" },
        { name: "Douche froide", category: "cold_exposure" as HabitCategory, targetCount: 3, targetUnit: "min", emoji: "🥶" },
      ];
    default:
      return base;
  }
}
