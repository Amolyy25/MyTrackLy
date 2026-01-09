import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useMyReservations,
  useUpdateReservationStatus,
  useSendReservationReminder,
  useGoogleCalendarAuthUrl,
} from "../../../../hooks/useCalendarReservations";
import { useToast } from "../../../../contexts/ToastContext";
import { useAuth } from "../../../../contexts/AuthContext";

// Composants d'icônes SVG
const IconMuscle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconYoga = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconCardio = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const IconTarget = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconClock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconMessage = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

const IconFilter = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const IconCheck = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconCalendar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconBell = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const IconClipboard = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled" | "refused";

const CoachReservations: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>("");
  const [editTime, setEditTime] = useState<string>("");

  const { showToast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    authUrl,
    isLoading: isLoadingGoogleUrl,
    fetchAuthUrl,
  } = useGoogleCalendarAuthUrl("/dashboard/reservations");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleStatus = params.get("googleCalendar");

    if (googleStatus === "connected") {
      showToast("Google Calendar connecté", "success");
      params.delete("googleCalendar");
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace: true }
      );
      window.location.reload();
    }
  }, [location, navigate, showToast]);

  const handleConnectGoogleCalendar = async () => {
    try {
      const url = await fetchAuthUrl();
      window.location.href = url;
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Impossible de se connecter à Google Calendar",
        "error"
      );
    }
  };

  const { reservations, isLoading, error, refetch } = useMyReservations({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const {
    updateStatus,
    isLoading: isUpdatingStatus,
    error: updateError,
  } = useUpdateReservationStatus();

  const {
    sendReminder,
    isLoading: isSendingReminder,
    error: reminderError,
  } = useSendReservationReminder();

  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return reservations;
    return reservations.filter((r) => r.status === statusFilter);
  }, [reservations, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: reservations.length,
      pending: reservations.filter((r) => r.status === "pending").length,
      confirmed: reservations.filter((r) => r.status === "confirmed").length,
      cancelled: reservations.filter((r) => r.status === "cancelled").length,
      refused: reservations.filter((r) => r.status === "refused").length,
    };
  }, [reservations]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
    setShowFilters(false);
  };

  const handleAccept = async (id: string) => {
    try {
      await updateStatus(id, { action: "accept" });
      showToast("Réservation acceptée", "success");
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Impossible d'accepter la réservation",
        "error"
      );
    }
  };

  const handleRefuse = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir refuser cette réservation ?")) {
      return;
    }
    try {
      await updateStatus(id, { action: "refuse" });
      showToast("Réservation refusée", "success");
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Impossible de refuser la réservation",
        "error"
      );
    }
  };

  const handleOpenReschedule = (id: string, currentDate: string) => {
    const d = new Date(currentDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const timeStr = `${hours}:${minutes}`;
    setEditingId(id);
    setEditDate(dateStr);
    setEditTime(timeStr);
  };

  const handleReschedule = async (id: string) => {
    if (!editDate || !editTime) {
      showToast("Sélectionnez une date et une heure", "error");
      return;
    }

    try {
      const [year, month, day] = editDate.split("-").map(Number);
      const [hours, minutes] = editTime.split(":").map(Number);
      const start = new Date(year, month - 1, day, hours, minutes);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      await updateStatus(id, {
        action: "reschedule",
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
      });
      showToast("Réservation décalée", "success");
      setEditingId(null);
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Impossible de décaler la réservation",
        "error"
      );
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      await sendReminder(id);
      showToast("Rappel envoyé", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Impossible d'envoyer le rappel",
        "error"
      );
    }
  };

  const sessionIcons: Record<string, React.ReactNode> = {
    muscu: <IconMuscle className="w-5 h-5" />,
    yoga: <IconYoga className="w-5 h-5" />,
    cardio: <IconCardio className="w-5 h-5" />,
    autre: <IconTarget className="w-5 h-5" />,
  };

  const statusColors = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
    refused: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const statusLabels = {
    confirmed: "Confirmée",
    pending: "En attente",
    cancelled: "Annulée",
    refused: "Refusée",
  };

  // Si le coach n'est pas connecté à Google Calendar
  if (!user?.googleCalendarId) {
    return (
      <div className="space-y-6">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Réservations des élèves
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Visualisez toutes les réservations reçues de vos élèves. Chaque
            réservation correspond à un événement dans votre Google Calendar.
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px] px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto"
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
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
              Connectez-vous à Google Agenda
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6">
              Pour gérer les réservations de vos élèves et synchroniser avec
              votre calendrier, connectez votre compte Google Calendar.
            </p>
            <button
              type="button"
              onClick={handleConnectGoogleCalendar}
              disabled={isLoadingGoogleUrl}
              className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-white text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 shadow-sm"
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
              {isLoadingGoogleUrl
                ? "Connexion..."
                : "Connectez-vous à Google Agenda"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Réservations des élèves
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Visualisez toutes les réservations reçues de vos élèves. Chaque
          réservation correspond à un événement dans votre Google Calendar.
        </p>
      </div>

      {/* Compteurs de statuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-0">
        <button
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === "pending"
              ? "bg-amber-50 border-amber-400 shadow-md"
              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <p className="text-2xl sm:text-3xl font-bold text-amber-600">
            {statusCounts.pending}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">En attente</p>
        </button>
        <button
          onClick={() => setStatusFilter("confirmed")}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === "confirmed"
              ? "bg-emerald-50 border-emerald-400 shadow-md"
              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {statusCounts.confirmed}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Confirmées</p>
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === "cancelled"
              ? "bg-slate-50 border-slate-400 shadow-md"
              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <p className="text-2xl sm:text-3xl font-bold text-slate-600">
            {statusCounts.cancelled}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Annulées</p>
        </button>
        <button
          onClick={() => setStatusFilter("refused")}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === "refused"
              ? "bg-rose-50 border-rose-400 shadow-md"
              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
          }`}
        >
          <p className="text-2xl sm:text-3xl font-bold text-rose-600">
            {statusCounts.refused}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Refusées</p>
        </button>
      </div>

      {/* Bouton de filtres */}
      <div className="px-4 sm:px-0">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <IconFilter className="w-5 h-5" />
          {showFilters ? "Masquer les filtres" : "Filtrer par date"}
        </button>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 mx-4 sm:mx-0">
          <form className="space-y-4" onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Appliquer les filtres
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  refetch();
                }}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs de filtres par statut */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-4 sm:px-0 scrollbar-hide">
        <button
          onClick={() => setStatusFilter("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            statusFilter === "all"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Toutes ({statusCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          En attente ({statusCounts.pending})
        </button>
        <button
          onClick={() => setStatusFilter("confirmed")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            statusFilter === "confirmed"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Confirmées ({statusCounts.confirmed})
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            statusFilter === "cancelled"
              ? "bg-slate-500 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Annulées ({statusCounts.cancelled})
        </button>
        <button
          onClick={() => setStatusFilter("refused")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            statusFilter === "refused"
              ? "bg-rose-600 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Refusées ({statusCounts.refused})
        </button>
      </div>

      {/* Liste des réservations */}
      <div className="space-y-3 px-4 sm:px-0">
        {(updateError || reminderError) && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <p className="text-sm text-rose-600">
              {updateError || reminderError}
            </p>
          </div>
        )}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
            <p className="text-sm text-slate-600 mt-3">
              Chargement des réservations...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8 px-4 bg-rose-50 rounded-xl border border-rose-200">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-300/60">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <IconClipboard className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base text-slate-700 font-semibold mb-1">
              Aucune réservation
            </p>
            <p className="text-sm text-slate-500">
              {statusFilter !== "all"
                ? `Pas de réservations avec le statut "${statusLabels[statusFilter as keyof typeof statusLabels]}"`
                : "Aucune réservation trouvée pour la période sélectionnée"}
            </p>
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar/Initiales */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {reservation.student?.name
                      ? reservation.student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "?"}
                  </div>
                  
                  {/* Info principale */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-slate-900">
                          {reservation.student?.name || "Élève"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(reservation.startDateTime).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            }
                          )}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[reservation.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[reservation.status as keyof typeof statusLabels] || reservation.status}
                      </span>
                    </div>
                    
                    {/* Détails */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <IconClock className="w-4 h-4 text-slate-400" />
                        {new Date(
                          reservation.startDateTime
                        ).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(
                          reservation.endDateTime
                        ).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-400">
                          {sessionIcons[reservation.sessionType]}
                        </span>
                        <span className="capitalize">{reservation.sessionType}</span>
                      </span>
                    </div>
                    
                    {reservation.notes && (
                      <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                        <p className="text-xs text-slate-600 flex items-start gap-1.5">
                          <IconMessage className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                          <span className="font-medium">Note de l&apos;élève:</span> {reservation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  {reservation.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleAccept(reservation.id)}
                        className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <IconCheck className="w-4 h-4" />
                        Accepter
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() =>
                          handleOpenReschedule(
                            reservation.id,
                            reservation.startDateTime
                          )
                        }
                        className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <IconCalendar className="w-4 h-4" />
                        Décaler
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleRefuse(reservation.id)}
                        className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-sm font-medium rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <IconX className="w-4 h-4" />
                        Refuser
                      </button>
                    </>
                  )}
                  {reservation.status === "confirmed" && (
                    <>
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() =>
                          handleOpenReschedule(
                            reservation.id,
                            reservation.startDateTime
                          )
                        }
                        className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <IconCalendar className="w-4 h-4" />
                        Décaler
                      </button>
                      <button
                        type="button"
                        disabled={isSendingReminder}
                        onClick={() => handleSendReminder(reservation.id)}
                        className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-sm font-medium rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <IconBell className="w-4 h-4" />
                        Rappel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Modal de reschedule */}
              {editingId === reservation.id && (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 border-t-2 border-indigo-200/60">
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                    <IconCalendar className="w-4 h-4 text-indigo-600" />
                    Nouvelle date et heure
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Heure
                        </label>
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleReschedule(reservation.id)}
                        className="flex-1 min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <IconCheck className="w-4 h-4" />
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex-1 min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-xl bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50 transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoachReservations;
