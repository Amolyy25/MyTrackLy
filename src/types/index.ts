// Types pour l'application MyTrackLy

export interface User {
  id: string;
  email: string;
  name: string;
  role: "personnel" | "eleve" | "coach";
  goalType:
    | "weight_loss"
    | "weight_gain"
    | "maintenance"
    | "muscle_gain"
    | null;
  coachId?: string;
  coach?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: "strength" | "cardio" | "flexibility" | "other";
  muscleGroups: string[];
  defaultUnit: "reps" | "time" | "distance" | "weight";
  isCustom: boolean;
  createdByUserId?: string;
  createdAt: string;
}

export interface SessionExercise {
  id?: string;
  exerciseId: string;
  exercise?: Exercise;
  sets: number;
  repsPerSet?: number[]; // [7, 7, 5, 5, 4]
  repsUniform?: number; // 8 (toutes les séries ont 8 reps)
  weightKg?: number;
  durationSeconds?: number;
  restSeconds?: number;
  orderIndex: number;
  notes?: string;
}

export interface TrainingSession {
  id: string;
  userId: string;
  date: string;
  durationMinutes?: number;
  notes?: string;
  coachComment?: string; // Commentaire du coach sur la séance
  exercises: SessionExercise[];
  user?: {
    id: string;
    name: string;
    email: string;
  }; // Informations de l'élève (pour les vues coach)
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  userId: string;
  date: string;
  bodyWeightKg?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  neckCm?: number;
  shouldersCm?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSessions: number;
  totalExercises: number;
  totalVolume: number; // kg
  currentStreak: number;
  weeklyFrequency: number;
  lastSession?: TrainingSession;
  latestWeight?: number;
  weightChange?: number; // vs mois dernier
  goalMessage?: {
    message: string;
    color: "green" | "orange" | "red";
  };
}

// Form types
export interface NewTrainingSessionForm {
  date: string;
  durationMinutes: number;
  notes: string;
  exercises: {
    exerciseId: string;
    sets: number;
    repsType: "uniform" | "variable";
    repsUniform: number;
    repsPerSet: number[];
    weightKg: number;
    restSeconds: number;
    notes: string;
  }[];
}

// Statistics types
export type DateRange = "7d" | "30d" | "90d" | "1y" | "all";

export interface StatsPreferences {
  userId: string;
  visibleCards: string[];
  cardOrder: string[];
  defaultDateRange: DateRange;
  favoriteStats: string[];
}

export interface SessionsStats {
  totalSessions: number;
  totalVolume: number;
  totalExercises: number;
  totalDuration: number;
  avgSessionsPerWeek: number;
  avgDuration: number;
  sessionsByWeek: Array<{ week: string; count: number }>;
  volumeByDate: Array<{ date: string; volume: number }>;
  topExercises: Array<{ name: string; count: number }>;
  muscleGroupsDistribution: Array<{ group: string; count: number }>;
  personalRecords: Array<{
    exerciseName: string;
    exerciseId: string;
    maxWeight: number;
    maxReps: number;
    date: string;
  }>;
  dateRange: { from: string; to: string };
}

export interface MeasurementsStats {
  totalMeasurements: number;
  weightEvolution: Array<{ date: string; weight: number }>;
  bodyMeasurements: {
    waist: Array<{ date: string; value: number }>;
    chest: Array<{ date: string; value: number }>;
    arms: Array<{ date: string; value: number }>;
    thighs: Array<{ date: string; value: number }>;
  };
  latest: {
    date: string;
    bodyWeightKg: number | null;
    waistCm: number | null;
    chestCm: number | null;
    leftArmCm: number | null;
    rightArmCm: number | null;
    leftThighCm: number | null;
    rightThighCm: number | null;
  } | null;
  weightChange: number | null;
  dateRange: { from: string; to: string };
}

export interface OverviewStats {
  totalSessions: number;
  totalVolume: number;
  currentStreak: number;
  latestWeight: number | null;
  coachStats: {
    sessionsWithComments: number;
    totalSessions: number;
  } | null;
  dateRange: { from: string; to: string };
}

export interface StudentStats {
  student: {
    id: string;
    name: string;
    email: string;
  };
  totalSessions: number;
  totalVolume: number;
  sessionsWithComments: number;
  weightEvolution: Array<{ date: string; weight: number }>;
  dateRange: { from: string; to: string };
}

export interface CoachOverviewStats {
  totalStudents: number;
  totalSessions: number;
  avgSessionsPerStudent: number;
  studentStats: Array<{
    studentId: string;
    studentName: string;
    totalSessions: number;
    totalVolume: number;
    lastActivity: string | null;
    daysSinceLastActivity: number | null;
  }>;
  mostActiveStudents: Array<{
    studentId: string;
    studentName: string;
    totalSessions: number;
    totalVolume: number;
    lastActivity: string | null;
    daysSinceLastActivity: number | null;
  }>;
  leastActiveStudents: Array<{
    studentId: string;
    studentName: string;
    totalSessions: number;
    totalVolume: number;
    lastActivity: string | null;
    daysSinceLastActivity: number | null;
  }>;
  studentsNeedingAttention: Array<{
    studentId: string;
    studentName: string;
    totalSessions: number;
    totalVolume: number;
    lastActivity: string | null;
    daysSinceLastActivity: number | null;
  }>;
  dateRange: { from: string; to: string };
}
