import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  useTrainingStats,
  useTrainingSessions,
} from "../../../hooks/useTrainingSessions";
import { useMeasurements } from "../../../hooks/useMeasurements";
import { calculateTotalVolume } from "../../../utils/trainingCalculations";
import LoadingSpinner from "../../composants/LoadingSpinner";
import ErrorDisplay from "../../composants/ErrorDisplay";

// New Dashboard Components
import { HeroSection } from "../dashboard-new/hero-section";
import { StatsCards } from "../dashboard-new/stats-cards";
import {
  RecentActivity,
  ActivitySession,
} from "../dashboard-new/recent-activity";
import {
  Measurements,
  WeightPoint,
  MeasurementItem,
} from "../dashboard-new/measurements";
import { StatisticsCard } from "../dashboard-new/statistics-card";
import { TodayHabitsCard } from "../../habits/TodayHabitsCard";
import { Ruler } from "lucide-react";

const Home: React.FC = () => {
  const { user } = useAuth();
  const {
    stats,
    isLoading: isLoadingStats,
    error: errorStats,
  } = useTrainingStats();
  const {
    sessions,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useTrainingSessions({});
  const {
    measurements: measurementsData,
    isLoading: isLoadingMeasurements,
    error: errorMeasurements,
  } = useMeasurements();

  // Loading state
  if (isLoadingStats || isLoadingSessions || isLoadingMeasurements) {
    return <LoadingSpinner />;
  }

  // Error state
  if (errorStats || errorSessions || errorMeasurements) {
    return (
      <ErrorDisplay
        error={
          errorStats ||
          errorSessions ||
          errorMeasurements ||
          "Une erreur est survenue"
        }
      />
    );
  }

  // --- Data Transformation ---

  // 1. Stats Cards Data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const sessionsThisMonth = sessions.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const totalVolumeStr = stats?.totalVolume
    ? stats.totalVolume > 1000
      ? `${(stats.totalVolume / 1000).toFixed(1)}T`
      : `${stats.totalVolume.toFixed(0)}kg`
    : "0kg";

  // Calculer l'activité de la semaine
  const today = new Date();
  const weekActivity = Array(7).fill(false);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i)); // Du lundi au dimanche
    const dateStr = date.toISOString().split("T")[0];

    weekActivity[i] = sessions.some((s) => {
      const sessionDate = new Date(s.date).toISOString().split("T")[0];
      return sessionDate === dateStr;
    });
  }

  const statsData = {
    sessionsThisMonth,
    totalVolume: totalVolumeStr,
    streakDays: stats?.currentStreak || 0,
    weekActivity,
  };

  // 2. Recent Activity Data
  const recentSessionsData: ActivitySession[] = sessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((session) => ({
      id: session.id,
      date: new Date(session.date).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      name: session.notes || "Séance d'entraînement",
      exercises: session.exercises.length,
      duration: session.durationMinutes
        ? `${session.durationMinutes} min`
        : "-",
      volume: `${Math.round(calculateTotalVolume(session))} kg`,
      status: "completed" as const,
      type: "training" as const,
    }));

  // 3. Measurements Data
  const sortedMeasurements = [...measurementsData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const weightDataPoints: WeightPoint[] = sortedMeasurements
    .filter((m) => m.bodyWeightKg)
    .slice(0, 7)
    .reverse()
    .map((m) => ({
      day: new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric" }),
      weight: m.bodyWeightKg || 0,
    }));

  const latestMeasurement = sortedMeasurements[0];
  const currentWeight = latestMeasurement?.bodyWeightKg || 0;
  const previousWeight = sortedMeasurements[1]?.bodyWeightKg || currentWeight;
  const weightChange = parseFloat((currentWeight - previousWeight).toFixed(1));

  const measurementItems: MeasurementItem[] = [];
  if (latestMeasurement) {
    if (latestMeasurement.waistCm) {
      measurementItems.push({
        label: "Tour de taille",
        value: `${latestMeasurement.waistCm} cm`,
        change: "0 cm",
        positive: true,
        icon: Ruler,
      });
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HeroSection
        userName={user?.name || "Athlète"}
        sessionsThisMonth={sessionsThisMonth}
        role="personnel"
      />

      <StatsCards stats={statsData} role="personnel" />

      <div className="px-4 lg:px-8">
        <StatisticsCard
          sessions={sessions}
          measurements={measurementsData}
          role="personnel"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 px-4 lg:px-8">
        <div className="lg:col-span-2">
          <RecentActivity sessions={recentSessionsData} role="personnel" />
        </div>
        <div>
          <Measurements
            weightData={weightDataPoints}
            measurements={measurementItems}
            currentWeight={currentWeight}
            weightChange={weightChange}
            role="personnel"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 px-4 lg:px-8">
        <div className="lg:col-span-2">
          <TodayHabitsCard role="personnel" maxHabits={4} />
        </div>
      </div>
    </div>
  );
};

export default Home;
