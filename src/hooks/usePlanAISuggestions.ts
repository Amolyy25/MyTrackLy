import { useState, useCallback } from "react";
import { AISuggestion } from "../types";
import API_URL from "../config/api";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

function getLastRefreshKey(planId: string) {
  return `plan_ai_refresh_${planId}`;
}

function getLastRefreshTimestamp(planId: string): number | null {
  const val = localStorage.getItem(getLastRefreshKey(planId));
  return val ? parseInt(val, 10) : null;
}

function formatCooldownText(lastRefresh: number): string {
  const elapsed = Date.now() - lastRefresh;
  const remaining = COOLDOWN_MS - elapsed;
  if (remaining <= 0) return "";
  const minutes = Math.ceil(remaining / 60000);
  return `Disponible dans ${minutes} min`;
}

export function usePlanAISuggestions(planId: string | null) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCanRefresh = useCallback(() => {
    if (!planId) return false;
    const last = getLastRefreshTimestamp(planId);
    if (!last) return true;
    return Date.now() - last >= COOLDOWN_MS;
  }, [planId]);

  const getCooldownText = useCallback(() => {
    if (!planId) return "";
    const last = getLastRefreshTimestamp(planId);
    if (!last) return "";
    return formatCooldownText(last);
  }, [planId]);

  const refresh = useCallback(async () => {
    if (!planId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(
        `${API_URL}/training-plans/${planId}/ai-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des suggestions IA");
      }

      const data = await response.json();
      setSuggestions(data.suggestions ?? data);
      localStorage.setItem(getLastRefreshKey(planId), String(Date.now()));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  const canRefresh = getCanRefresh();
  const cooldownText = getCooldownText();

  return { suggestions, isLoading, error, refresh, canRefresh, cooldownText };
}
