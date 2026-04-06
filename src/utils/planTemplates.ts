/**
 * Pre-built training plan templates for quick setup.
 */

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  bodyGoal: string;
  days: {
    dayOfWeek: number;
    timeOfDay: string;
    trainingType: string;
    label?: string;
    exercises: {
      exerciseName: string;
      plannedSets: number;
      plannedReps: number;
      plannedWeightKg?: string;
    }[];
  }[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "full_body_3",
    name: "Full Body 3 jours",
    description: "Programme complet pour debutants, 3 seances par semaine",
    emoji: "💪",
    bodyGoal: "muscle_gain",
    days: [
      {
        dayOfWeek: 1, // Lundi
        timeOfDay: "08:00",
        trainingType: "full_body",
        label: "Full Body A",
        exercises: [
          { exerciseName: "Squat", plannedSets: 4, plannedReps: 8 },
          { exerciseName: "Developpé couché", plannedSets: 4, plannedReps: 8 },
          { exerciseName: "Rowing barre", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Développé militaire", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Curl biceps", plannedSets: 2, plannedReps: 12 },
        ],
      },
      {
        dayOfWeek: 3, // Mercredi
        timeOfDay: "08:00",
        trainingType: "full_body",
        label: "Full Body B",
        exercises: [
          { exerciseName: "Soulevé de terre", plannedSets: 4, plannedReps: 6 },
          { exerciseName: "Développé incliné haltères", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Tractions", plannedSets: 3, plannedReps: 8 },
          { exerciseName: "Fentes", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Extensions triceps", plannedSets: 2, plannedReps: 12 },
        ],
      },
      {
        dayOfWeek: 5, // Vendredi
        timeOfDay: "08:00",
        trainingType: "full_body",
        label: "Full Body C",
        exercises: [
          { exerciseName: "Presse à cuisses", plannedSets: 4, plannedReps: 10 },
          { exerciseName: "Dips", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Tirage vertical", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Élévations latérales", plannedSets: 3, plannedReps: 15 },
          { exerciseName: "Crunch", plannedSets: 3, plannedReps: 15 },
        ],
      },
    ],
  },
  {
    id: "upper_lower_4",
    name: "Upper / Lower 4 jours",
    description: "Split haut/bas du corps, ideal pour intermediaires",
    emoji: "🔥",
    bodyGoal: "muscle_gain",
    days: [
      {
        dayOfWeek: 1,
        timeOfDay: "08:00",
        trainingType: "upper_body",
        label: "Upper A - Force",
        exercises: [
          { exerciseName: "Développé couché", plannedSets: 4, plannedReps: 6 },
          { exerciseName: "Rowing barre", plannedSets: 4, plannedReps: 6 },
          { exerciseName: "Développé militaire", plannedSets: 3, plannedReps: 8 },
          { exerciseName: "Curl biceps barre", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Extensions triceps poulie", plannedSets: 3, plannedReps: 10 },
        ],
      },
      {
        dayOfWeek: 2,
        timeOfDay: "08:00",
        trainingType: "lower_body",
        label: "Lower A - Force",
        exercises: [
          { exerciseName: "Squat", plannedSets: 4, plannedReps: 6 },
          { exerciseName: "Soulevé de terre roumain", plannedSets: 3, plannedReps: 8 },
          { exerciseName: "Presse à cuisses", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Leg curl", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Mollets debout", plannedSets: 4, plannedReps: 15 },
        ],
      },
      {
        dayOfWeek: 4,
        timeOfDay: "08:00",
        trainingType: "upper_body",
        label: "Upper B - Volume",
        exercises: [
          { exerciseName: "Développé incliné haltères", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Tractions", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Élévations latérales", plannedSets: 4, plannedReps: 15 },
          { exerciseName: "Curl marteau", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Dips", plannedSets: 3, plannedReps: 12 },
        ],
      },
      {
        dayOfWeek: 5,
        timeOfDay: "08:00",
        trainingType: "lower_body",
        label: "Lower B - Volume",
        exercises: [
          { exerciseName: "Fentes bulgares", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Hip thrust", plannedSets: 4, plannedReps: 10 },
          { exerciseName: "Leg extension", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Leg curl", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Crunch", plannedSets: 3, plannedReps: 20 },
        ],
      },
    ],
  },
  {
    id: "ppl_6",
    name: "Push Pull Legs 6 jours",
    description: "Programme avance, chaque groupe musculaire 2 fois par semaine",
    emoji: "🏋️",
    bodyGoal: "muscle_gain",
    days: [
      {
        dayOfWeek: 1,
        timeOfDay: "08:00",
        trainingType: "push",
        label: "Push A",
        exercises: [
          { exerciseName: "Développé couché", plannedSets: 4, plannedReps: 6 },
          { exerciseName: "Développé militaire", plannedSets: 3, plannedReps: 8 },
          { exerciseName: "Développé incliné haltères", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Élévations latérales", plannedSets: 3, plannedReps: 15 },
          { exerciseName: "Extensions triceps", plannedSets: 3, plannedReps: 12 },
        ],
      },
      {
        dayOfWeek: 2,
        timeOfDay: "08:00",
        trainingType: "pull",
        label: "Pull A",
        exercises: [
          { exerciseName: "Soulevé de terre", plannedSets: 4, plannedReps: 5 },
          { exerciseName: "Tractions", plannedSets: 4, plannedReps: 8 },
          { exerciseName: "Rowing barre", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Curl biceps barre", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Tirage face", plannedSets: 3, plannedReps: 15 },
        ],
      },
      {
        dayOfWeek: 3,
        timeOfDay: "08:00",
        trainingType: "lower_body",
        label: "Legs A",
        exercises: [
          { exerciseName: "Squat", plannedSets: 4, plannedReps: 6 },
          { exerciseName: "Presse à cuisses", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Leg curl", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Fentes", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Mollets debout", plannedSets: 4, plannedReps: 15 },
        ],
      },
      {
        dayOfWeek: 4,
        timeOfDay: "08:00",
        trainingType: "push",
        label: "Push B",
        exercises: [
          { exerciseName: "Développé incliné barre", plannedSets: 4, plannedReps: 8 },
          { exerciseName: "Dips", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Élévations latérales", plannedSets: 4, plannedReps: 15 },
          { exerciseName: "Écarté poulie", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Extensions triceps poulie", plannedSets: 3, plannedReps: 12 },
        ],
      },
      {
        dayOfWeek: 5,
        timeOfDay: "08:00",
        trainingType: "pull",
        label: "Pull B",
        exercises: [
          { exerciseName: "Tirage vertical", plannedSets: 4, plannedReps: 10 },
          { exerciseName: "Rowing haltère", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Curl marteau", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Curl incliné", plannedSets: 2, plannedReps: 12 },
          { exerciseName: "Shrugs", plannedSets: 3, plannedReps: 12 },
        ],
      },
      {
        dayOfWeek: 6,
        timeOfDay: "08:00",
        trainingType: "lower_body",
        label: "Legs B",
        exercises: [
          { exerciseName: "Soulevé de terre roumain", plannedSets: 4, plannedReps: 8 },
          { exerciseName: "Fentes bulgares", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Leg extension", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Hip thrust", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Crunch", plannedSets: 3, plannedReps: 20 },
        ],
      },
    ],
  },
  {
    id: "weight_loss_4",
    name: "Perte de poids 4 jours",
    description: "Mix musculation et cardio pour maximiser la depense calorique",
    emoji: "🔻",
    bodyGoal: "weight_loss",
    days: [
      {
        dayOfWeek: 1,
        timeOfDay: "07:00",
        trainingType: "full_body",
        label: "Muscu Full Body",
        exercises: [
          { exerciseName: "Squat", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Développé couché", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Rowing barre", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Fentes", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Planche", plannedSets: 3, plannedReps: 30 },
        ],
      },
      {
        dayOfWeek: 2,
        timeOfDay: "07:00",
        trainingType: "cardio",
        label: "HIIT Cardio",
        exercises: [
          { exerciseName: "Burpees", plannedSets: 4, plannedReps: 15 },
          { exerciseName: "Mountain climbers", plannedSets: 4, plannedReps: 20 },
          { exerciseName: "Jumping jacks", plannedSets: 4, plannedReps: 30 },
          { exerciseName: "Sprint", plannedSets: 6, plannedReps: 1 },
        ],
      },
      {
        dayOfWeek: 4,
        timeOfDay: "07:00",
        trainingType: "full_body",
        label: "Muscu Circuit",
        exercises: [
          { exerciseName: "Soulevé de terre", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Dips", plannedSets: 3, plannedReps: 12 },
          { exerciseName: "Tractions", plannedSets: 3, plannedReps: 10 },
          { exerciseName: "Presse à cuisses", plannedSets: 3, plannedReps: 15 },
          { exerciseName: "Crunch", plannedSets: 3, plannedReps: 20 },
        ],
      },
      {
        dayOfWeek: 5,
        timeOfDay: "07:00",
        trainingType: "cardio",
        label: "Cardio Steady State",
        exercises: [
          { exerciseName: "Course à pied", plannedSets: 1, plannedReps: 30 },
          { exerciseName: "Vélo", plannedSets: 1, plannedReps: 20 },
          { exerciseName: "Rameur", plannedSets: 1, plannedReps: 15 },
        ],
      },
    ],
  },
];
