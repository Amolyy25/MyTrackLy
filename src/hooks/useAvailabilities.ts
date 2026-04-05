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
  const [bufferTime, setBufferTime] = useState<number>(0);
  const [autoConfirmReservations, setAutoConfirmReservations] = useState<boolean>(false);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
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
      
      if (Array.isArray(data)) {
        setAvailabilities(data);
        setSlotDuration(60);
        setAutoConfirmReservations(false);
        setHourlyRate(0);
      } else {
        setAvailabilities(data.availabilities || []);
        setSlotDuration(data.slotDuration || 60);
        setBufferTime(data.bufferTime || 0);
        setAutoConfirmReservations(data.autoConfirmReservations || false);
        setHourlyRate(data.hourlyRate || 0);
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
    newSlotDuration: number,
    newAutoConfirm?: boolean,
    newHourlyRate?: number,
    newBufferTime?: number
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
          bufferTime: newBufferTime ?? bufferTime,
          autoConfirmReservations: newAutoConfirm ?? autoConfirmReservations,
          hourlyRate: newHourlyRate ?? hourlyRate,
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
    bufferTime,
    autoConfirmReservations,
    hourlyRate,
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

export interface CoachServiceData {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  location: string | null;
  isActive: boolean;
}

export function useCoachServices() {
  const [services, setServices] = useState<CoachServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/availability/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur de récupération");
      const data = await res.json();
      setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveService = async (data: Partial<CoachServiceData>) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié");

    let url = `${API_URL}/availability/services`;
    let method = "POST";
    if (data.id && data.id !== "new") {
      url += `/${data.id}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Erreur lors de la sauvegarde");
    }
    await fetchServices();
  };

  const deleteService = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/availability/services/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression");
    await fetchServices();
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, isLoading, saveService, deleteService, refetch: fetchServices };
}

