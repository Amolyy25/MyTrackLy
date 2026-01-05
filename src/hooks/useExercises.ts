import { useState, useEffect } from "react";
import { Exercise } from "../types";
import API_URL from "../config/api";

// Hook pour récupérer les exercices
export function useExercises(filters?: { category?: string; search?: string }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const params = new URLSearchParams();
        if (filters?.category) params.append("category", filters.category);
        if (filters?.search) params.append("search", filters.search);

        const response = await fetch(
          `${API_URL}/exercises?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des exercices");
        }

        const data = await response.json();
        setExercises(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [filters?.category, filters?.search]);

  return { exercises, isLoading, error };
}

// Hook pour créer un exercice custom
export function useCreateExercise() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExercise = async (exerciseData: {
    name: string;
    category: string;
    muscleGroups?: string[];
    defaultUnit: string;
  }) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(exerciseData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'exercice");
      }

      const data = await response.json();
      setError(null);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createExercise, isLoading, error };
}

// Hook pour récupérer uniquement les exercices custom de l'utilisateur
export function useMyExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyExercises = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await fetch(`${API_URL}/exercises/my-library`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de vos exercices");
        }

        const data = await response.json();
        setExercises(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyExercises();
  }, []);

  return { exercises, isLoading, error };
}

