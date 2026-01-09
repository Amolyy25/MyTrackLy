import { useState, useEffect, useCallback } from "react";
import API_URL from "../config/api";

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive?: boolean;
}

export function useCoachAvailabilities() {
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [slotDuration, setSlotDuration] = useState<number>(60);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailabilities = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      const response = await fetch(`${API_URL}/availability/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des disponibilités");
      }

      const data = await response.json();
      // Le backend retourne { availabilities: [], slotDuration: 60 }
      // Ou l'ancien format [] (tableau direct) si pas mis à jour, donc on gère les deux
      if (Array.isArray(data)) {
        setAvailabilities(data);
        setSlotDuration(60);
      } else {
        setAvailabilities(data.availabilities || []);
        setSlotDuration(data.slotDuration || 60);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAvailabilities = async (
    newAvailabilities: AvailabilitySlot[],
    newSlotDuration: number
  ) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      const response = await fetch(`${API_URL}/availability/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          availabilities: newAvailabilities,
          slotDuration: newSlotDuration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la sauvegarde des disponibilités"
        );
      }

      await fetchAvailabilities(); // Recharger après sauvegarde
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  return {
    availabilities,
    slotDuration,
    isLoading,
    error,
    saveAvailabilities,
    refetch: fetchAvailabilities,
  };
}

export interface TimeSlot {
  start: string;
  end: string;
}

export function useCoachSlots(coachId: string | undefined, date: string) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!coachId || !date) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Non authentifié");

        const response = await fetch(
          `${API_URL}/availability/slots?coachId=${coachId}&date=${date}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des créneaux");
        }

        const data = await response.json();
        setSlots(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [coachId, date]);

  return { slots, isLoading, error };
}

