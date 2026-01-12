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
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  Calendar,
  Clock,
  CalendarPlus,
  CalendarCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  Dumbbell,
  Heart,
  Zap,
  Target,
  MessageSquare,
  Sparkles,
  CalendarDays,
  ListChecks,
} from "lucide-react";

type TabType = "book" | "reservations";

const StudentReservations: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { authUrl, isLoading: isLoadingGoogleUrl, fetchAuthUrl } = useGoogleCalendarAuthUrl("/dashboard/reservations");

  const [activeTab, setActiveTab] = useState<TabType>("book");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null);
  const [sessionType, setSessionType] = useState("muscu");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleStatus = params.get("googleCalendar");
    if (googleStatus === "connected") {
      showToast("Google Calendar connecté", "success");
      params.delete("googleCalendar");
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      window.location.reload();
    }
  }, [location, navigate, showToast]);

  const handleConnectGoogleCalendar = async () => {
    try {
      const url = await fetchAuthUrl();
      window.location.href = url;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible de se connecter à Google Calendar", "error");
    }
  };

  const { reservations, isLoading: isLoadingReservations, error: reservationsError, refetch } = useMyReservations();
  const { createReservation, isLoading: isCreatingReservation, error: createReservationError } = useCreateReservation();
  const { cancelReservation, isLoading: isCancelling } = useCancelReservation();

  const hasCoach = user?.coachId;
  const isGoogleConnected = user?.googleCalendarId;
  const { slots, isLoading: isLoadingSlots, error: slotsError } = useCoachSlots(user?.coachId, selectedDate);

  const sessionIcons: Record<string, React.ReactNode> = {
    muscu: <Dumbbell className="w-5 h-5" />,
    yoga: <Heart className="w-5 h-5" />,
    cardio: <Zap className="w-5 h-5" />,
    autre: <Target className="w-5 h-5" />,
  };

  const sessionColors: Record<string, string> = {
    muscu: "bg-primary/10 text-primary",
    yoga: "bg-pink-500/10 text-pink-500",
    cardio: "bg-orange-500/10 text-orange-500",
    autre: "bg-slate-500/10 text-slate-500",
  };

  const statusConfig = {
    confirmed: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle, label: "Confirmée" },
    pending: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock, label: "En attente" },
    cancelled: { color: "bg-slate-500/10 text-slate-500 border-slate-500/20", icon: XCircle, label: "Annulée" },
    refused: { color: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: AlertCircle, label: "Refusée" },
  };

  // Filter out past reservations (only show future ones)
  const now = new Date();
  const futureReservations = reservations.filter(r => new Date(r.endDateTime) > now);
  const pastReservations = reservations.filter(r => new Date(r.endDateTime) <= now);
  
  // Stats (only from future reservations)
  const upcomingReservations = futureReservations.filter(r => r.status === "confirmed" || r.status === "pending");
  const nextReservation = upcomingReservations[0];
  const confirmedCount = futureReservations.filter(r => r.status === "confirmed").length;
  const pendingCount = futureReservations.filter(r => r.status === "pending").length;

  const handleCancel = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;
    try {
      await cancelReservation(id);
      showToast("Réservation annulée", "success");
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible d'annuler la réservation", "error");
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
      setActiveTab("reservations");
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible de créer la réservation", "error");
    }
  };

  // No coach state
  if (!hasCoach) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Aucun coach assigné</h2>
            <p className="text-muted-foreground text-sm mb-1">
              Vous devez être lié à un coach pour pouvoir réserver des séances.
            </p>
            <p className="text-muted-foreground text-xs">
              Contactez votre coach pour obtenir un code d'invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "book" as TabType, label: "Réserver", icon: CalendarPlus },
    { id: "reservations" as TabType, label: "Mes réservations", icon: ListChecks, count: upcomingReservations.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Réservations</h1>
            <p className="text-muted-foreground text-sm">Gérez vos séances avec votre coach</p>
          </div>
        </div>
      </div>

      {/* Google Calendar Connection Required */}
      {!isGoogleConnected && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-semibold text-foreground mb-2">Connectez votre Google Calendar</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Pour réserver une séance, connectez votre compte Google Calendar. Vos réservations confirmées seront automatiquement ajoutées à votre agenda.
                </p>
                <Button
                  onClick={handleConnectGoogleCalendar}
                  disabled={isLoadingGoogleUrl}
                  variant="outline"
                  className="bg-background hover:bg-muted border-border"
                >
                  {isLoadingGoogleUrl ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Connecter Google Calendar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected State */}
      {isGoogleConnected && (
        <>
          {/* Quick Stats */}
          {nextReservation && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${sessionColors[nextReservation.sessionType]}`}>
                      {sessionIcons[nextReservation.sessionType]}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Prochaine séance</p>
                      <p className="text-lg font-bold text-foreground">
                        {new Date(nextReservation.startDateTime).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(nextReservation.startDateTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {new Date(nextReservation.endDateTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig[nextReservation.status as keyof typeof statusConfig]?.color}`}>
                    {statusConfig[nextReservation.status as keyof typeof statusConfig]?.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs ${
                    activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Book Tab */}
          {activeTab === "book" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Form */}
              <div className="lg:col-span-2">
                <Card className="border-border/50 bg-card overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <CalendarPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground">Nouvelle réservation</h2>
                        <p className="text-xs text-muted-foreground">Choisissez un créneau avec votre coach</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
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
                          className="w-full h-11 px-4 bg-muted/30 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          required
                        />
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Créneaux disponibles
                        </label>
                        
                        {!selectedDate ? (
                          <div className="text-center py-10 px-4 bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
                            <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">
                              Sélectionnez une date pour voir les créneaux
                            </p>
                          </div>
                        ) : isLoadingSlots ? (
                          <div className="text-center py-10">
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground mt-3">Chargement...</p>
                          </div>
                        ) : slotsError ? (
                          <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-center">
                            <p className="text-sm text-destructive">{slotsError}</p>
                          </div>
                        ) : slots.length === 0 ? (
                          <div className="text-center py-10 px-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                            <Clock className="h-10 w-10 mx-auto text-amber-500 mb-3" />
                            <p className="text-sm font-medium text-foreground">Aucun créneau disponible</p>
                            <p className="text-xs text-muted-foreground mt-1">Essayez une autre date</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {slots.map((slot, index) => (
                              <button
                                key={`${slot.start}-${index}`}
                                type="button"
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={`py-3 px-2 text-center rounded-xl border-2 transition-all ${
                                  selectedTimeSlot?.start === slot.start
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                    : "bg-muted/20 border-border/50 hover:border-primary/50 hover:bg-primary/5"
                                }`}
                              >
                                <span className="block text-sm font-semibold">{slot.start}</span>
                                <span className={`block text-xs mt-0.5 ${
                                  selectedTimeSlot?.start === slot.start ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                  {slot.end}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Session Type */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                          Type de séance
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: "muscu", label: "Muscu", icon: Dumbbell },
                            { id: "yoga", label: "Yoga", icon: Heart },
                            { id: "cardio", label: "Cardio", icon: Zap },
                            { id: "autre", label: "Autre", icon: Target },
                          ].map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setSessionType(type.id)}
                              className={`py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                                sessionType === type.id
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "bg-muted/20 border-border/50 text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              <type.icon className="h-5 w-5" />
                              <span className="text-xs font-medium">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          Notes
                          <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          placeholder="Objectifs, contraintes, questions..."
                          className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        />
                      </div>

                      {createReservationError && (
                        <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                          <p className="text-sm text-destructive">{createReservationError}</p>
                        </div>
                      )}

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={isCreatingReservation || !selectedDate || !selectedTimeSlot}
                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 text-base font-semibold"
                      >
                        {isCreatingReservation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Réservation...
                          </>
                        ) : (
                          <>
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Réserver cette séance
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Side Info */}
              <div className="space-y-4">
                <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                        <CalendarCheck className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Réservations</p>
                        <p className="text-xs text-muted-foreground">Ce mois-ci</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Confirmées</span>
                        <span className="font-semibold text-emerald-600">{confirmedCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">En attente</span>
                        <span className="font-semibold text-amber-600">{pendingCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold text-foreground">{reservations.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm mb-1">Comment ça marche ?</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Choisissez un créneau, votre coach recevra une notification. Une fois confirmée, la séance apparaîtra dans votre Google Calendar.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === "reservations" && (
            <div className="space-y-4">
              {isLoadingReservations ? (
                <Card className="border-border/50">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Chargement...</p>
                  </CardContent>
                </Card>
              ) : reservationsError ? (
                <Card className="border-destructive/20">
                  <CardContent className="p-6 text-center">
                    <p className="text-destructive">{reservationsError}</p>
                  </CardContent>
                </Card>
              ) : futureReservations.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/20">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <CalendarCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Aucune réservation à venir</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mb-6">
                      Vous n'avez pas de séance prévue. Réservez un créneau avec votre coach.
                    </p>
                    <Button onClick={() => setActiveTab("book")} className="rounded-xl">
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Réserver une séance
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {futureReservations.map((reservation, index) => {
                    const config = statusConfig[reservation.status as keyof typeof statusConfig];
                    const StatusIcon = config?.icon || AlertCircle;
                    
                    return (
                      <Card
                        key={reservation.id}
                        className="border-border/50 bg-card hover:bg-muted/30 transition-all group overflow-hidden"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Date Badge */}
                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex-shrink-0">
                              <span className="text-lg font-bold text-primary leading-none">
                                {new Date(reservation.startDateTime).getDate()}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase mt-0.5">
                                {new Date(reservation.startDateTime).toLocaleDateString("fr-FR", { month: "short" })}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${sessionColors[reservation.sessionType]}`}>
                                  {sessionIcons[reservation.sessionType]}
                                </div>
                                <span className="font-semibold text-foreground capitalize">{reservation.sessionType}</span>
                              </div>
                              <p className="text-sm text-foreground">
                                {new Date(reservation.startDateTime).toLocaleDateString("fr-FR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(reservation.startDateTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                {" - "}
                                {new Date(reservation.endDateTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                              {reservation.notes && (
                                <p className="text-xs text-muted-foreground mt-2 truncate italic">"{reservation.notes}"</p>
                              )}
                            </div>

                            {/* Status & Actions */}
                            <div className="flex flex-col items-end gap-2">
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config?.color}`}>
                                <StatusIcon className="h-3.5 w-3.5" />
                                {config?.label}
                              </div>
                              {(reservation.status === "pending" || reservation.status === "confirmed") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancel(reservation.id)}
                                  disabled={isCancelling}
                                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
                                >
                                  <X className="h-3.5 w-3.5 mr-1" />
                                  Annuler
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentReservations;
