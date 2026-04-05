import { useState, useEffect, useCallback } from "react";
import { TrainingPlan } from "../types";
import API_URL from "../config/api";

export function useTrainingPlans() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/training-plans?limit=20&offset=0`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des plans");
      }

      const data = await response.json();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPlan = async (data: Record<string, unknown>) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié");

    const response = await fetch(`${API_URL}/training-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la création du plan");
    }

    const created = await response.json();
    await fetchPlans();
    return created;
  };

  const updatePlan = async (id: string, data: Record<string, unknown>) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié");

    const response = await fetch(`${API_URL}/training-plans/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la mise à jour du plan");
    }

    const updated = await response.json();
    await fetchPlans();
    return updated;
  };

  const deletePlan = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié");

    const response = await fetch(`${API_URL}/training-plans/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la suppression du plan");
    }

    await fetchPlans();
    return true;
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, isLoading, error, fetchPlans, createPlan, updatePlan, deletePlan };
}
