import { TrainingSession } from "../types";

/**
 * Calcule le volume total d'une séance d'entraînement
 * Volume = somme de (poids × répétitions) pour tous les exercices
 */
export const calculateTotalVolume = (session: TrainingSession): number => {
  return session.exercises.reduce((total, ex) => {
    const reps = ex.repsUniform
      ? ex.sets * ex.repsUniform
      : ex.repsPerSet
      ? (ex.repsPerSet as number[]).reduce((sum, r) => sum + r, 0)
      : 0;
    return total + reps * (ex.weightKg || 0);
  }, 0);
};

/**
 * Calcule le nombre total de répétitions d'une séance d'entraînement
 */
export const calculateTotalReps = (session: TrainingSession): number => {
  return session.exercises.reduce((total, ex) => {
    return (
      total +
      (ex.repsUniform
        ? ex.sets * ex.repsUniform
        : ex.repsPerSet
        ? (ex.repsPerSet as number[]).reduce((sum, r) => sum + r, 0)
        : 0)
    );
  }, 0);
};

