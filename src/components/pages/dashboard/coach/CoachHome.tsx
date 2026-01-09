import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import API_URL from "../../../../config/api";
import { useToast } from "../../../../contexts/ToastContext";
import {
  useGoogleCalendarAuthUrl,
  useMyReservations as useMyCalendarReservations,
} from "../../../../hooks/useCalendarReservations";

const CoachHome: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState(0);
  const {
    authUrl,
    isLoading: isLoadingGoogleUrl,
    error: googleError,
    fetchAuthUrl,
  } = useGoogleCalendarAuthUrl("/dashboard");
  const {
    reservations,
    isLoading: isLoadingReservations,
    error: reservationsError,
  } = useMyCalendarReservations();

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setStudentsCount(data.length);
          }
        })
        .catch((err) => console.error("Erreur:", err));
    }
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleStatus = params.get("googleCalendar");

    if (googleStatus === "connected") {
      showToast(
        "Google Calendar connecté avec succès ! Vos nouvelles réservations seront ajoutées à votre agenda.",
        "success"
      );
      params.delete("googleCalendar");
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace: true }
      );
      // Recharger la page pour récupérer les dernières infos utilisateur (googleCalendarId)
      window.location.reload();
    }
  }, [location, navigate, showToast]);

  const handleConnectGoogleCalendar = async () => {
    try {
      const url = await fetchAuthUrl();
      window.location.href = url;
    } catch (error) {
      // L'erreur est déjà gérée dans le hook via setError, on affiche simplement un toast
      showToast(
        error instanceof Error
          ? error.message
          : "Erreur lors de la connexion à Google Calendar",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.name} !
        </h1>
        <p className="mt-2 text-gray-600">
          Tableau de bord coach - Gérez vos élèves
        </p>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Nombre d'élèves
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {studentsCount}
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Séances aujourd'hui
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
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
                Messages non lus
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Volume total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0T</p>
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

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/students"
            className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Créer un élève
          </Link>
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            <svg
              className="w-5 h-5 mr-2"
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
            Créer une séance
          </button>
          {!user?.googleCalendarId && (
            <button
              type="button"
              onClick={handleConnectGoogleCalendar}
              disabled={isLoadingGoogleUrl}
              className="flex items-center justify-center px-4 py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 shadow-sm"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isLoadingGoogleUrl ? "Connexion..." : "Connectez votre agenda"}
            </button>
          )}
        </div>
        {googleError && (
          <p className="mt-3 text-sm text-red-600">{googleError}</p>
        )}
      </div>

      {/* Réservations calendrier & sections à venir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Prochaines réservations
          </h2>
          {isLoadingReservations ? (
            <p className="text-gray-500 text-sm">
              Chargement des réservations en cours...
            </p>
          ) : reservationsError ? (
            <p className="text-red-600 text-sm">{reservationsError}</p>
          ) : reservations.length === 0 ? (
            <p className="text-gray-600 text-sm">
              Aucune réservation pour le moment. Lorsque vos élèves réserveront
              des séances, elles apparaîtront ici et dans votre Google Calendar.
            </p>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 5).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {reservation.student?.name || "Élève"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(reservation.startDateTime).toLocaleString(
                        "fr-FR",
                        {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      • {reservation.sessionType}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {reservation.status === "confirmed"
                      ? "Confirmée"
                      : reservation.status}
                  </span>
                </div>
              ))}
              {reservations.length > 5 && (
                <p className="text-xs text-gray-500">
                  {reservations.length - 5} réservation(s) supplémentaire(s)...
                </p>
              )}
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Mes élèves
          </h2>
          <p className="text-gray-600 text-sm">
            Gérez vos élèves, créez des codes d'invitation, consultez leurs
            données
          </p>
          <p className="text-gray-400 text-xs mt-2">À venir...</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Séances</h2>
          <p className="text-gray-600 text-sm">
            Consultez et créez des séances pour vos élèves
          </p>
          <p className="text-gray-400 text-xs mt-2">À venir...</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Mensurations
          </h2>
          <p className="text-gray-600 text-sm">
            Consultez les mensurations de tous vos élèves
          </p>
          <p className="text-gray-400 text-xs mt-2">À venir...</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Messagerie
          </h2>
          <p className="text-gray-600 text-sm">Échangez avec vos élèves</p>
          <p className="text-gray-400 text-xs mt-2">À venir...</p>
        </div>
      </div>
    </div>
  );
};

export default CoachHome;
