import { useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "live-workout-session";

export interface WorkoutSessionData {
  planId: string;
  planDayId: string;
  planDayLabel: string;
  trainingType: string;
  date: string;
  startedAt: number; // timestamp
  currentExerciseIndex: number;
  exercises: WorkoutExerciseData[];
}

export interface WorkoutExerciseData {
  exerciseId: string;
  exerciseName: string;
  plannedSets: number;
  plannedReps: number;
  plannedWeightKg: number;
  restSeconds: number;
  notes: string;
  sets: WorkoutSetData[];
}

export interface WorkoutSetData {
  reps: number;
  weightKg: number;
  completed: boolean;
  completedAt?: number;
}

export function getSavedWorkout(): WorkoutSessionData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as WorkoutSessionData;
    // Expire after 12 hours
    if (Date.now() - data.startedAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearSavedWorkout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useWorkoutAutoSave(data: WorkoutSessionData | null) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(() => {
    if (!data) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or unavailable — silent fail
    }
  }, [data]);

  // Debounced save on every data change
  useEffect(() => {
    if (!data) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, 500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, save]);

  // Save immediately on page hide (phone sleep, tab switch)
  useEffect(() => {
    if (!data) return;
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };
    const handleBeforeUnload = () => save();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [data, save]);

  return { saveNow: save };
}
