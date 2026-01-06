import { useState, useEffect } from "react";
import { Measurement } from "../types";
import API_URL from "../config/api";

// Hook pour récupérer les mensurations
export function useMeasurements(filters?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeasurements = async () => {
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
          `${API_URL}/measurements?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des mensurations");
        }

        const data = await response.json();
        setMeasurements(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurements();
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
        `${API_URL}/measurements?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des mensurations");
      }

      const data = await response.json();
      setMeasurements(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { measurements, isLoading, error, refetch };
}

// Hook pour créer une mensuration
export function useCreateMeasurement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMeasurement = async (measurementData: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/measurements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(measurementData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la création de la mensuration"
        );
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

  return { createMeasurement, isLoading, error };
}

// Hook pour modifier une mensuration
export function useUpdateMeasurement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMeasurement = async (id: string, measurementData: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/measurements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(measurementData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la modification de la mensuration"
        );
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

  return { updateMeasurement, isLoading, error };
}

// Hook pour supprimer une mensuration
export function useDeleteMeasurement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMeasurement = async (id: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/measurements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la mensuration");
      }

      setError(null);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteMeasurement, isLoading, error };
}

// Hook pour récupérer les mensurations d'un élève (coach uniquement)
export function useStudentMeasurements(
  studentId: string,
  filters?: {
    dateFrom?: string;
    dateTo?: string;
  }
) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    const fetchMeasurements = async () => {
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
          `${API_URL}/measurements/student/${studentId}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des mensurations");
        }

        const data = await response.json();
        setMeasurements(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasurements();
  }, [studentId, filters?.dateFrom, filters?.dateTo]);

  const refetch = async () => {
    if (!studentId) return;

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
        `${API_URL}/measurements/student/${studentId}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des mensurations");
      }

      const data = await response.json();
      setMeasurements(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { measurements, isLoading, error, refetch };
}

