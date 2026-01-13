import { useState, useEffect } from "react";
import {
  SessionsStats,
  MeasurementsStats,
  OverviewStats,
  StudentStats,
  CoachOverviewStats,
  DateRange,
} from "../types";
import API_URL from "../config/api";

/**
 * Hook to fetch sessions statistics
 */
export function useSessionsStats(range: DateRange = "30d") {
  const [stats, setStats] = useState<SessionsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await fetch(
          `${API_URL}/stats/sessions?range=${range}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  return { stats, isLoading, error };
}

/**
 * Hook to fetch measurements statistics
 */
export function useMeasurementsStats(range: DateRange = "30d") {
  const [stats, setStats] = useState<MeasurementsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await fetch(
          `${API_URL}/stats/measurements?range=${range}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  return { stats, isLoading, error };
}

/**
 * Hook to fetch overview statistics
 */
export function useOverviewStats(range: DateRange = "30d") {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await fetch(
          `${API_URL}/stats/overview?range=${range}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  return { stats, isLoading, error };
}

/**
 * Hook to fetch student statistics (coach only)
 */
export function useStudentStats(
  studentId: string | null,
  range: DateRange = "30d"
) {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await fetch(
          `${API_URL}/stats/coach/students/${studentId}?range=${range}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [studentId, range]);

  return { stats, isLoading, error };
}

/**
 * Hook to fetch coach overview statistics
 */
export function useCoachOverviewStats(range: DateRange = "30d") {
  const [stats, setStats] = useState<CoachOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await fetch(
          `${API_URL}/stats/coach/overview?range=${range}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  return { stats, isLoading, error };
}
