import { useState, useEffect } from "react";
import { StatsPreferences, DateRange } from "../types";
import API_URL from "../config/api";
import { useAuth } from "../contexts/AuthContext";

const STORAGE_KEY = "stats_preferences";

/**
 * Hook to manage statistics preferences
 */
export function useStatsPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<StatsPreferences | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Try to load from localStorage first
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences(parsed);
        } else {
          // Try to load from API
          const token = localStorage.getItem("token");
          if (token) {
            try {
              const response = await fetch(`${API_URL}/stats/preferences`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                const data = await response.json();
                setPreferences(data);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
              }
            } catch (apiError) {
              // API might not be implemented yet, use defaults
              console.log("Stats preferences API not available, using defaults");
            }
          }
          
          // Create default preferences if none loaded
          if (!preferences) {
            const defaultPrefs: StatsPreferences = {
              userId: user?.id || "",
              visibleCards: [
                "overview",
                "sessions",
                "volume",
                "measurements",
                "exercises",
                "muscleGroups",
              ],
              cardOrder: [
                "overview",
                "sessions",
                "volume",
                "measurements",
                "exercises",
                "muscleGroups",
              ],
              defaultDateRange: "30d",
              favoriteStats: [],
            };
            setPreferences(defaultPrefs);
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        // Create default preferences
        const defaultPrefs: StatsPreferences = {
          userId: user?.id || "",
          visibleCards: [
            "overview",
            "sessions",
            "volume",
            "measurements",
            "exercises",
            "muscleGroups",
          ],
          cardOrder: [
            "overview",
            "sessions",
            "volume",
            "measurements",
            "exercises",
            "muscleGroups",
          ],
          defaultDateRange: "30d",
          favoriteStats: [],
        };
        setPreferences(defaultPrefs);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  const savePreferences = async (newPreferences: StatsPreferences) => {
    try {
      // Ensure userId is set
      const prefsWithUserId = {
        ...newPreferences,
        userId: user?.id || newPreferences.userId,
      };
      
      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsWithUserId));
      setPreferences(prefsWithUserId);

      // Try to save to API (might not be implemented yet)
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await fetch(`${API_URL}/stats/preferences`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(prefsWithUserId),
          });
        } catch (apiError) {
          // API might not be implemented yet, that's okay
          console.log("Stats preferences API not available, saved to localStorage only");
        }
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      // Still update local state even if API fails
    }
  };

  const updateVisibleCards = (visibleCards: string[]) => {
    if (preferences) {
      savePreferences({ ...preferences, visibleCards });
    }
  };

  const updateCardOrder = (cardOrder: string[]) => {
    if (preferences) {
      savePreferences({ ...preferences, cardOrder });
    }
  };

  const updateDefaultDateRange = (defaultDateRange: DateRange) => {
    if (preferences) {
      savePreferences({ ...preferences, defaultDateRange });
    }
  };

  const toggleFavorite = (statId: string) => {
    if (preferences) {
      const favoriteStats = preferences.favoriteStats.includes(statId)
        ? preferences.favoriteStats.filter((id) => id !== statId)
        : [...preferences.favoriteStats, statId];
      savePreferences({ ...preferences, favoriteStats });
    }
  };

  return {
    preferences,
    isLoading,
    savePreferences,
    updateVisibleCards,
    updateCardOrder,
    updateDefaultDateRange,
    toggleFavorite,
  };
}
