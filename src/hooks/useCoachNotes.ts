import { useState, useEffect, useCallback } from "react";
import API_URL from "../config/api";
import type { CoachNote } from "../types";

// Hook pour récupérer et gérer les notes du coach
export function useCoachNotes(studentId: string | undefined) {
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!studentId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(
        `${API_URL}/coach-notes/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des notes");
      }

      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (content: string): Promise<CoachNote | null> => {
    if (!studentId) return null;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(
        `${API_URL}/coach-notes/student/${studentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la note");
      }

      const note = await response.json();
      setNotes((prev) => [note, ...prev]);
      return note;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
      return null;
    }
  };

  const updateNote = async (
    noteId: string,
    content: string
  ): Promise<CoachNote | null> => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/coach-notes/${noteId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la note");
      }

      const updatedNote = await response.json();
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? updatedNote : n))
      );
      return updatedNote;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
      return null;
    }
  };

  const deleteNote = async (noteId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/coach-notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la note");
      }

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
      return false;
    }
  };

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
}
