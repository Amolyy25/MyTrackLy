import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import API_URL from "../../../../config/api";
import { useToast } from "../../../../contexts/ToastContext";
import {
  useCoachStudentsSessions,
  useAddCoachComment,
} from "../../../../hooks/useTrainingSessions";
import { TrainingSession } from "../../../../types";

const Sessions: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const {
    sessions,
    isLoading,
    error,
    refetch,
  } = useCoachStudentsSessions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { addComment, isLoading: isAddingComment } = useAddCoachComment();

  // Récupérer la liste des élèves pour le filtre
  const [students, setStudents] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_URL}/students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des élèves:", err);
      }
    };

    if (token) {
      fetchStudents();
    }
  }, [token]);

  // Filtrer les séances par élève si un filtre est sélectionné
  const filteredSessions = selectedStudentId
    ? sessions.filter((s) => s.user?.id === selectedStudentId)
    : sessions;

  const handleAddComment = async (sessionId: string) => {
    if (!comment.trim()) {
      showToast("Le commentaire ne peut pas être vide", "error");
      return;
    }

    try {
      await addComment(sessionId, comment.trim());
      showToast("Commentaire ajouté avec succès !", "success");
      setComment("");
      setShowCommentForm(null);
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erreur lors de l'ajout du commentaire",
        "error"
      );
    }
  };

  const calculateTotalVolume = (session: TrainingSession): number => {
    return session.exercises.reduce((total, ex) => {
      const reps = ex.repsUniform
        ? ex.sets * ex.repsUniform
        : ex.repsPerSet
        ? (ex.repsPerSet as number[]).reduce((sum, r) => sum + r, 0)
        : 0;
      return total + reps * (ex.weightKg || 0);
    }, 0);
  };

  const calculateTotalReps = (session: TrainingSession): number => {
    return session.exercises.reduce((total, ex) => {
      return (
        total +
        (ex.repsUniform
          ? ex.sets * ex.repsUniform
          : ex.repsPerSet
          ? (ex.repsPerSet as number[]).reduce((sum, r) => sum + r, 0)
          : 0)
      );
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Chargement des séances...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Séances des élèves</h1>
        <p className="mt-2 text-gray-600">
          Gérez les séances de vos élèves, ajoutez des commentaires et créez de
          nouvelles séances
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par élève
            </label>
            <select
              value={selectedStudentId || ""}
              onChange={(e) =>
                setSelectedStudentId(e.target.value || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Tous les élèves</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setSelectedStudentId(null);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des séances */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">
            {selectedStudentId
              ? "Aucune séance trouvée pour cet élève"
              : "Aucune séance trouvée"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
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
                        <span className="font-medium">
                          {session.user?.name || "Élève"}
                        </span>
                        <span>•</span>
                        <span>
                          {session.exercises.length} exercice
                          {session.exercises.length > 1 ? "s" : ""}
                        </span>
                        {session.durationMinutes && (
                          <>
                            <span>•</span>
                            <span>{session.durationMinutes} min</span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          {calculateTotalReps(session)} reps •{" "}
                          {calculateTotalVolume(session).toFixed(0)} kg
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
                      onClick={() =>
                        setShowCommentForm(
                          showCommentForm === session.id ? null : session.id
                        )
                      }
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      {showCommentForm === session.id
                        ? "Annuler"
                        : session.coachComment
                        ? "Modifier commentaire"
                        : "Ajouter commentaire"}
                    </button>
                  </div>
                </div>
                {session.notes && (
                  <p className="mt-3 text-sm text-gray-600 italic">
                    Notes de l'élève: "{session.notes}"
                  </p>
                )}
                {session.coachComment && (
                  <div className="mt-3 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                    <p className="text-sm font-medium text-indigo-900 mb-1">
                      Votre commentaire:
                    </p>
                    <p className="text-sm text-indigo-700">{session.coachComment}</p>
                  </div>
                )}
              </div>

              {/* Formulaire de commentaire */}
              {showCommentForm === session.id && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire pour {session.user?.name}
                  </label>
                  <textarea
                    value={comment || session.coachComment || ""}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ajoutez un commentaire pour cette séance..."
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleAddComment(session.id)}
                      disabled={isAddingComment}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingComment ? "Envoi..." : "Envoyer"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentForm(null);
                        setComment("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

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
      {filteredSessions.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {filteredSessions.length} séance
          {filteredSessions.length > 1 ? "s" : ""} affichée
          {filteredSessions.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default Sessions;



