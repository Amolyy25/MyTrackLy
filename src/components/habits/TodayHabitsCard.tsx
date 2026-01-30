import React, { useMemo } from "react";
import { useHabits, useCheckHabit, useUncheckHabit } from "../../hooks/useHabits";
import { Habit } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../pages/ui/card";
import { Button } from "../pages/ui/button";
import { Link } from "react-router-dom";
import {
  Calendar,
  Target,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  Flame,
  TrendingUp,
} from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { cn } from "../../lib/utils";
import HabitHeatmap from "./HabitHeatmap";
import { HabitLog } from "../../types";

const categoryIcons = {
  hydration: "💧",
  sleep: "😴",
  nutrition: "🥗",
  exercise: "💪",
  wellness: "🧘",
};

interface TodayHabitsCardProps {
  role?: "coach" | "eleve" | "personnel";
  studentId?: string;
  maxHabits?: number;
  collapsible?: boolean;
}

export function TodayHabitsCard({
  role = "personnel",
  studentId,
  maxHabits = 4,
  collapsible = false,
}: TodayHabitsCardProps) {
  const { showToast } = useToast();
  const { habits, isLoading, error, refetch } = useHabits(studentId);
  const { checkHabit, isLoading: isChecking } = useCheckHabit();
  const { uncheckHabit, isLoading: isUnchecking } = useUncheckHabit();

  // Filter today's habits
  const todayHabits = useMemo(() => {
    return habits.filter((habit) => {
      if (habit.targetFrequency === "DAILY") return true;
      
      const today = new Date();
      if (habit.targetFrequency === "WEEKLY") {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const hasLogThisWeek = habit.logs?.some((log) => {
          const logDate = new Date(log.completedAt);
          return logDate >= startOfWeek;
        });
        return !hasLogThisWeek;
      }

      if (habit.targetFrequency === "MONTHLY") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const hasLogThisMonth = habit.logs?.some((log) => {
          const logDate = new Date(log.completedAt);
          return logDate >= startOfMonth;
        });
        return !hasLogThisMonth;
      }
      
      return true;
    });
  }, [habits]);

  const displayedHabits = habits.slice(0, maxHabits);
  const hasMore = habits.length > maxHabits;
  const completedToday = todayHabits.filter((h) => h.completedToday).length;
  const totalToday = todayHabits.length;

  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedDate = dateFormatter.format(today);

  // Generate weekly dots data for a habit
  const getWeeklyData = (habit: Habit) => {
    const now = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const hasLog = habit.logs?.some(
        (log) =>
          new Date(log.completedAt) >= date &&
          new Date(log.completedAt) <= dateEnd
      ) || false;

      weekData.push(hasLog);
    }
    
    return weekData;
  };

  const handleCheck = async (habit: Habit) => {
    try {
      await checkHabit(habit.id);
      await refetch();
      if (habit.currentStreak !== undefined && (habit.currentStreak + 1) % 7 === 0) {
        showToast(`🔥 ${habit.currentStreak + 1} jours d'affilée !`, "success");
      }
    } catch (error) {
      console.error("Error checking habit:", error);
      showToast(
        error instanceof Error ? error.message : "Erreur",
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
        error instanceof Error ? error.message : "Erreur",
        "error"
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
          <Target className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (habits.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-2.5">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Habitudes du jour
              </CardTitle>
              <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <Target className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground">Aucune habitude</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez votre première habitude
            </p>
          </div>
          {role !== "coach" && (
            <Link to="/dashboard/habits">
              <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
                Créer une habitude
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  // Habit card component
  const HabitCard = ({ habit }: { habit: Habit }) => {
    const weeklyData = getWeeklyData(habit);
    const completedDays = weeklyData.filter(Boolean).length;
    const isCompleted = habit.completedToday || false;

    return (
      <div
        className={cn(
          "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
          isCompleted
            ? "border-emerald-500/50 bg-emerald-500/10"
            : "border-border/50 bg-muted/30 hover:border-border"
        )}
      >
        {/* Category Icon */}
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0",
            isCompleted
              ? "bg-emerald-500/20"
              : "bg-muted"
          )}
        >
          <span className="text-xl">{categoryIcons[habit.category]}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium truncate mb-1.5",
            isCompleted ? "text-foreground" : "text-muted-foreground"
          )}>
            {habit.name}
          </p>
          
          {/* Stats & Weekly dots */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              {weeklyData.map((completed, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    completed
                      ? "bg-emerald-500"
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">
                {completedDays}/7j
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-500">
                <Flame className="h-3 w-3 fill-orange-500" />
                <span>{habit.currentStreak}j</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-500">
                <TrendingUp className="h-3 w-3" />
                <span>{Math.round((habit.logs?.length || 0) / Math.max(1, (new Date().getTime() - new Date(habit.startDate).getTime()) / (1000 * 60 * 60 * 24)) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <button
          onClick={() => isCompleted ? handleUncheck(habit) : handleCheck(habit)}
          disabled={isChecking || isUnchecking || role === "coach"}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all flex-shrink-0",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "active:scale-95",
            isCompleted
              ? "bg-emerald-500 text-white"
              : "border-2 border-muted-foreground/30 hover:border-emerald-500/50"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/50" />
          )}
        </button>
      </div>
    );
  };

  return (
    <Card className="border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-2.5">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Habitudes du jour
              </CardTitle>
              <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
            </div>
          </div>
          
          {/* Progress badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-500">
              {completedToday}/{totalToday}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-5">
        {/* Heatmap Section */}
        <div className="mb-6 p-4 bg-muted/20 rounded-2xl border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Activité des 12 derniers mois
            </h4>
            <div className="text-xs text-muted-foreground">
              {habits.length} habitudes suivies
            </div>
          </div>
          <HabitHeatmap logs={habits.flatMap(h => h.logs || [])} />
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {displayedHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>

        {/* View more link */}
        {habits.length > 0 && (
          <Link to="/dashboard/habits" className="block">
            <Button 
              variant="ghost" 
              className="w-full rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50" 
              size="sm"
            >
              {hasMore 
                ? `Voir ${habits.length - maxHabits} habitude${habits.length - maxHabits > 1 ? 's' : ''} de plus`
                : "Gérer mes habitudes"
              }
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
