import React from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useTrainingStats } from "../../../../hooks/useTrainingSessions";

const StudentHome: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoading, error } = useTrainingStats();

  // Vérifier que l'utilisateur a un coach
  const hasCoach = user?.coachId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur lors du chargement des données</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.name} !
        </h1>
        <p className="mt-2 text-gray-600">
          Tableau de bord élève - Suivi avec votre coach
        </p>
      </div>

      {/* Message si pas de coach */}
      {!hasCoach && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-yellow-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-800">
                Aucun coach assigné
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Vous devez être lié à un coach pour accéder à toutes les
                fonctionnalités. Contactez votre coach pour obtenir un code
                d'invitation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informations du coach */}
      {hasCoach && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mon coach
          </h2>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-xl">
                {user?.coach?.name?.charAt(0).toUpperCase() || "C"}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {user?.coach?.name || "Coach"}
              </p>
              <p className="text-sm text-gray-600">
                {user?.coach?.email || "Email non disponible"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Séances totales
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalSessions}
                </p>
              </div>
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Série actuelle
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.currentStreak}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Fréquence hebdo
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.weeklyFrequency}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Volume total
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(stats.totalVolume / 1000).toFixed(1)}T
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dernière séance */}
      {stats?.lastSession && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dernière séance
          </h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Date :</span>{" "}
              {new Date(stats.lastSession.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Exercices :</span>{" "}
              {stats.lastSession.exercises.length}
            </p>
            {stats.lastSession.durationMinutes && (
              <p className="text-gray-600">
                <span className="font-medium">Durée :</span>{" "}
                {stats.lastSession.durationMinutes} minutes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sections à venir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Réservations
          </h2>
          <p className="text-gray-600 text-sm">
            Réservez vos séances avec votre coach
          </p>
          <p className="text-gray-400 text-xs mt-2">À venir...</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Discussion
          </h2>
          <p className="text-gray-600 text-sm">
            Échangez avec votre coach
          </p>
          <p className="text-gray-400 text-xs mt-2">À venir...</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Programmes
          </h2>
          <p className="text-gray-600 text-sm">
            Accédez aux programmes créés par votre coach
          </p>
          <p className="text-gray-400 text-xs mt-2">À venir...</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Mes séances
          </h2>
          <p className="text-gray-600 text-sm">
            Consultez toutes vos séances
          </p>
          <p className="text-gray-400 text-xs mt-2">À venir...</p>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;



