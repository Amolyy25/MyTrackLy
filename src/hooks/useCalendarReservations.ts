import { useState, useEffect } from "react";
import API_URL from "../config/api";

export interface CalendarReservation {
  id: string;
  coachId: string;
  studentId: string;
  startDateTime: string;
  endDateTime: string;
  sessionType: string;
  notes?: string | null;
  status: "pending" | "confirmed" | "cancelled" | "refused";
  googleEventId?: string | null;
  createdAt: string;
  updatedAt: string;
  coach?: {
    id: string;
    name: string;
    email: string;
  };
  student?: {
    id: string;
    name: string;
    email: string;
  };
}

export function useGoogleCalendarAuthUrl(redirectPath?: string) {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthUrl = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const params = new URLSearchParams();
      if (redirectPath) params.append("redirect", redirectPath);

      const response = await fetch(
        `${API_URL}/calendar/google/auth-url?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Erreur lors de la récupération de l'URL Google Calendar"
        );
      }

      const data = await response.json();
      setAuthUrl(data.url);
      setError(null);
      return data.url as string;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { authUrl, isLoading, error, fetchAuthUrl };
}

export function useMyReservations(filters?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const params = new URLSearchParams();
        if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
        if (filters?.dateTo) params.append("dateTo", filters.dateTo);

        const response = await fetch(
          `${API_URL}/calendar/reservations?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des réservations de calendrier"
          );
        }

        const data = await response.json();
        setReservations(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [filters?.dateFrom, filters?.dateTo]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);

      const response = await fetch(
        `${API_URL}/calendar/reservations?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération des réservations de calendrier"
        );
      }

      const data = await response.json();
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { reservations, isLoading, error, refetch };
}

export function useCreateReservation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReservation = async (payload: {
    coachId: string;
    startDateTime: string;
    endDateTime: string;
    sessionType: string;
    notes?: string;
  }) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/calendar/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Erreur lors de la création de la réservation de calendrier"
        );
      }

      const data = await response.json();
      setError(null);
      return data as CalendarReservation;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createReservation, isLoading, error };
}

export function useUpdateReservationStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    reservationId: string,
    payload: {
      action: "accept" | "reschedule" | "refuse";
      startDateTime?: string;
      endDateTime?: string;
    }
  ) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(
        `${API_URL}/calendar/reservations/${reservationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Erreur lors de la mise à jour du statut de la réservation"
        );
      }

      const data = await response.json();
      setError(null);
      return data as CalendarReservation;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading, error };
}

export function useSendReservationReminder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendReminder = async (reservationId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(
        `${API_URL}/calendar/reservations/${reservationId}/reminder`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Erreur lors de l'envoi du rappel de réservation"
        );
      }

      const data = await response.json();
      setError(null);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendReminder, isLoading, error };
}

export function useCancelReservation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelReservation = async (reservationId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(
        `${API_URL}/calendar/reservations/${reservationId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de l'annulation de la réservation"
        );
      }

      const data = await response.json();
      setError(null);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { cancelReservation, isLoading, error };
}



