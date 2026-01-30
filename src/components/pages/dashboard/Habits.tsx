import React, { useState, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useCheckHabit,
  useUncheckHabit,
} from "../../../hooks/useHabits";
import { Habit } from "../../../types";
import { HabitCheckbox } from "../../habits/HabitCheckbox";
import { StreakBadge } from "../../habits/StreakBadge";
import { WeeklyHeatmap } from "../../habits/WeeklyHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Plus,
  Edit2,
  Trash2,
  Flame,
  Calendar,
  Target,
  Loader2,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  BarChart3,
  Clock,
  ChevronRight,
  TrendingUp,
  Trophy,
  Droplet,
  Moon,
  Apple,
  Dumbbell,
  Heart,
} from "lucide-react";
import LoadingSpinner from "../../composants/LoadingSpinner";
import ErrorDisplay from "../../composants/ErrorDisplay";
import API_URL from "../../../config/api";

const categoryIcons = {
  hydration: "💧",
  sleep: "😴",
  nutrition: "🥗",
  exercise: "💪",
  wellness: "🧘",
};

const categoryLabels = {
  hydration: "Hydratation",
  sleep: "Sommeil",
  nutrition: "Nutrition",
  exercise: "Exercice",
  wellness: "Bien-être",
};

const categoryIconsLucide = {
  hydration: Droplet,
  sleep: Moon,
  nutrition: Apple,
  exercise: Dumbbell,
  wellness: Heart,
};

type TabType = "overview" | "allHabits" | "streaks";

const Habits: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [students, setStudents] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const { habits, isLoading, error, refetch } = useHabits(
    selectedStudentId || undefined
  );
  const { createHabit, isLoading: isCreating } = useCreateHabit();
  const { updateHabit, isLoading: isUpdating } = useUpdateHabit();
  const { deleteHabit, isLoading: isDeleting } = useDeleteHabit();
  const { checkHabit, isLoading: isChecking } = useCheckHabit();
  const { uncheckHabit, isLoading: isUnchecking } = useUncheckHabit();

  const isCoach = user?.role === "coach";
  const isViewingStudent = isCoach && selectedStudentId !== null;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "hydration" as Habit["category"],
    targetFrequency: "daily" as Habit["targetFrequency"],
    targetCount: "",
    reminderTime: "",
    reminderEnabled: true,
    startDate: new Date().toISOString().split("T")[0],
  });

  // Fetch students for coach
  React.useEffect(() => {
    if (isCoach) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem("token");
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
      fetchStudents();
    }
  }, [isCoach]);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (editingHabit) {
      setFormData({
        name: editingHabit.name,
        category: editingHabit.category,
        targetFrequency: editingHabit.targetFrequency,
        targetCount: editingHabit.targetCount?.toString() || "",
        reminderTime: editingHabit.reminderTime || "",
        reminderEnabled: editingHabit.reminderEnabled,
        startDate: new Date(editingHabit.startDate).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        name: "",
        category: "hydration",
        targetFrequency: "daily",
        targetCount: "",
        reminderTime: "",
        reminderEnabled: true,
        startDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [editingHabit, showForm]);

  // Filter today's habits
  const todayHabits = useMemo(() => {
    return habits.filter((habit) => {
      if (habit.targetFrequency === "daily") return true;

      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const hasLogThisWeek = habit.logs?.some((log) => {
        const logDate = new Date(log.completedAt);
        return logDate >= startOfWeek;
      });

      return !hasLogThisWeek;
    });
  }, [habits]);

  const completedToday = todayHabits.filter((h) => h.completedToday).length;
  const totalToday = todayHabits.length;
  const completionPercentage =
    totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Calculate overall stats
  const totalStreak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
  const bestStreak = Math.max(...habits.map((h) => h.bestStreak || 0), 0);
  const weeklyCompletionRate = useMemo(() => {
    if (habits.length === 0) return 0;
    let totalDays = 0;
    let completedDays = 0;

    habits.forEach((habit) => {
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        totalDays++;
        const hasLog = habit.logs?.some(
          (log) =>
            new Date(log.completedAt) >= date &&
            new Date(log.completedAt) <= dateEnd
        );
        if (hasLog) completedDays++;
      }
    });

    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  }, [habits]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const data = {
        name: formData.name.trim(),
        category: formData.category,
        targetFrequency: formData.targetFrequency,
        targetCount: formData.targetCount
          ? parseFloat(formData.targetCount)
          : undefined,
        reminderTime: formData.reminderTime || undefined,
        reminderEnabled: formData.reminderEnabled,
        startDate: formData.startDate,
      };

      if (editingHabit) {
        await updateHabit(editingHabit.id, data);
        showToast("Habitude modifiée avec succès !", "success");
      } else {
        await createHabit(data);
        showToast("Habitude créée avec succès !", "success");
      }
      setShowForm(false);
      setEditingHabit(null);
      await refetch();
    } catch (error) {
      console.error("Error saving habit:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement",
        "error"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette habitude ?"))
      return;
    try {
      await deleteHabit(id);
      showToast("Habitude supprimée avec succès !", "success");
      await refetch();
    } catch (error) {
      console.error("Error deleting habit:", error);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleCheck = async (habit: Habit) => {
    try {
      await checkHabit(habit.id);
      await refetch();
      if (habit.streak !== undefined && (habit.streak + 1) % 7 === 0) {
        showToast(
          `🔥 ${habit.streak + 1} jours d'affilée ! Continuez comme ça !`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error checking habit:", error);
      showToast(
        error instanceof Error ? error.message : "Erreur lors de la complétion",
        "error"
      );
    }
  };

  const handleUncheck = async (habit: Habit) => {
    try {
      await uncheckHabit(habit.id);
      await refetch();
    } catch (error) {
      console.error("Error unchecking habit:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Erreur lors de la décomplétion",
        "error"
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  // Generate heatmap data for a habit
  const getHeatmapData = (habit: Habit) => {
    const now = new Date();
    const heatmapData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const hasLog =
        habit.logs?.some(
          (log) =>
            new Date(log.completedAt) >= date &&
            new Date(log.completedAt) <= dateEnd
        ) || false;

      heatmapData.push({
        date: date.toISOString().split("T")[0],
        completed: hasLog,
      });
    }

    return heatmapData;
  };

  if (isLoading)
    return <LoadingSpinner message="Chargement des habitudes..." />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedDate = dateFormatter.format(today);

  const tabs = [
    { id: "overview" as TabType, label: "Aperçu", icon: Sparkles },
    {
      id: "allHabits" as TabType,
      label: "Habitudes",
      icon: Target,
      count: habits.length,
    },
    { id: "streaks" as TabType, label: "Statistiques", icon: BarChart3 },
  ];

  // Stat card component
  const StatCard = ({
    label,
    value,
    unit,
    icon: Icon,
    color,
    subLabel,
  }: {
    label: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    color: string;
    subLabel?: string;
  }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
        {subLabel && (
          <p className="text-xs text-muted-foreground">{subLabel}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Habitudes
            </h1>
            <p className="text-muted-foreground text-sm">
              Suivez vos habitudes quotidiennes
            </p>
          </div>
        </div>

        {!isViewingStudent && (
          <Button
            onClick={() => {
              setEditingHabit(null);
              setShowForm(true);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl h-11 px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle habitude
          </Button>
        )}
      </div>

      {/* Coach Student Selector */}
      {isCoach && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <select
                value={selectedStudentId || ""}
                onChange={(e) => setSelectedStudentId(e.target.value || null)}
                className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Mes habitudes</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-full sm:w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
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

      {/* Tab Content: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Today's Habits */}
          <div className="lg:col-span-2 space-y-4">
            {/* Today's Progress */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="capitalize">{formattedDate}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {completedToday}/{totalToday} habitudes complétées
                    </p>
                  </div>
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${
                          (completionPercentage / 100) * 175.9
                        } 175.9`}
                        className="text-emerald-500 transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-foreground">
                        {Math.round(completionPercentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayHabits.length > 0 ? (
                  todayHabits.map((habit, index) => (
                    <div
                      key={habit.id}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <HabitCheckbox
                        checked={habit.completedToday || false}
                        onCheckedChange={(checked) =>
                          checked ? handleCheck(habit) : handleUncheck(habit)
                        }
                        disabled={
                          isChecking || isUnchecking || isViewingStudent
                        }
                        showConfetti={
                          habit.streak !== undefined &&
                          (habit.streak + 1) % 7 === 0
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {categoryIcons[habit.category]}
                          </span>
                          <h3
                            className={`font-semibold transition-colors ${
                              habit.completedToday
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {habit.name}
                          </h3>
                          {habit.targetCount && (
                            <span className="text-sm text-muted-foreground">
                              ({habit.targetCount})
                            </span>
                          )}
                        </div>
                        {habit.streak !== undefined && habit.streak > 0 && (
                          <div className="mt-1">
                            <StreakBadge
                              currentStreak={habit.streak}
                              bestStreak={habit.bestStreak}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                      {!isViewingStudent && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingHabit(habit);
                              setShowForm(true);
                            }}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(habit.id)}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="font-medium text-foreground">
                      Tout est complété !
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Revenez demain pour vos nouvelles habitudes
                    </p>
                  </div>
                )}

                {todayHabits.length > 0 && (
                  <button
                    onClick={() => setActiveTab("allHabits")}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Voir toutes les habitudes
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveTab("streaks")}
                className="flex-1 flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      Voir les streaks
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vos séries en cours
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                onClick={() => setActiveTab("allHabits")}
                className="flex-1 flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 hover:border-border transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      Toutes les habitudes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {habits.length} habitudes
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="space-y-3">
              <StatCard
                label="Streaks actifs"
                value={totalStreak}
                unit="jours"
                icon={Flame}
                color="bg-orange-500/10 text-orange-500"
              />
              <StatCard
                label="Taux de complétion"
                value={weeklyCompletionRate}
                unit="%"
                icon={TrendingUp}
                color="bg-emerald-500/10 text-emerald-500"
                subLabel="Cette semaine"
              />
              {bestStreak > 0 && (
                <StatCard
                  label="Meilleur streak"
                  value={bestStreak}
                  unit="jours"
                  icon={Trophy}
                  color="bg-amber-500/10 text-amber-500"
                />
              )}
            </div>

            {/* Tips Card */}
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
                      Complétez vos habitudes tôt dans la journée pour maintenir
                      vos streaks et rester motivé !
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content: All Habits */}
      {activeTab === "allHabits" && (
        <div className="space-y-4">
          {habits.length === 0 ? (
            <Card className="border-dashed border-2 border-border bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucune habitude
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  {isViewingStudent
                    ? "Cet élève n'a pas encore d'habitudes."
                    : "Créez votre première habitude pour commencer à suivre vos progrès !"}
                </p>
                {!isViewingStudent && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une habitude
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {habits.map((habit, index) => (
                <Card
                  key={habit.id}
                  className="border-border/50 bg-card hover:bg-muted/30 transition-all group overflow-hidden"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            habit.completedToday
                              ? "bg-emerald-500/10"
                              : "bg-muted"
                          }`}
                        >
                          <span className="text-2xl">
                            {categoryIcons[habit.category]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {habit.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {categoryLabels[habit.category]} •{" "}
                            {habit.targetFrequency === "daily"
                              ? "Quotidienne"
                              : "Hebdomadaire"}
                          </p>
                        </div>
                      </div>
                      {!isViewingStudent && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingHabit(habit);
                              setShowForm(true);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(habit.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {habit.streak !== undefined && (
                      <div className="mb-4">
                        <StreakBadge
                          currentStreak={habit.streak}
                          bestStreak={habit.bestStreak}
                          showBest
                        />
                      </div>
                    )}

                    <WeeklyHeatmap data={getHeatmapData(habit)} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Streaks */}
      {activeTab === "streaks" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total habitudes"
              value={habits.length}
              icon={Target}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              label="Complétées aujourd'hui"
              value={`${completedToday}/${totalToday}`}
              icon={CheckCircle2}
              color="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              label="Taux hebdomadaire"
              value={weeklyCompletionRate}
              unit="%"
              icon={TrendingUp}
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              label="Meilleur streak"
              value={bestStreak}
              unit="jours"
              icon={Trophy}
              color="bg-amber-500/10 text-amber-500"
            />
          </div>

          {/* Streaks List */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-orange-500" />
                Détails des streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {habits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune habitude pour afficher les statistiques
                </div>
              ) : (
                <div className="space-y-3">
                  {habits
                    .sort((a, b) => (b.streak || 0) - (a.streak || 0))
                    .map((habit, index) => (
                      <div
                        key={habit.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold text-muted-foreground">
                          {index + 1}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                          <span className="text-lg">
                            {categoryIcons[habit.category]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {habit.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Créée le{" "}
                            {new Date(habit.startDate).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                        <StreakBadge
                          currentStreak={habit.streak || 0}
                          bestStreak={habit.bestStreak}
                          showBest
                          size="md"
                        />
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal */}
          <Card className="relative w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 rounded-t-2xl sm:rounded-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {editingHabit ? "Modifier l'habitude" : "Nouvelle habitude"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {editingHabit
                      ? "Modifiez les détails"
                      : "Créez une nouvelle habitude"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleFormSubmit}
              className="overflow-y-auto max-h-[calc(90vh-160px)] sm:max-h-[calc(85vh-160px)]"
            >
              <div className="p-6 space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nom de l'habitude *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Boire 2L d'eau"
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Catégorie *</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(categoryIcons).map(([key, icon]) => {
                      const isSelected = formData.category === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              category: key as Habit["category"],
                            })
                          }
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          <span className="text-xl">{icon}</span>
                          <span className="text-[10px] font-medium truncate w-full text-center">
                            {categoryLabels[key as keyof typeof categoryLabels]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fréquence *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: "daily",
                        label: "Quotidienne",
                        desc: "Tous les jours",
                      },
                      {
                        value: "weekly",
                        label: "Hebdomadaire",
                        desc: "Une fois par semaine",
                      },
                    ].map((freq) => {
                      const isSelected =
                        formData.targetFrequency === freq.value;
                      return (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              targetFrequency:
                                freq.value as Habit["targetFrequency"],
                            })
                          }
                          className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-muted/30 hover:border-primary/50"
                          }`}
                        >
                          <span
                            className={`font-medium ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {freq.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {freq.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Count */}
                <div className="space-y-2">
                  <Label htmlFor="targetCount" className="text-sm font-medium">
                    Quantité cible (optionnel)
                  </Label>
                  <Input
                    id="targetCount"
                    type="number"
                    step="0.1"
                    value={formData.targetCount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetCount: e.target.value })
                    }
                    placeholder="Ex: 2 (pour 2L)"
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Date de début
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex gap-3 p-4 border-t border-border bg-card/95 backdrop-blur-sm">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isCreating || isUpdating}
                  className="flex-1 h-12 rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating || !formData.name.trim()}
                  className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingHabit ? "Modification..." : "Création..."}
                    </>
                  ) : editingHabit ? (
                    "Modifier"
                  ) : (
                    "Créer"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Habits;
