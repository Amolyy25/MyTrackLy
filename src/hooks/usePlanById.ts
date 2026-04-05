import { useState, useEffect, useCallback } from "react";
import { TrainingPlan } from "../types";
import API_URL from "../config/api";

export function usePlanById(planId: string | null) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/training-plans/${planId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du plan");
      }

      const data = await response.json();
      setPlan(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { plan, isLoading, error, refetch: fetchPlan };
}
