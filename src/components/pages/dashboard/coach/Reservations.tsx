import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useMyReservations,
  useUpdateReservationStatus,
  useSendReservationReminder,
  useGoogleCalendarAuthUrl,
} from "../../../../hooks/useCalendarReservations";
import { useCoachAvailabilities } from "../../../../hooks/useAvailabilities";
import { useToast } from "../../../../contexts/ToastContext";
import { useAuth } from "../../../../contexts/AuthContext";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Users,
  Dumbbell,
  Heart,
  Zap,
  Target,
  MessageSquare,
  Check,
  X,
  CalendarClock,
  Send,
  RotateCcw,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled" | "refused";
type TabType = "overview" | "list";

const CoachReservations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>("");
  const [editTime, setEditTime] = useState<string>("");
  const [expandedReservation, setExpandedReservation] = useState<string | null>(
    null
  );

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
        error instanceof Error
          ? error.message
          : "Impossible de se connecter à Google Calendar",
        "error"
      );
    }
  };

  const { reservations, isLoading, error, refetch } = useMyReservations({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  // Vérifier si le coach a défini des disponibilités
  const { availabilities } = useCoachAvailabilities();

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

  // Filter out past reservations (only show future ones)
  const futureReservations = useMemo(() => {
    const now = new Date();
    return reservations.filter((r) => new Date(r.endDateTime) > now);
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    if (statusFilter === "all") return futureReservations;
    return futureReservations.filter((r) => r.status === statusFilter);
  }, [futureReservations, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: futureReservations.length,
      pending: futureReservations.filter((r) => r.status === "pending").length,
      confirmed: futureReservations.filter((r) => r.status === "confirmed")
        .length,
      cancelled: futureReservations.filter((r) => r.status === "cancelled")
        .length,
      refused: futureReservations.filter((r) => r.status === "refused").length,
    };
  }, [futureReservations]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const thisWeekReservations = futureReservations.filter((r) => {
      const date = new Date(r.startDateTime);
      return date >= startOfWeek && date < endOfWeek;
    });

    const uniqueStudents = new Set(futureReservations.map((r) => r.student?.id))
      .size;

    // Session types count
    const sessionTypes: Record<string, number> = {};
    futureReservations.forEach((r) => {
      const type = r.sessionType || "autre";
      sessionTypes[type] = (sessionTypes[type] || 0) + 1;
    });

    return {
      thisWeekCount: thisWeekReservations.length,
      uniqueStudents,
      sessionTypes,
      pendingToday: futureReservations.filter((r) => {
        const date = new Date(r.startDateTime);
        return (
          r.status === "pending" && date.toDateString() === today.toDateString()
        );
      }).length,
    };
  }, [futureReservations]);

  const nextReservation = futureReservations
    .filter((r) => r.status === "confirmed" || r.status === "pending")
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime()
    )[0];

  const recentReservations = filteredReservations.slice(0, 3);

  const handleAccept = async (id: string) => {
    try {
      await updateStatus(id, { action: "accept" });
      showToast("Réservation acceptée", "success");
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Impossible d'accepter la réservation",
        "error"
      );
    }
  };

  const handleRefuse = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir refuser cette réservation ?"))
      return;
    try {
      await updateStatus(id, { action: "refuse" });
      showToast("Réservation refusée", "success");
      refetch();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Impossible de refuser la réservation",
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
        err instanceof Error
          ? err.message
          : "Impossible de décaler la réservation",
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

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "muscu":
        return <Dumbbell className="h-4 w-4" />;
      case "yoga":
        return <Heart className="h-4 w-4" />;
      case "cardio":
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Confirmée
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock className="h-3 w-3" />
            En attente
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20">
            <XCircle className="h-3 w-3" />
            Annulée
          </span>
        );
      case "refused":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <X className="h-3 w-3" />
            Refusée
          </span>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: "overview" as TabType, label: "Aperçu", icon: Sparkles },
    {
      id: "list" as TabType,
      label: "Réservations",
      icon: CalendarDays,
      count: statusCounts.all,
    },
  ];

  // Si le coach n'est pas connecté à Google Calendar
  if (!user?.googleCalendarId) {
    return (
      <div className="space-y-6 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="flex items-center gap-4 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Calendrier
            </h1>
            <p className="text-muted-foreground text-sm">
              Gérez les réservations de vos élèves
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10"
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
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Connectez Google Calendar
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Pour gérer les réservations de vos élèves et synchroniser avec
              votre calendrier, connectez votre compte Google.
            </p>
            <Button
              onClick={handleConnectGoogleCalendar}
              disabled={isLoadingGoogleUrl}
              className="rounded-xl h-11 gap-2"
            >
              {isLoadingGoogleUrl ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="w-5 h-5"
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
              )}
              Connecter Google Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Chargement des réservations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Calendrier
            </h1>
            <p className="text-muted-foreground text-sm">
              Gérez les réservations de vos élèves
            </p>
          </div>
        </div>
      </div>

      {/* Warning if no availabilities */}
      {availabilities && availabilities.length === 0 && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Aucune disponibilité configurée
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Vos élèves ne peuvent pas prendre de rendez-vous tant que vous
                  n'avez pas défini vos créneaux de disponibilité.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2 border-amber-500/30 hover:bg-amber-500/10 text-amber-700"
                  onClick={() => navigate("/dashboard/availabilities")}
                >
                  Configurer mes disponibilités
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md text-xs ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card
                className="border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10 overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setActiveTab("list");
                  setStatusFilter("pending");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        En attente
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {statusCounts.pending}
                      </p>
                      <p className="text-xs text-muted-foreground">à traiter</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setActiveTab("list");
                  setStatusFilter("confirmed");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Confirmées
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {statusCounts.confirmed}
                      </p>
                      <p className="text-xs text-muted-foreground">à venir</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 to-violet-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Cette semaine
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.thisWeekCount}
                      </p>
                      <p className="text-xs text-muted-foreground">séances</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarDays className="h-5 w-5 text-violet-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Élèves
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.uniqueStudents}
                      </p>
                      <p className="text-xs text-muted-foreground">actifs</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Reservation Highlight */}
            {nextReservation && (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white font-bold text-xl">
                        {nextReservation.student?.name
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
                          Prochaine séance
                        </span>
                        {getStatusBadge(nextReservation.status)}
                      </div>
                      <h3 className="text-lg font-bold text-foreground truncate">
                        {nextReservation.student?.name || "Élève"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          nextReservation.startDateTime
                        ).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {new Date(
                              nextReservation.startDateTime
                            ).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {getSessionIcon(nextReservation.sessionType)}
                          <span className="capitalize">
                            {nextReservation.sessionType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg gap-1.5 flex-shrink-0"
                      onClick={() => {
                        setActiveTab("list");
                        setExpandedReservation(nextReservation.id);
                      }}
                    >
                      Détails
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Reservations */}
            {recentReservations.length > 0 && (
              <Card className="border-border/50 bg-card">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Réservations récentes
                    </h3>
                    <button
                      onClick={() => setActiveTab("list")}
                      className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      Tout voir
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {recentReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab("list");
                          setExpandedReservation(reservation.id);
                        }}
                      >
                        <Avatar className="h-10 w-10 border border-border/50">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white font-bold text-sm">
                            {reservation.student?.name
                              ?.charAt(0)
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">
                              {reservation.student?.name || "Élève"}
                            </p>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
                            <span>
                              {new Date(
                                reservation.startDateTime
                              ).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(
                                reservation.startDateTime
                              ).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                              {reservation.sessionType}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {futureReservations.length === 0 && (
              <Card className="border-dashed border-2 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucune réservation
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Vos élèves n'ont pas encore effectué de réservation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-4">
            {/* Actions Pending */}
            {statusCounts.pending > 0 && (
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Actions requises
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {statusCounts.pending} en attente
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-10 border-amber-500/30 hover:bg-amber-500/10"
                    onClick={() => {
                      setActiveTab("list");
                      setStatusFilter("pending");
                    }}
                  >
                    Traiter maintenant
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Session Types */}
            {Object.keys(stats.sessionTypes).length > 0 && (
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Types de séances
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Répartition
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(stats.sessionTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          {getSessionIcon(type)}
                        </div>
                        <span className="flex-1 text-sm text-foreground capitalize">
                          {type}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm mb-1">
                      Conseil
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Confirmez rapidement les réservations pour une meilleure
                      organisation et satisfaction de vos élèves !
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
              {(
                [
                  "all",
                  "pending",
                  "confirmed",
                  "cancelled",
                  "refused",
                ] as StatusFilter[]
              ).map((status) => {
                const colors = {
                  all: "bg-primary text-primary-foreground",
                  pending: "bg-amber-500 text-white",
                  confirmed: "bg-emerald-500 text-white",
                  cancelled: "bg-slate-500 text-white",
                  refused: "bg-rose-500 text-white",
                };
                const labels = {
                  all: `Toutes (${statusCounts.all})`,
                  pending: `En attente (${statusCounts.pending})`,
                  confirmed: `Confirmées (${statusCounts.confirmed})`,
                  cancelled: `Annulées (${statusCounts.cancelled})`,
                  refused: `Refusées (${statusCounts.refused})`,
                };
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      statusFilter === status
                        ? `${colors[status]} shadow-md`
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {labels[status]}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 border-border/50 h-10 ${
                showFilters ? "bg-muted" : ""
              }`}
            >
              <Filter className="h-4 w-4" />
              Dates
              {(dateFrom || dateTo) && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>

          {/* Date Filters Panel */}
          {showFilters && (
            <Card className="border-border/50 bg-muted/20 animate-in slide-in-from-top-2 duration-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Du
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Au
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                      refetch();
                    }}
                    className="mt-3 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Réinitialiser
                  </button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Errors */}
          {(updateError || reminderError) && (
            <Card className="border-rose-500/30 bg-rose-500/10">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <p className="text-sm text-rose-600">
                  {updateError || reminderError}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reservations List */}
          {filteredReservations.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucune réservation
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {statusFilter !== "all"
                    ? `Pas de réservations avec ce statut`
                    : "Aucune réservation trouvée pour cette période"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredReservations.map((reservation, index) => {
                const isExpanded = expandedReservation === reservation.id;
                const isEditing = editingId === reservation.id;

                return (
                  <Card
                    key={reservation.id}
                    className="border-border/50 bg-card overflow-hidden hover:shadow-md transition-all"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Reservation Header */}
                    <div
                      className="p-4 cursor-pointer group"
                      onClick={() =>
                        setExpandedReservation(
                          isExpanded ? null : reservation.id
                        )
                      }
                    >
                      <div className="flex items-center gap-4">
                        {/* Date Badge */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex-shrink-0">
                          <span className="text-lg font-bold text-primary leading-none">
                            {new Date(reservation.startDateTime).getDate()}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase mt-0.5">
                            {new Date(
                              reservation.startDateTime
                            ).toLocaleDateString("fr-FR", { month: "short" })}
                          </span>
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-11 w-11 border border-border/50 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white font-bold">
                            {reservation.student?.name
                              ?.charAt(0)
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {reservation.student?.name || "Élève"}
                            </h3>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(
                                reservation.startDateTime
                              ).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" - "}
                              {new Date(
                                reservation.endDateTime
                              ).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground capitalize">
                              {getSessionIcon(reservation.sessionType)}
                              {reservation.sessionType}
                            </span>
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <div
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Notes (when not expanded) */}
                    {reservation.notes && !isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            "{reservation.notes}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Notes */}
                        {reservation.notes && (
                          <div className="mb-4 flex items-start gap-2 p-3 bg-background rounded-xl border border-border/50">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Note de l'élève
                              </p>
                              <p className="text-sm text-foreground">
                                {reservation.notes}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Reschedule Form */}
                        {isEditing && (
                          <div className="mb-4 p-4 bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <CalendarClock className="h-4 w-4 text-primary" />
                              <span className="text-sm font-semibold text-foreground">
                                Nouvelle date et heure
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                  Heure
                                </label>
                                <input
                                  type="time"
                                  value={editTime}
                                  onChange={(e) => setEditTime(e.target.value)}
                                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 rounded-xl gap-2"
                                onClick={() => handleReschedule(reservation.id)}
                                disabled={isUpdatingStatus}
                              >
                                {isUpdatingStatus ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                Enregistrer
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 rounded-xl"
                                onClick={() => setEditingId(null)}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {reservation.status === "pending" && (
                            <>
                              <Button
                                className="flex-1 sm:flex-none rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleAccept(reservation.id)}
                                disabled={isUpdatingStatus}
                              >
                                <Check className="h-4 w-4" />
                                Accepter
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 sm:flex-none rounded-xl gap-1.5"
                                onClick={() =>
                                  handleOpenReschedule(
                                    reservation.id,
                                    reservation.startDateTime
                                  )
                                }
                                disabled={isUpdatingStatus}
                              >
                                <CalendarClock className="h-4 w-4" />
                                Décaler
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 sm:flex-none rounded-xl gap-1.5 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 border-rose-500/30"
                                onClick={() => handleRefuse(reservation.id)}
                                disabled={isUpdatingStatus}
                              >
                                <X className="h-4 w-4" />
                                Refuser
                              </Button>
                            </>
                          )}
                          {reservation.status === "confirmed" && (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1 sm:flex-none rounded-xl gap-1.5"
                                onClick={() =>
                                  handleOpenReschedule(
                                    reservation.id,
                                    reservation.startDateTime
                                  )
                                }
                                disabled={isUpdatingStatus}
                              >
                                <CalendarClock className="h-4 w-4" />
                                Décaler
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 sm:flex-none rounded-xl gap-1.5 text-amber-600 hover:bg-amber-500/10"
                                onClick={() =>
                                  handleSendReminder(reservation.id)
                                }
                                disabled={isSendingReminder}
                              >
                                {isSendingReminder ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Bell className="h-4 w-4" />
                                )}
                                Envoyer un rappel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Results count */}
          {filteredReservations.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-2">
              {filteredReservations.length} réservation
              {filteredReservations.length > 1 ? "s" : ""} affichée
              {filteredReservations.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachReservations;
