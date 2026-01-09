import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";
import {
  useMyReservations,
  useCreateReservation,
  useCancelReservation,
  useGoogleCalendarAuthUrl,
} from "../../../../hooks/useCalendarReservations";
import { useCoachSlots } from "../../../../hooks/useAvailabilities";

// Composants d'icônes SVG
const IconMuscle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const IconYoga = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const IconCardio = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const IconTarget = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconCalendar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const IconClock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconTag = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

const IconMessage = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
    />
  </svg>
);

const IconPlus = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const IconClipboard = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

const StudentReservations: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
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
        error instanceof Error
          ? error.message
          : "Impossible de se connecter à Google Calendar",
        "error"
      );
    }
  };

  const {
    reservations,
    isLoading: isLoadingReservations,
    error: reservationsError,
    refetch,
  } = useMyReservations();
  const {
    createReservation,
    isLoading: isCreatingReservation,
    error: createReservationError,
  } = useCreateReservation();
  const { cancelReservation, isLoading: isCancelling } = useCancelReservation();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [sessionType, setSessionType] = useState("muscu");
  const [notes, setNotes] = useState("");

  const hasCoach = user?.coachId;
  const isGoogleConnected = user?.googleCalendarId;

  const {
    slots,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useCoachSlots(user?.coachId, selectedDate);

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

  if (!hasCoach) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
              <IconCalendar className="w-10 h-10 text-slate-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Aucun coach assigné
          </h1>
          <p className="text-slate-600 mb-2">
            Vous devez être lié à un coach pour pouvoir réserver des séances.
          </p>
          <p className="text-sm text-slate-500">
            Contactez votre coach pour obtenir un code d&apos;invitation.
          </p>
        </div>
      </div>
    );
  }

  const handleCancel = async (id: string) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
    ) {
      return;
    }

    try {
      await cancelReservation(id);
      showToast("Réservation annulée", "success");
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Impossible d'annuler la réservation",
        "error"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot) {
      showToast("Sélectionnez une date et un créneau", "error");
      return;
    }

    try {
      const startDateTime = `${selectedDate}T${selectedTimeSlot.start}:00`;
      const endDateTime = `${selectedDate}T${selectedTimeSlot.end}:00`;

      await createReservation({
        coachId: user!.coachId as string,
        startDateTime: new Date(startDateTime).toISOString(),
        endDateTime: new Date(endDateTime).toISOString(),
        sessionType,
        notes: notes || undefined,
      });

      showToast("Réservation envoyée à votre coach", "success");
      setNotes("");
      setSelectedTimeSlot(null);
      setSelectedDate("");
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Impossible de créer la réservation",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Réserver une séance
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Réservez facilement un créneau avec votre coach. La séance sera
          ajoutée directement dans son Google Calendar.
        </p>
      </div>

      {/* Message si Google Calendar non connecté */}
      {!isGoogleConnected && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 sm:p-8 text-center">
            <div className="mb-4">
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
              Connectez votre Google Calendar
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6">
              Pour réserver une séance, vous devez connecter votre compte Google
              Calendar. Quand votre coach acceptera votre réservation, elle sera
              automatiquement ajoutée à votre agenda.
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
      )}

      {/* Formulaire de réservation */}
      {isGoogleConnected && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 sm:px-6 py-5 border-b border-slate-200/60">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center">
              <IconPlus className="w-5 h-5 sm:w-6 sm:h-6 mr-2.5 text-indigo-600" />
              Nouvelle réservation
            </h2>
          </div>
          <form className="p-4 sm:p-6 space-y-6" onSubmit={handleSubmit}>
            {/* Date */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2.5">
                <IconCalendar className="w-4 h-4 mr-1.5 text-slate-500" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlot(null);
                }}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-base transition-all"
                required
              />
            </div>

            {/* Créneaux disponibles */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-3">
                <IconClock className="w-4 h-4 mr-1.5 text-slate-500" />
                Créneaux disponibles
              </label>
              {!selectedDate ? (
                <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-300/60">
                  <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                    <IconCalendar className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    Sélectionnez une date pour voir les créneaux disponibles
                  </p>
                </div>
              ) : isLoadingSlots ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-indigo-600"></div>
                  <p className="text-sm text-slate-600 mt-3">
                    Chargement des créneaux...
                  </p>
                </div>
              ) : slotsError ? (
                <div className="text-center py-6 px-4 bg-rose-50 rounded-xl border border-rose-200">
                  <p className="text-sm text-rose-600">{slotsError}</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-10 px-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
                  <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
                    <IconClock className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-sm text-slate-700 font-medium">
                    Aucun créneau disponible pour cette date
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Essayez une autre date
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {slots.map((slot, index) => (
                    <button
                      key={`${slot.start}-${index}`}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`min-h-[52px] px-3 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                        selectedTimeSlot?.start === slot.start
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                          : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md active:scale-[0.98]"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-base">
                          {slot.start}
                        </span>
                        <span
                          className={`text-xs mt-0.5 ${
                            selectedTimeSlot?.start === slot.start
                              ? "text-indigo-100"
                              : "text-slate-500"
                          }`}
                        >
                          {slot.end}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type de séance */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2.5">
                <IconTag className="w-4 h-4 mr-1.5 text-slate-500" />
                Type de séance
              </label>
              <div className="relative">
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-base appearance-none bg-white transition-all"
                >
                  <option value="muscu">Musculation</option>
                  <option value="yoga">Yoga</option>
                  <option value="cardio">Cardio</option>
                  <option value="autre">Autre</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {sessionIcons[sessionType]}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2.5">
                <IconMessage className="w-4 h-4 mr-1.5 text-slate-500" />
                Notes pour le coach
                <span className="ml-1.5 text-xs text-slate-500 font-normal">
                  (optionnel)
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-base resize-none transition-all"
                placeholder="Ex: objectif de la séance, ressentis, contraintes horaires..."
              />
            </div>

            {createReservationError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-sm text-rose-600">
                  {createReservationError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                isCreatingReservation || !selectedDate || !selectedTimeSlot
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md active:scale-[0.98] text-base sm:text-lg"
            >
              {isCreatingReservation
                ? "Réservation en cours..."
                : "Réserver la séance"}
            </button>
          </form>
        </div>
      )}

      {/* Liste des réservations */}
      {isGoogleConnected && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 sm:px-6 py-5 border-b border-slate-200/60">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center">
              <IconClipboard className="w-5 h-5 sm:w-6 sm:h-6 mr-2.5 text-purple-600" />
              Mes prochaines réservations
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {isLoadingReservations ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-purple-600"></div>
                <p className="text-sm text-slate-600 mt-3">
                  Chargement de vos réservations...
                </p>
              </div>
            ) : reservationsError ? (
              <div className="text-center py-6 px-4 bg-rose-50 rounded-xl border border-rose-200">
                <p className="text-sm text-rose-600">{reservationsError}</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <IconClipboard className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-base text-slate-700 font-semibold mb-1">
                  Aucune réservation
                </p>
                <p className="text-sm text-slate-500">
                  Vous n&apos;avez pas encore de séance réservée avec votre
                  coach
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 10).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                            {sessionIcons[reservation.sessionType]}
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-semibold text-slate-900">
                              {new Date(
                                reservation.startDateTime
                              ).toLocaleDateString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </p>
                            <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-0.5">
                              <IconClock className="w-3.5 h-3.5" />
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
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 ml-13">
                          <span className="capitalize">
                            {reservation.sessionType}
                          </span>
                        </div>
                        {reservation.notes && (
                          <div className="mt-2.5 ml-13 p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                            <p className="text-xs text-slate-600 flex items-start gap-1.5">
                              <IconMessage className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                              {reservation.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <span
                        className={`flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          statusColors[
                            reservation.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {statusLabels[
                          reservation.status as keyof typeof statusLabels
                        ] || reservation.status}
                      </span>
                    </div>
                    {(reservation.status === "pending" ||
                      reservation.status === "confirmed") && (
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        disabled={isCancelling}
                        className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Annuler la réservation
                      </button>
                    )}
                  </div>
                ))}
                {reservations.length > 10 && (
                  <p className="text-center text-sm text-slate-500 pt-2">
                    + {reservations.length - 10} réservation(s)
                    supplémentaire(s)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReservations;
