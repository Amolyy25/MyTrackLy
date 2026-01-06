import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useTrainingStats } from "../../../hooks/useTrainingSessions";
import ErrorDisplay from "../../composants/ErrorDisplay";
import LoadingSpinner from "../../composants/LoadingSpinner";

const Home: React.FC = () => {
  const { user } = useAuth();
  const { stats, isLoading, error } = useTrainingStats();

  const goalMessages = {
    weight_loss: {
      positive: "Bien joué ! Vous avez perdu du poids",
      negative: "Pas de panique, la progression n'est pas toujours linéaire !",
    },
    weight_gain: {
      positive: "Excellent ! Vous avez pris du poids",
      negative: "Pas de panique, la progression n'est pas toujours linéaire !",
    },
    muscle_gain: {
      positive: "Super ! Votre progression est au rendez-vous.",
      negative: "Continuez vos efforts, la masse musculaire prend du temps.",
    },
    maintenance: {
      positive: "Votre poids est stable. Parfait pour maintenir votre forme !",
      negative: "Votre poids fluctue légèrement. C'est normal.",
    },
  };

  const getGoalMessage = () => {
    if (!user?.goalType || !stats?.weightChange) return null;
    const messages = goalMessages[user.goalType as keyof typeof goalMessages];
    const isPositive =
      (user.goalType === "weight_loss" && stats.weightChange < 0) ||
      (user.goalType === "weight_gain" && stats.weightChange > 0) ||
      user.goalType === "muscle_gain" ||
      (user.goalType === "maintenance" && Math.abs(stats.weightChange) < 1);

    return {
      message: isPositive
        ? messages.positive +
          (stats.weightChange !== 0
            ? ` ${Math.abs(stats.weightChange)}kg ce mois`
            : "")
        : messages.negative,
      color: isPositive ? "green" : "orange",
    };
  };

  const goalMessage = getGoalMessage();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.name} 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Voici un aperçu de vos performances
        </p>
      </div>

      {/* Goal Message */}
      {goalMessage && (
        <div
          className={`${
            goalMessage.color === "green"
              ? "bg-green-50 border-green-200"
              : "bg-orange-50 border-orange-200"
          } border rounded-xl p-6`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`${
                goalMessage.color === "green"
                  ? "bg-green-100 text-green-600"
                  : "bg-orange-100 text-orange-600"
              } w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
            >
              {goalMessage.color === "green" ? "🎯" : "💪"}
            </div>
            <div>
              <h3
                className={`${
                  goalMessage.color === "green"
                    ? "text-green-900"
                    : "text-orange-900"
                } font-semibold mb-1`}
              >
                {goalMessage.color === "green"
                  ? "Objectif en bonne voie !"
                  : "Continuez vos efforts"}
              </h3>
              <p
                className={`${
                  goalMessage.color === "green"
                    ? "text-green-700"
                    : "text-orange-700"
                } text-sm`}
              >
                {goalMessage.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Séances totales
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.totalSessions || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Depuis le début</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Poids</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.totalVolume ? stats.totalVolume.toFixed(1) : "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          {/* TODO METTRE LA PHARSE EN FONCTION DE SON OBJECTIF DE POIDS.
          <p className="mt-3 text-xs text-gray-500">Charge totale soulevée</p> */}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streak</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.currentStreak || 0}{" "}
                <span className="text-xl">
                  jour{(stats?.currentStreak || 0) > 1 ? "s" : ""}
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              🔥
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Jours consécutifs</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Régularité</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.weeklyFrequency?.toFixed() || "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Séances par semaine</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Prêt pour votre prochaine séance ?
            </h2>
            <p className="text-indigo-100">
              Commencez à logger vos exercices et suivez votre progression
            </p>
          </div>
          <Link
            to="/dashboard/training/new"
            className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg whitespace-nowrap"
          >
            Nouvelle séance
          </Link>
        </div>
      </div>

      {/* Recent Sessions */}
      {stats?.lastSession && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Dernière séance</h2>
            <Link
              to="/dashboard/training/history"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voir tout →
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
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
                <p className="font-semibold text-gray-900">
                  Séance du{" "}
                  {new Date(stats.lastSession.date).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "numeric",
                      month: "long",
                    }
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {stats.lastSession.exercises?.length || 0} exercices
                  {stats.lastSession.durationMinutes &&
                    ` • ${stats.lastSession.durationMinutes} min`}
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
