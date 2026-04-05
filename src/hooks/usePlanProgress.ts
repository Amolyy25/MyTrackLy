import { useState, useEffect, useCallback } from "react";
import { PlanProgress } from "../types";
import API_URL from "../config/api";

export function usePlanProgress(planId: string | null) {
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!planId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/training-plans/${planId}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la progression");
      }

      const data = await response.json();
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, isLoading, error };
}
