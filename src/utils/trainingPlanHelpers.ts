export const TRAINING_TYPES = [
  { value: "full_body", label: "Full Body", emoji: "💪" },
  { value: "upper_body", label: "Haut du corps", emoji: "🦾" },
  { value: "lower_body", label: "Bas du corps", emoji: "🦵" },
  { value: "push", label: "Push", emoji: "⬆️" },
  { value: "pull", label: "Pull", emoji: "⬇️" },
  { value: "cardio", label: "Cardio", emoji: "🏃" },
  { value: "core", label: "Core / Abdos", emoji: "🔥" },
  { value: "custom", label: "Personnalisé", emoji: "✏️" },
];

export const BODY_GOALS = [
  { value: "muscle_gain", label: "Prise de muscle", emoji: "💪" },
  { value: "weight_loss", label: "Perte de poids", emoji: "⚖️" },
  { value: "sport_perf", label: "Performance sportive", emoji: "🏆" },
  { value: "maintenance", label: "Maintien", emoji: "🔄" },
  { value: "custom", label: "Personnalisé", emoji: "✏️" },
];

export const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
export const DAYS_FULL_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export function getMoodEmoji(score: number): string {
  return (["", "😩", "😕", "😐", "😊", "🔥"] as const)[score] ?? "😐";
}

export function getTrainingTypeLabel(
  type: string,
  customType?: string | null
): string {
  if (type === "custom") return customType || "Personnalisé";
  return TRAINING_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getTrainingTypeEmoji(type: string): string {
  return TRAINING_TYPES.find((t) => t.value === type)?.emoji ?? "🏋️";
}

export function getBodyGoalLabel(goal: string, customGoal?: string | null): string {
  if (goal === "custom") return customGoal || "Personnalisé";
  return BODY_GOALS.find((g) => g.value === goal)?.label ?? goal;
}

export function getBodyGoalEmoji(goal: string): string {
  return BODY_GOALS.find((g) => g.value === goal)?.emoji ?? "🎯";
}
