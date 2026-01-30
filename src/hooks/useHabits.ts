import { useState, useEffect } from "react";
import { Habit } from "../types";
import API_URL from "../config/api";

// Hook pour récupérer les habitudes
export function useHabits(studentId?: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const params = new URLSearchParams();
        if (studentId) params.append("studentId", studentId);

        const response = await fetch(
          `${API_URL}/habits?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des habitudes");
        }

        const data = await response.json();
        setHabits(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, [studentId]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const params = new URLSearchParams();
      if (studentId) params.append("studentId", studentId);

      const response = await fetch(
        `${API_URL}/habits?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des habitudes");
      }

      const data = await response.json();
      setHabits(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { habits, isLoading, error, refetch };
}

// Hook pour créer une habitude
export function useCreateHabit() {
  const [isLoading, setIsLoading] = useState(false);

  const createHabit = async (habitData: {
    name: string;
    category: string;
    targetFrequency: string;
    targetCount?: number;
    reminderTime?: string;
    reminderEnabled?: boolean;
    startDate?: string;
  }) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création de l'habitude");
      }

      const data = await response.json();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { createHabit, isLoading };
}

// Hook pour modifier une habitude
export function useUpdateHabit() {
  const [isLoading, setIsLoading] = useState(false);

  const updateHabit = async (
    id: string,
    habitData: {
      name?: string;
      category?: string;
      targetFrequency?: string;
      targetCount?: number;
      reminderTime?: string;
      reminderEnabled?: boolean;
      startDate?: string;
    }
  ) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/habits/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la modification de l'habitude");
      }

      const data = await response.json();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateHabit, isLoading };
}

// Hook pour supprimer une habitude
export function useDeleteHabit() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteHabit = async (id: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/habits/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression de l'habitude");
      }

      return await response.json();
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteHabit, isLoading };
}

// Hook pour marquer une habitude comme complétée
export function useCheckHabit() {
  const [isLoading, setIsLoading] = useState(false);

  const checkHabit = async (id: string, value?: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/habits/${id}/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la complétion de l'habitude");
      }

      const data = await response.json();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkHabit, isLoading };
}

// Hook pour démarquer une habitude
export function useUncheckHabit() {
  const [isLoading, setIsLoading] = useState(false);

  const uncheckHabit = async (id: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/habits/${id}/uncheck`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la décomplétion de l'habitude");
      }

      const data = await response.json();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { uncheckHabit, isLoading };
}
