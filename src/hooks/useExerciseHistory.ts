import { useState, useEffect, useCallback } from "react";
import API_URL from "../config/api";

export interface ExerciseHistoryEntry {
  date: string;
  sets: number;
  reps: number;
  weightKg: number | null;
  volume: number; // sets * reps * weight
  moodScore?: number | null;
}

export interface ExerciseHistoryData {
  exerciseId: string;
  exerciseName: string;
  entries: ExerciseHistoryEntry[];
  personalBest: {
    maxWeight: number | null;
    maxVolume: number | null;
    maxReps: number | null;
  };
}

/**
 * Fetches exercise history from logged sessions.
 * Since the backend may not have a dedicated endpoint yet,
 * we derive history from plan sessions and exercise data.
 */
export function useExerciseHistory(planId: string | null) {
  const [history, setHistory] = useState<ExerciseHistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!planId) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      // Try dedicated endpoint first, fallback to building from plan data
      const res = await fetch(`${API_URL}/training-plans/${planId}/exercise-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : data.history ?? []);
      } else {
        // Fallback: build history from the plan's session logs + exercise config
        // This gives at least the planned progression
        const planRes = await fetch(`${API_URL}/training-plans/${planId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!planRes.ok) throw new Error("Impossible de charger le plan");
        const plan = await planRes.json();

        const exerciseMap = new Map<string, ExerciseHistoryData>();

        for (const day of plan.days ?? []) {
          for (const ex of day.exercises ?? []) {
            const exId = ex.exerciseId;
            const name = ex.exercise?.name ?? "Exercice";
            if (!exerciseMap.has(exId)) {
              exerciseMap.set(exId, {
                exerciseId: exId,
                exerciseName: name,
                entries: [],
                personalBest: { maxWeight: null, maxVolume: null, maxReps: null },
              });
            }

            const entry: ExerciseHistoryEntry = {
              date: new Date().toISOString(),
              sets: ex.plannedSets,
              reps: ex.plannedReps,
              weightKg: ex.plannedWeightKg ?? null,
              volume: ex.plannedSets * ex.plannedReps * (ex.plannedWeightKg ?? 0),
            };

            const data = exerciseMap.get(exId)!;
            data.entries.push(entry);

            // Update personal bests
            if (entry.weightKg && (!data.personalBest.maxWeight || entry.weightKg > data.personalBest.maxWeight)) {
              data.personalBest.maxWeight = entry.weightKg;
            }
            const vol = entry.volume;
            if (vol > 0 && (!data.personalBest.maxVolume || vol > data.personalBest.maxVolume)) {
              data.personalBest.maxVolume = vol;
            }
            if (!data.personalBest.maxReps || entry.reps > data.personalBest.maxReps) {
              data.personalBest.maxReps = entry.reps;
            }
          }
        }

        setHistory(Array.from(exerciseMap.values()));
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, error, refetch: fetchHistory };
}
