import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrainingSessions } from "../../../hooks/useTrainingSessions";
import { useDeleteTrainingSession } from "../../../hooks/useTrainingSessions";
import { TrainingSession } from "../../../types";
import ErrorDisplay from "../../composants/ErrorDisplay";
import LoadingSpinner from "../../composants/LoadingSpinner";
import { calculateTotalVolume, calculateTotalReps } from "../../../utils/trainingCalculations";

const TrainingHistory: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { sessions, isLoading, error } = useTrainingSessions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { deleteSession, isLoading: isDeleting } = useDeleteTrainingSession();

  const handleDelete = async (sessionId: string) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette séance ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      await deleteSession(sessionId);
      // Les sessions seront automatiquement rechargées grâce au hook
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement de l'historique..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historique des séances
          </h1>
          <p className="mt-2 text-gray-600">
            Consultez toutes vos séances d'entraînement
          </p>
        </div>
        <Link
          to="/dashboard/training/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nouvelle séance
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune séance enregistrée
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre première séance d'entraînement
          </p>
          <Link
            to="/dashboard/training/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Créer une séance
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Session Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Séance du{" "}
                        {new Date(session.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>
                          {session.exercises.length} exercice
                          {session.exercises.length > 1 ? "s" : ""}
                        </span>
                        {session.durationMinutes && (
                          <span>• {session.durationMinutes} min</span>
                        )}
                        <span>
                          • {calculateTotalReps(session)} reps totales
                        </span>
                        <span>
                          • {calculateTotalVolume(session).toFixed(0)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedSession(
                          selectedSession === session.id ? null : session.id
                        )
                      }
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      {selectedSession === session.id
                        ? "Masquer"
                        : "Voir détails"}
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                {session.notes && (
                  <p className="mt-3 text-sm text-gray-600 italic">
                    "{session.notes}"
                  </p>
                )}
              </div>

              {/* Session Details (Expandable) */}
              {selectedSession === session.id && (
                <div className="p-6 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    Exercices
                  </h4>
                  <div className="space-y-4">
                    {session.exercises.map((ex, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">
                            {ex.exercise?.name || "Exercice"}
                          </h5>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{ex.sets} séries</span>
                            {ex.weightKg && <span>{ex.weightKg} kg</span>}
                            {ex.restSeconds && (
                              <span>{ex.restSeconds}s repos</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Répétitions :</span>
                          {ex.repsUniform ? (
                            <span>
                              {ex.sets} × {ex.repsUniform}
                            </span>
                          ) : ex.repsPerSet ? (
                            <span>
                              {(ex.repsPerSet as number[]).join(", ")}
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                        {ex.notes && (
                          <p className="mt-2 text-sm text-gray-500 italic">
                            {ex.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {sessions.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {sessions.length} séance{sessions.length > 1 ? "s" : ""} affichée
          {sessions.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default TrainingHistory;
