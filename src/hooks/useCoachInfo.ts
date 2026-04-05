import { useState, useEffect } from "react";
import API_URL from "../config/api";

export interface CoachInfo {
  id: string;
  name: string;
  email: string;
  hourlyRate: number | null;
  slotDuration: number;
}

export function useCoachInfo(coachId: string | undefined) {
  const [coach, setCoach] = useState<CoachInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoachInfo = async () => {
      if (!coachId) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Non authentifié");

        // Utiliser l'endpoint existant pour récupérer les infos d'un utilisateur par son ID
        // Ou créer un endpoint dédié. On va supposer qu'on peut récupérer les infos publiques du coach.
        // Pour l'instant, on va utiliser l'endpoint availability/config si l'élève a le droit,
        // mais le mieux est un endpoint dédié aux élèves pour voir leur coach.
        const response = await fetch(`${API_URL}/students/my-coach`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des infos du coach");
        }

        const data = await response.json();
        setCoach(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoachInfo();
  }, [coachId]);

  return { coach, isLoading, error };
}
