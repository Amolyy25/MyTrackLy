import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useTrainingSessions,
  useDeleteTrainingSession,
} from "../../../hooks/useTrainingSessions";
import ErrorDisplay from "../../composants/ErrorDisplay";
import LoadingSpinner from "../../composants/LoadingSpinner";
import {
  calculateTotalVolume,
  calculateTotalReps,
} from "../../../utils/trainingCalculations";
import {
  Plus,
  Calendar,
  Dumbbell,
  Clock,
  Weight,
  ChevronDown,
  Trash2,
  Filter,
  RotateCcw,
  ClipboardList,
  Timer,
  MessageSquare,
  Flame,
  TrendingUp,
  Target,
  Sparkles,
  CalendarDays,
  BarChart3,
  ChevronRight,
  X,
  Search,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

type TabType = "overview" | "history";

const TrainingHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    sessions: allSessions,
    isLoading,
    error,
  } = useTrainingSessions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  // Filter sessions: only show past sessions (date <= today)
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sessions = useMemo(() => {
    let filtered = allSessions.filter((s) => new Date(s.date) <= today);
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.exercises.some((ex) =>
            ex.exercise?.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [allSessions, searchQuery]);

  const { deleteSession, isLoading: isDeleting } = useDeleteTrainingSession();

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette séance ?"))
      return;
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalVolume = sessions.reduce(
      (acc, s) => acc + calculateTotalVolume(s),
      0
    );
    const totalReps = sessions.reduce(
      (acc, s) => acc + calculateTotalReps(s),
      0
    );
    const totalDuration = sessions.reduce(
      (acc, s) => acc + (s.durationMinutes || 0),
      0
    );

    // This month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthSessions = sessions.filter(
      (s) => new Date(s.date) >= thisMonth
    );
    const monthlyVolume = thisMonthSessions.reduce(
      (acc, s) => acc + calculateTotalVolume(s),
      0
    );

    // This week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekSessions = sessions.filter(
      (s) => new Date(s.date) >= startOfWeek
    );

    // Streak calculation
    let streak = 0;
    const sortedDates = [
      ...new Set(sessions.map((s) => new Date(s.date).toDateString())),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length > 0) {
      const todayStr = new Date().toDateString();
      const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

      if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
        streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const diffDays = Math.round(
            (prevDate.getTime() - currDate.getTime()) / 86400000
          );
          if (diffDays === 1) streak++;
          else break;
        }
      }
    }

    // Most used exercises
    const exerciseCounts: Record<string, { name: string; count: number }> = {};
    sessions.forEach((s) => {
      s.exercises.forEach((ex) => {
        const name = ex.exercise?.name || "Inconnu";
        if (!exerciseCounts[name]) exerciseCounts[name] = { name, count: 0 };
        exerciseCounts[name].count++;
      });
    });
    const topExercises = Object.values(exerciseCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSessions,
      totalVolume,
      totalReps,
      totalDuration,
      monthlyVolume,
      thisMonthSessions: thisMonthSessions.length,
      weekSessions: weekSessions.length,
      streak,
      topExercises,
    };
  }, [sessions]);

  // Recent sessions for overview
  const recentSessions = sessions.slice(0, 3);
  const lastSession = sessions[0];

  if (isLoading)
    return <LoadingSpinner message="Chargement de l'historique..." />;
  if (error) return <ErrorDisplay error={error} />;

  const tabs = [
    { id: "overview" as TabType, label: "Aperçu", icon: Sparkles },
    {
      id: "history" as TabType,
      label: "Historique",
      icon: CalendarDays,
      count: sessions.length,
    },
  ];

  const formatVolume = (v: number) =>
    v > 1000 ? `${(v / 1000).toFixed(1)}T` : `${v.toFixed(0)}kg`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Séances
            </h1>
            <p className="text-muted-foreground text-sm">
              Suivez vos entraînements
            </p>
          </div>
        </div>
        <Link to="/dashboard/training/new">
          <Button className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle séance
          </Button>
        </Link>
      </div>

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
          {/* Left Column - Stats & Recent */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Cette semaine
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.weekSessions}
                      </p>
                      <p className="text-xs text-muted-foreground">séances</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Flame className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Ce mois
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatVolume(stats.monthlyVolume)}
                      </p>
                      <p className="text-xs text-muted-foreground">volume</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Streak
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.streak}
                      </p>
                      <p className="text-xs text-muted-foreground">jours</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-rose-500/5 to-rose-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Total
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.totalSessions}
                      </p>
                      <p className="text-xs text-muted-foreground">séances</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClipboardList className="h-5 w-5 text-rose-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Last Session Highlight */}
            {lastSession && (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                      <Dumbbell className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
                          Dernière séance
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground truncate">
                        {lastSession.notes ||
                          `Séance du ${new Date(
                            lastSession.date
                          ).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                          })}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(lastSession.date).toLocaleDateString(
                          "fr-FR",
                          { weekday: "long", day: "numeric", month: "long" }
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {lastSession.exercises.length}
                          </span>
                          <span className="text-muted-foreground">
                            exercices
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Weight className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-foreground">
                            {formatVolume(calculateTotalVolume(lastSession))}
                          </span>
                        </div>
                        {lastSession.durationMinutes && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {lastSession.durationMinutes}
                            </span>
                            <span className="text-muted-foreground">min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <Card className="border-border/50 bg-card">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Séances récentes
                    </h3>
                    <button
                      onClick={() => setActiveTab("history")}
                      className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      Tout voir
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab("history");
                          setSelectedSession(session.id);
                        }}
                      >
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex-shrink-0">
                          <span className="text-lg font-bold text-foreground leading-none">
                            {new Date(session.date).getDate()}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {new Date(session.date).toLocaleDateString(
                              "fr-FR",
                              { month: "short" }
                            )}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {session.notes || "Séance d'entraînement"}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{session.exercises.length} exercices</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">
                              {formatVolume(calculateTotalVolume(session))}
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
            {sessions.length === 0 && (
              <Card className="border-dashed border-2 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Dumbbell className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucune séance enregistrée
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm mb-6">
                    Commencez à suivre vos entraînements pour voir vos
                    statistiques et votre progression.
                  </p>
                  <Link to="/dashboard/training/new">
                    <Button className="rounded-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Première séance
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats Summary */}
          <div className="space-y-4">
            {/* Total Stats */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Statistiques totales
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Depuis le début
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Volume total
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatVolume(stats.totalVolume)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Répétitions
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {stats.totalReps.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Temps total
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {stats.totalDuration > 60
                        ? `${Math.round(stats.totalDuration / 60)}h`
                        : `${stats.totalDuration}min`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Moy. par séance
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {stats.totalSessions > 0
                        ? formatVolume(stats.totalVolume / stats.totalSessions)
                        : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Exercises */}
            {stats.topExercises.length > 0 && (
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <Flame className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Exercices favoris
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Les plus pratiqués
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {stats.topExercises.map((ex, i) => (
                      <div key={ex.name} className="flex items-center gap-3">
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                            i === 0
                              ? "bg-amber-500/20 text-amber-600"
                              : i === 1
                              ? "bg-slate-300/30 text-slate-600"
                              : i === 2
                              ? "bg-orange-500/20 text-orange-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-foreground truncate">
                          {ex.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ex.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm mb-1">
                      Prêt pour l'action ?
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Enregistrez votre séance pour suivre votre progression.
                    </p>
                    <Link to="/dashboard/training/new">
                      <Button size="sm" className="rounded-lg h-9">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Nouvelle séance
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une séance ou un exercice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-muted/30 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 border-border/50 ${
                showFilters ? "bg-muted" : ""
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtres
              {(dateFrom || dateTo) && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>

          {/* Filters Panel */}
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

          {/* Sessions List */}
          {sessions.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? "Aucun résultat" : "Aucune séance"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  {searchQuery
                    ? `Aucune séance ne correspond à "${searchQuery}"`
                    : "Commencez par enregistrer votre première séance d'entraînement"}
                </p>
                {!searchQuery && (
                  <Link to="/dashboard/training/new">
                    <Button className="rounded-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une séance
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => {
                const sessionVolume = calculateTotalVolume(session);
                const sessionReps = calculateTotalReps(session);
                const isExpanded = selectedSession === session.id;

                return (
                  <Card
                    key={session.id}
                    className="border-border/50 bg-card overflow-hidden hover:shadow-md transition-all"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Session Header */}
                    <div
                      className="p-4 cursor-pointer group"
                      onClick={() =>
                        setSelectedSession(isExpanded ? null : session.id)
                      }
                    >
                      <div className="flex items-center gap-4">
                        {/* Date Badge */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex-shrink-0">
                          <span className="text-lg font-bold text-primary leading-none">
                            {new Date(session.date).getDate()}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase mt-0.5">
                            {new Date(session.date).toLocaleDateString(
                              "fr-FR",
                              { month: "short" }
                            )}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {session.notes ||
                              `Séance du ${new Date(
                                session.date
                              ).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                              })}`}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Dumbbell className="h-3.5 w-3.5" />
                              {session.exercises.length} exercices
                            </span>
                            {session.durationMinutes && (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {session.durationMinutes} min
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                              <Weight className="h-3.5 w-3.5" />
                              {formatVolume(sessionVolume)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          >
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-4 animate-in slide-in-from-top-2 duration-200">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Dumbbell className="h-4 w-4 text-primary" />
                          Détail des exercices
                        </h4>
                        <div className="space-y-2">
                          {session.exercises.map((ex, exIndex) => {
                            const exVolume =
                              (ex.weightKg || 0) *
                              (ex.sets || 0) *
                              (ex.repsUniform ||
                                (ex.repsPerSet
                                  ? ex.repsPerSet.reduce(
                                      (a: number, b: number) => a + b,
                                      0
                                    ) / (ex.sets || 1)
                                  : 0));

                            return (
                              <div
                                key={exIndex}
                                className="bg-card rounded-lg p-3 border border-border/50"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-xs font-bold text-primary flex-shrink-0">
                                      {exIndex + 1}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-medium text-foreground truncate">
                                        {ex.exercise?.name || "Exercice"}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {ex.sets} ×{" "}
                                        {ex.repsUniform ||
                                          (ex.repsPerSet
                                            ? (ex.repsPerSet as number[]).join(
                                                ", "
                                              )
                                            : "-")}{" "}
                                        reps
                                        {ex.weightKg ? (
                                          <span className="text-emerald-600 font-medium">
                                            {" "}
                                            @ {ex.weightKg}kg
                                          </span>
                                        ) : null}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    {ex.restSeconds && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Timer className="h-3 w-3" />{" "}
                                        {ex.restSeconds}s
                                      </p>
                                    )}
                                    {exVolume > 0 && (
                                      <p className="text-sm font-semibold text-foreground">
                                        {exVolume.toFixed(0)}kg
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {ex.notes && (
                                  <p className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground flex items-start gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                    {ex.notes}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Results count */}
          {sessions.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-2">
              {sessions.length} séance{sessions.length > 1 ? "s" : ""} affichée
              {sessions.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainingHistory;
