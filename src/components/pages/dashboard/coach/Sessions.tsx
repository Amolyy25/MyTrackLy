import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import API_URL from "../../../../config/api";
import { useToast } from "../../../../contexts/ToastContext";
import {
  useCoachStudentsSessions,
  useAddCoachComment,
} from "../../../../hooks/useTrainingSessions";
import { calculateTotalVolume, calculateTotalReps } from "../../../../utils/trainingCalculations";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  Dumbbell,
  Calendar,
  Clock,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  User,
  Weight,
  Repeat,
  Timer,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  StickyNote,
  Sparkles,
  Flame,
  Target,
  ClipboardList,
  BarChart3,
  CalendarDays,
  Users,
  RotateCcw,
} from "lucide-react";

type TabType = "overview" | "history";

const Sessions: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [commentingSession, setCommentingSession] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { sessions: allSessions, isLoading, error, refetch } = useCoachStudentsSessions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { addComment, isLoading: isAddingComment } = useAddCoachComment();

  const [students, setStudents] = useState<Array<{ id: string; name: string; email: string }>>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_URL}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des élèves:", err);
      }
    };
    if (token) fetchStudents();
  }, [token]);

  // Filter sessions
  const sessions = useMemo(() => {
    let filtered = allSessions;
    if (selectedStudentId) {
      filtered = filtered.filter((s) => s.user?.id === selectedStudentId);
    }
    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.exercises.some(ex => ex.exercise?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allSessions, selectedStudentId, searchQuery]);

  const handleAddComment = async (sessionId: string) => {
    if (!comment.trim()) {
      showToast("Le commentaire ne peut pas être vide", "error");
      return;
    }
    try {
      await addComment(sessionId, comment.trim());
      showToast("Commentaire ajouté avec succès !", "success");
      setComment("");
      setCommentingSession(null);
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'ajout", "error");
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalVolume = sessions.reduce((acc, s) => acc + calculateTotalVolume(s), 0);
    const totalReps = sessions.reduce((acc, s) => acc + calculateTotalReps(s), 0);
    const totalDuration = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const uniqueStudents = new Set(sessions.map(s => s.user?.id)).size;
    const commentedSessions = sessions.filter(s => s.coachComment).length;

    // This week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekSessions = sessions.filter(s => new Date(s.date) >= startOfWeek);

    // This month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthSessions = sessions.filter(s => new Date(s.date) >= thisMonth);
    const monthlyVolume = thisMonthSessions.reduce((acc, s) => acc + calculateTotalVolume(s), 0);

    // Top students by sessions
    const studentCounts: Record<string, { name: string; count: number; volume: number }> = {};
    sessions.forEach(s => {
      const id = s.user?.id || "unknown";
      const name = s.user?.name || "Inconnu";
      if (!studentCounts[id]) studentCounts[id] = { name, count: 0, volume: 0 };
      studentCounts[id].count++;
      studentCounts[id].volume += calculateTotalVolume(s);
    });
    const topStudents = Object.values(studentCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    // Most used exercises
    const exerciseCounts: Record<string, { name: string; count: number }> = {};
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        const name = ex.exercise?.name || "Inconnu";
        if (!exerciseCounts[name]) exerciseCounts[name] = { name, count: 0 };
        exerciseCounts[name].count++;
      });
    });
    const topExercises = Object.values(exerciseCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      totalSessions,
      totalVolume,
      totalReps,
      totalDuration,
      uniqueStudents,
      commentedSessions,
      weekSessions: weekSessions.length,
      thisMonthSessions: thisMonthSessions.length,
      monthlyVolume,
      topStudents,
      topExercises,
    };
  }, [sessions]);

  const recentSessions = sessions.slice(0, 3);
  const lastSession = sessions[0];

  const formatVolume = (v: number) => v > 1000 ? `${(v / 1000).toFixed(1)}T` : `${v.toFixed(0)}kg`;

  const tabs = [
    { id: "overview" as TabType, label: "Aperçu", icon: Sparkles },
    { id: "history" as TabType, label: "Historique", icon: CalendarDays, count: sessions.length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des séances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 shadow-sm">
            <Dumbbell className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Séances des élèves</h1>
            <p className="text-muted-foreground text-sm">Suivez et commentez les entraînements</p>
          </div>
        </div>
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
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
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
                      <p className="text-xs text-muted-foreground font-medium">Cette semaine</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats.weekSessions}</p>
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
                      <p className="text-xs text-muted-foreground font-medium">Ce mois</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{formatVolume(stats.monthlyVolume)}</p>
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
                      <p className="text-xs text-muted-foreground font-medium">Élèves actifs</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats.uniqueStudents}</p>
                      <p className="text-xs text-muted-foreground">ce mois</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 to-violet-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Commentées</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats.commentedSessions}</p>
                      <p className="text-xs text-muted-foreground">séances</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-5 w-5 text-violet-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Last Session Highlight */}
            {lastSession && (
              <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-background to-emerald-500/5 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-emerald-500/20 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-xl">
                        {lastSession.user?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-500/10">
                          Dernière séance
                        </span>
                        {lastSession.coachComment && (
                          <span className="flex items-center gap-1 text-xs text-primary px-2 py-0.5 rounded-full bg-primary/10">
                            <CheckCircle2 className="h-3 w-3" />
                            Commentée
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground truncate">
                        {lastSession.user?.name || "Élève"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(lastSession.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{lastSession.exercises.length}</span>
                          <span className="text-muted-foreground">exercices</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Weight className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-foreground">{formatVolume(calculateTotalVolume(lastSession))}</span>
                        </div>
                        {lastSession.durationMinutes && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{lastSession.durationMinutes}</span>
                            <span className="text-muted-foreground">min</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg gap-1.5 flex-shrink-0"
                      onClick={() => {
                        setActiveTab("history");
                        setExpandedSession(lastSession.id);
                      }}
                    >
                      Voir
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
                          setExpandedSession(session.id);
                        }}
                      >
                        <Avatar className="h-10 w-10 border border-border/50">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white font-bold text-sm">
                            {session.user?.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">{session.user?.name || "Élève"}</p>
                            {session.coachComment && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
                            <span>{new Date(session.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                            <span>•</span>
                            <span>{session.exercises.length} exercices</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">{formatVolume(calculateTotalVolume(session))}</span>
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
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Dumbbell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Aucune séance</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Vos élèves n'ont pas encore enregistré de séance d'entraînement.
                  </p>
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
                    <p className="font-semibold text-foreground">Statistiques totales</p>
                    <p className="text-xs text-muted-foreground">Depuis le début</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Séances</span>
                    <span className="text-sm font-bold text-foreground">{stats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Volume total</span>
                    <span className="text-sm font-bold text-foreground">{formatVolume(stats.totalVolume)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Répétitions</span>
                    <span className="text-sm font-bold text-foreground">{stats.totalReps.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Temps total</span>
                    <span className="text-sm font-bold text-foreground">
                      {stats.totalDuration > 60 ? `${Math.round(stats.totalDuration / 60)}h` : `${stats.totalDuration}min`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Students */}
            {stats.topStudents.length > 0 && (
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <Users className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Élèves les plus actifs</p>
                      <p className="text-xs text-muted-foreground">Par nombre de séances</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {stats.topStudents.map((student, i) => (
                      <div key={student.name} className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                          i === 0 ? "bg-amber-500/20 text-amber-600" :
                          i === 1 ? "bg-slate-300/30 text-slate-600" :
                          i === 2 ? "bg-orange-500/20 text-orange-600" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-foreground truncate">{student.name}</span>
                        <span className="text-xs text-muted-foreground">{student.count} séances</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Exercises */}
            {stats.topExercises.length > 0 && (
              <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Flame className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Exercices populaires</p>
                      <p className="text-xs text-muted-foreground">Les plus pratiqués</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {stats.topExercises.map((ex, i) => (
                      <div key={ex.name} className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                          i === 0 ? "bg-emerald-500/20 text-emerald-600" :
                          i === 1 ? "bg-teal-500/20 text-teal-600" :
                          i === 2 ? "bg-cyan-500/20 text-cyan-600" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-foreground truncate">{ex.name}</span>
                        <span className="text-xs text-muted-foreground">{ex.count}x</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm mb-1">Conseil coach</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Commentez régulièrement les séances de vos élèves pour les motiver et les aider à progresser !
                    </p>
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
                placeholder="Rechercher un élève ou exercice..."
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
            <select
              value={selectedStudentId || ""}
              onChange={(e) => setSelectedStudentId(e.target.value || null)}
              className="h-11 px-4 bg-muted/30 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[160px]"
            >
              <option value="">Tous les élèves</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 border-border/50 h-11 ${showFilters ? "bg-muted" : ""}`}
            >
              <Filter className="h-4 w-4" />
              Dates
              {(dateFrom || dateTo) && <span className="w-2 h-2 rounded-full bg-primary" />}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="border-border/50 bg-muted/20 animate-in slide-in-from-top-2 duration-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Du</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Au</label>
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
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
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
                  {searchQuery || selectedStudentId ? "Aucun résultat" : "Aucune séance"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {searchQuery || selectedStudentId
                    ? "Essayez de modifier vos filtres"
                    : "Vos élèves n'ont pas encore enregistré de séance"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => {
                const sessionVolume = calculateTotalVolume(session);
                const isExpanded = expandedSession === session.id;
                const isCommenting = commentingSession === session.id;

                return (
                  <Card
                    key={session.id}
                    className="border-border/50 bg-card overflow-hidden hover:shadow-md transition-all"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Session Header */}
                    <div className="p-4 cursor-pointer group" onClick={() => setExpandedSession(isExpanded ? null : session.id)}>
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white font-bold">
                            {session.user?.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {session.user?.name || "Élève"}
                            </h3>
                            {session.coachComment && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                Commentée
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Dumbbell className="h-3.5 w-3.5" />
                              {session.exercises.length} exos
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
                            variant="outline"
                            size="sm"
                            className="rounded-lg gap-1.5 h-9 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCommentingSession(isCommenting ? null : session.id);
                              setComment(session.coachComment || "");
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            {session.coachComment ? "Modifier" : "Commenter"}
                          </Button>
                          <div className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {session.notes && !isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                          <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground italic">"{session.notes}"</p>
                        </div>
                      </div>
                    )}

                    {/* Coach Comment (when not editing) */}
                    {session.coachComment && !isExpanded && !isCommenting && (
                      <div className="px-4 pb-4">
                        <div className="p-4 bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Votre commentaire</span>
                          </div>
                          <p className="text-sm text-foreground">{session.coachComment}</p>
                        </div>
                      </div>
                    )}

                    {/* Comment Form */}
                    {isCommenting && (
                      <div className="p-4 bg-muted/30 border-t border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {session.coachComment ? "Modifier votre commentaire" : "Ajouter un commentaire"}
                          </span>
                        </div>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none transition-all"
                          placeholder="Bravo pour cette séance ! Pense à..."
                        />
                        <div className="flex items-center gap-2 mt-3">
                          <Button className="rounded-xl gap-2" onClick={() => handleAddComment(session.id)} disabled={isAddingComment}>
                            {isAddingComment ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Envoyer
                          </Button>
                          <Button variant="outline" className="rounded-xl" onClick={() => { setCommentingSession(null); setComment(""); }}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Session Notes */}
                        {session.notes && (
                          <div className="mb-4 flex items-start gap-2 p-3 bg-background rounded-xl border border-border/50">
                            <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground italic">"{session.notes}"</p>
                          </div>
                        )}

                        {/* Coach Comment */}
                        {session.coachComment && !isCommenting && (
                          <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <span className="text-sm font-semibold text-primary">Votre commentaire</span>
                            </div>
                            <p className="text-sm text-foreground">{session.coachComment}</p>
                          </div>
                        )}

                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Dumbbell className="h-4 w-4 text-primary" />
                          Détail des exercices
                        </h4>
                        <div className="space-y-2">
                          {session.exercises.map((ex, exIndex) => {
                            const exVolume = (ex.weightKg || 0) * (ex.sets || 0) * (ex.repsUniform || (ex.repsPerSet ? (ex.repsPerSet as number[]).reduce((a, b) => a + b, 0) / (ex.sets || 1) : 0));

                            return (
                              <div key={exIndex} className="bg-card rounded-lg p-3 border border-border/50">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-xs font-bold text-primary flex-shrink-0">
                                      {exIndex + 1}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-medium text-foreground truncate">{ex.exercise?.name || "Exercice"}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {ex.sets} × {ex.repsUniform || (ex.repsPerSet ? (ex.repsPerSet as number[]).join(", ") : "-")} reps
                                        {ex.weightKg && ex.weightKg > 0 && <span className="text-emerald-600 font-medium"> @ {ex.weightKg}kg</span>}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    {ex.restSeconds && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Timer className="h-3 w-3" /> {ex.restSeconds}s
                                      </p>
                                    )}
                                    {exVolume > 0 && <p className="text-sm font-semibold text-foreground">{exVolume.toFixed(0)}kg</p>}
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

                        {/* Comment button if not already commenting */}
                        {!isCommenting && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <Button
                              variant="outline"
                              className="rounded-xl gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCommentingSession(session.id);
                                setComment(session.coachComment || "");
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                              {session.coachComment ? "Modifier le commentaire" : "Ajouter un commentaire"}
                            </Button>
                          </div>
                        )}
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
              {sessions.length} séance{sessions.length > 1 ? "s" : ""} affichée{sessions.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Sessions;
