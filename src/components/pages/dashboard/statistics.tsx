import React, { useState, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  useTrainingSessions,
  useTrainingStats,
} from "../../../hooks/useTrainingSessions";
import { useMeasurements } from "../../../hooks/useMeasurements";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Plus,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  Check,
  Eye,
  EyeOff,
  Activity,
  Ruler,
  Heart,
  Zap,
  Award,
} from "lucide-react";
import LoadingSpinner from "../../composants/LoadingSpinner";
import ErrorDisplay from "../../composants/ErrorDisplay";
import { Link } from "react-router-dom";

type TabType = "overview" | "charts" | "body";

// Couleurs des graphiques
const CHART_COLORS = {
  primary: "hsl(262, 83%, 58%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  info: "hsl(199, 89%, 48%)",
  danger: "hsl(0, 84%, 60%)",
  purple: "hsl(280, 70%, 55%)",
  pink: "hsl(340, 80%, 60%)",
  teal: "hsl(180, 60%, 45%)",
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.teal,
  CHART_COLORS.danger,
];

// Types de métriques à tracker
const TRACKING_METRICS = [
  {
    id: "sessions",
    label: "Séances",
    unit: "",
    icon: Dumbbell,
    color: CHART_COLORS.primary,
  },
  {
    id: "volume",
    label: "Volume",
    unit: "kg",
    icon: BarChart3,
    color: CHART_COLORS.success,
  },
  {
    id: "duration",
    label: "Durée",
    unit: "min",
    icon: Clock,
    color: CHART_COLORS.warning,
  },
  {
    id: "bodyWeight",
    label: "Poids",
    unit: "kg",
    icon: Scale,
    color: CHART_COLORS.info,
  },
  {
    id: "waist",
    label: "Tour de taille",
    unit: "cm",
    icon: Ruler,
    color: CHART_COLORS.purple,
  },
  {
    id: "chest",
    label: "Poitrine",
    unit: "cm",
    icon: Heart,
    color: CHART_COLORS.pink,
  },
  {
    id: "arms",
    label: "Bras",
    unit: "cm",
    icon: Zap,
    color: CHART_COLORS.teal,
  },
];

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "sessions",
    "volume",
    "bodyWeight",
  ]);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  // Hooks pour récupérer les données
  const {
    sessions,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useTrainingSessions({});
  const {
    stats,
    isLoading: isLoadingStats,
    error: errorStats,
  } = useTrainingStats();
  const {
    measurements,
    isLoading: isLoadingMeasurements,
    error: errorMeasurements,
  } = useMeasurements();

  const isLoading =
    isLoadingSessions || isLoadingStats || isLoadingMeasurements;
  const error = errorSessions || errorStats || errorMeasurements;

  // Calcul de la date de début selon la période
  const getStartDate = (range: string) => {
    const now = new Date();
    switch (range) {
      case "7d":
        return new Date(now.setDate(now.getDate() - 7));
      case "30d":
        return new Date(now.setDate(now.getDate() - 30));
      case "90d":
        return new Date(now.setDate(now.getDate() - 90));
      case "1y":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  };

  // Filtrage des données par période
  const filteredSessions = useMemo(() => {
    const startDate = getStartDate(dateRange);
    return sessions.filter((s) => new Date(s.date) >= startDate);
  }, [sessions, dateRange]);

  const filteredMeasurements = useMemo(() => {
    const startDate = getStartDate(dateRange);
    return measurements.filter((m) => new Date(m.date) >= startDate);
  }, [measurements, dateRange]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    const dataByDate: { [key: string]: any } = {};

    filteredSessions.forEach((session) => {
      const dateKey = new Date(session.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = {
          date: dateKey,
          sessions: 0,
          volume: 0,
          duration: 0,
        };
      }
      dataByDate[dateKey].sessions += 1;
      dataByDate[dateKey].duration += session.durationMinutes || 0;

      session.exercises.forEach((ex) => {
        const reps = ex.repsUniform
          ? ex.sets * ex.repsUniform
          : ex.repsPerSet
          ? ex.repsPerSet.reduce((a, b) => a + b, 0)
          : 0;
        dataByDate[dateKey].volume += reps * (ex.weightKg || 0);
      });
    });

    filteredMeasurements.forEach((m) => {
      const dateKey = new Date(m.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = {
          date: dateKey,
          sessions: 0,
          volume: 0,
          duration: 0,
        };
      }
      if (m.bodyWeightKg) dataByDate[dateKey].bodyWeight = m.bodyWeightKg;
      if (m.waistCm) dataByDate[dateKey].waist = m.waistCm;
      if (m.chestCm) dataByDate[dateKey].chest = m.chestCm;
      if (m.leftArmCm || m.rightArmCm) {
        dataByDate[dateKey].arms =
          ((m.leftArmCm || 0) + (m.rightArmCm || 0)) / 2 ||
          m.leftArmCm ||
          m.rightArmCm;
      }
    });

    return Object.values(dataByDate).sort((a: any, b: any) => {
      const [dayA, monthA] = a.date.split("/").map(Number);
      const [dayB, monthB] = b.date.split("/").map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    });
  }, [filteredSessions, filteredMeasurements]);

  // Statistiques calculées
  const computedStats = useMemo(() => {
    const totalSessions = filteredSessions.length;
    let totalVolume = 0;
    let totalDuration = 0;
    const muscleGroups: { [key: string]: number } = {};
    const exerciseCount: { [key: string]: number } = {};

    filteredSessions.forEach((session) => {
      totalDuration += session.durationMinutes || 0;
      session.exercises.forEach((ex) => {
        const reps = ex.repsUniform
          ? ex.sets * ex.repsUniform
          : ex.repsPerSet
          ? ex.repsPerSet.reduce((a, b) => a + b, 0)
          : 0;
        totalVolume += reps * (ex.weightKg || 0);

        if (ex.exercise?.name) {
          exerciseCount[ex.exercise.name] =
            (exerciseCount[ex.exercise.name] || 0) + 1;
        }
        if (ex.exercise?.muscleGroups) {
          (ex.exercise.muscleGroups as string[]).forEach((mg) => {
            muscleGroups[mg] = (muscleGroups[mg] || 0) + 1;
          });
        }
      });
    });

    const latestMeasurement = filteredMeasurements[0];
    const previousMeasurement = filteredMeasurements[1];
    const weightChange =
      latestMeasurement?.bodyWeightKg && previousMeasurement?.bodyWeightKg
        ? latestMeasurement.bodyWeightKg - previousMeasurement.bodyWeightKg
        : null;

    const topExercises = Object.entries(exerciseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const muscleGroupsData = Object.entries(muscleGroups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    const weeklyData: { [key: string]: number } = {};
    filteredSessions.forEach((session) => {
      const date = new Date(session.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    const sessionsPerWeek = Object.entries(weeklyData)
      .map(([week, count]) => ({ week, count }))
      .slice(-8);

    return {
      totalSessions,
      totalVolume,
      totalDuration,
      avgDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
      avgVolume: totalSessions > 0 ? totalVolume / totalSessions : 0,
      currentStreak: stats?.currentStreak || 0,
      latestWeight: latestMeasurement?.bodyWeightKg,
      weightChange,
      topExercises,
      muscleGroupsData,
      sessionsPerWeek,
    };
  }, [filteredSessions, filteredMeasurements, stats]);

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl shadow-xl p-3 min-w-[140px]">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            {label}
          </p>
          {payload.map((entry: any, index: number) => {
            const metric = TRACKING_METRICS.find((m) => m.id === entry.dataKey);
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">
                  {metric?.label || entry.dataKey}:
                </span>
                <span className="font-semibold text-foreground">
                  {typeof entry.value === "number"
                    ? entry.value.toFixed(1)
                    : entry.value}{" "}
                  {metric?.unit}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((m) => m !== metricId)
        : [...prev, metricId]
    );
  };

  if (isLoading)
    return <LoadingSpinner message="Chargement des statistiques..." />;
  if (error) return <ErrorDisplay error={error} />;

  const tabs = [
    { id: "overview" as TabType, label: "Aperçu", icon: Sparkles },
    { id: "charts" as TabType, label: "Graphiques", icon: BarChart3 },
    { id: "body" as TabType, label: "Corps", icon: Activity },
  ];

  // Composant StatItem (style Measurements)
  const StatItem = ({
    label,
    value,
    unit,
    icon: Icon,
    color,
    change,
    tooltip,
  }: {
    label: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    color: string;
    change?: number | null;
    tooltip?: string;
  }) => (
    <div className="group relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 hover:border-primary/30 transition-all">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: `${color}15` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-foreground">
            {value || "—"}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
      </div>
      {change !== null && change !== undefined && (
        <div
          className={`flex items-center gap-0.5 text-sm font-medium px-2 py-1 rounded-full ${
            change > 0
              ? "bg-emerald-500/10 text-emerald-500"
              : change < 0
              ? "bg-amber-500/10 text-amber-500"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {change > 0 ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : change < 0 ? (
            <ArrowDown className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
          {Math.abs(change).toFixed(1)}
        </div>
      )}
      {tooltip && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover border border-border rounded-lg shadow-lg text-xs text-popover-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          {tooltip}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Statistiques
            </h1>
            <p className="text-muted-foreground text-sm">
              Suivez votre progression et vos performances
            </p>
          </div>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
          {(["7d", "30d", "90d", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                dateRange === range
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range === "7d"
                ? "7j"
                : range === "30d"
                ? "30j"
                : range === "90d"
                ? "3m"
                : "1an"}
            </button>
          ))}
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
          </button>
        ))}
      </div>

      {/* Tab Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatItem
              label="Séances"
              value={computedStats.totalSessions}
              icon={Dumbbell}
              color={CHART_COLORS.primary}
              tooltip="Nombre total de séances"
            />
            <StatItem
              label="Volume total"
              value={
                computedStats.totalVolume > 1000
                  ? `${(computedStats.totalVolume / 1000).toFixed(1)}`
                  : computedStats.totalVolume.toFixed(0)
              }
              unit={computedStats.totalVolume > 1000 ? "t" : "kg"}
              icon={TrendingUp}
              color={CHART_COLORS.success}
              tooltip="Poids × répétitions"
            />
            <StatItem
              label="Streak"
              value={computedStats.currentStreak}
              unit="jours"
              icon={Flame}
              color={CHART_COLORS.warning}
              tooltip="Jours consécutifs"
            />
            <StatItem
              label="Poids actuel"
              value={computedStats.latestWeight?.toFixed(1) || "—"}
              unit="kg"
              icon={Scale}
              color={CHART_COLORS.info}
              change={computedStats.weightChange}
            />
          </div>

          {/* Graphique principal */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Évolution
                </h3>
                {/* Sélecteur de métriques */}
                <div className="flex flex-wrap gap-2">
                  {TRACKING_METRICS.slice(0, 4).map((metric) => {
                    const isSelected = selectedMetrics.includes(metric.id);
                    return (
                      <button
                        key={metric.id}
                        onClick={() => toggleMetric(metric.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? "text-white shadow-md"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: metric.color }
                            : undefined
                        }
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {metric.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-[280px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <defs>
                        {selectedMetrics.map((metricId) => {
                          const metric = TRACKING_METRICS.find(
                            (m) => m.id === metricId
                          );
                          return (
                            <linearGradient
                              key={metricId}
                              id={`gradient-${metricId}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={metric?.color}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={metric?.color}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          );
                        })}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      {selectedMetrics.map((metricId) => {
                        const metric = TRACKING_METRICS.find(
                          (m) => m.id === metricId
                        );
                        return (
                          <Area
                            key={metricId}
                            type="monotone"
                            dataKey={metricId}
                            stroke={metric?.color}
                            strokeWidth={2}
                            fill={`url(#gradient-${metricId})`}
                            dot={{
                              r: 3,
                              fill: metric?.color,
                              strokeWidth: 2,
                              stroke: "hsl(var(--card))",
                            }}
                            activeDot={{
                              r: 5,
                              fill: metric?.color,
                              strokeWidth: 2,
                              stroke: "hsl(var(--card))",
                            }}
                          />
                        );
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
                        Pas encore de données
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Secondary Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Séances par semaine */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 lg:col-span-2">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Séances par semaine
                </h3>
                <div className="h-[200px]">
                  {computedStats.sessionsPerWeek.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={computedStats.sessionsPerWeek}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="week"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                          }}
                          formatter={(value: number) => [
                            `${value} séance${value > 1 ? "s" : ""}`,
                            "Semaine",
                          ]}
                        />
                        <Bar
                          dataKey="count"
                          fill={CHART_COLORS.primary}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Aucune donnée
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Groupes musculaires */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Muscles travaillés
                </h3>
                <div className="h-[200px]">
                  {computedStats.muscleGroupsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={computedStats.muscleGroupsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {computedStats.muscleGroupsData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                          }}
                          formatter={(value: number, name: string) => [
                            `${value}×`,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Aucune donnée
                    </div>
                  )}
                </div>
                {computedStats.muscleGroupsData.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {computedStats.muscleGroupsData
                      .slice(0, 4)
                      .map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[index] }}
                          />
                          <span className="text-muted-foreground capitalize">
                            {item.name}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top exercices */}
          {computedStats.topExercises.length > 0 && (
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Exercices favoris
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {computedStats.topExercises.map((ex, index) => (
                    <div
                      key={ex.name}
                      className="text-center p-3 rounded-xl bg-background/50 hover:bg-background transition-colors"
                    >
                      <div
                        className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-sm font-bold mb-2"
                        style={{
                          backgroundColor: `${PIE_COLORS[index]}20`,
                          color: PIE_COLORS[index],
                        }}
                      >
                        #{index + 1}
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">
                        {ex.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ex.count}×
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab Graphiques personnalisés */}
      {activeTab === "charts" && (
        <div className="space-y-6">
          {/* Sélecteur de métriques */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Personnalisez votre graphique
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez les métriques à afficher
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRACKING_METRICS.map((metric) => {
                  const isSelected = selectedMetrics.includes(metric.id);
                  return (
                    <button
                      key={metric.id}
                      onClick={() => toggleMetric(metric.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        isSelected
                          ? "text-white border-transparent shadow-md"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: metric.color }
                          : undefined
                      }
                    >
                      <metric.icon className="h-4 w-4" />
                      {metric.label}
                      {isSelected ? (
                        <Eye className="h-3.5 w-3.5 ml-1" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 ml-1 opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Graphique personnalisé */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4">
                {selectedMetrics.length === 0
                  ? "Sélectionnez au moins une métrique"
                  : `${selectedMetrics.length} métrique${
                      selectedMetrics.length > 1 ? "s" : ""
                    } sélectionnée${selectedMetrics.length > 1 ? "s" : ""}`}
              </h3>
              <div className="h-[400px]">
                {selectedMetrics.length > 0 && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => {
                          const metric = TRACKING_METRICS.find(
                            (m) => m.id === value
                          );
                          return (
                            <span className="text-sm text-foreground">
                              {metric?.label || value}
                            </span>
                          );
                        }}
                      />
                      {selectedMetrics.map((metricId) => {
                        const metric = TRACKING_METRICS.find(
                          (m) => m.id === metricId
                        );
                        return (
                          <Line
                            key={metricId}
                            type="monotone"
                            dataKey={metricId}
                            stroke={metric?.color}
                            strokeWidth={2.5}
                            dot={{
                              r: 4,
                              fill: metric?.color,
                              strokeWidth: 2,
                              stroke: "hsl(var(--card))",
                            }}
                            activeDot={{
                              r: 6,
                              fill: metric?.color,
                              strokeWidth: 3,
                              stroke: "hsl(var(--card))",
                            }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {selectedMetrics.length === 0
                          ? "Sélectionnez des métriques à afficher"
                          : "Pas de données pour les métriques sélectionnées"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Corps / Mensurations */}
      {activeTab === "body" && (
        <div className="space-y-6">
          {/* Stats mensurations */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatItem
              label="Poids"
              value={filteredMeasurements[0]?.bodyWeightKg?.toFixed(1) || "—"}
              unit="kg"
              icon={Scale}
              color={CHART_COLORS.info}
              change={computedStats.weightChange}
            />
            <StatItem
              label="Tour de taille"
              value={filteredMeasurements[0]?.waistCm?.toFixed(1) || "—"}
              unit="cm"
              icon={Ruler}
              color={CHART_COLORS.purple}
            />
            <StatItem
              label="Poitrine"
              value={filteredMeasurements[0]?.chestCm?.toFixed(1) || "—"}
              unit="cm"
              icon={Heart}
              color={CHART_COLORS.pink}
            />
            <StatItem
              label="Épaules"
              value={filteredMeasurements[0]?.shouldersCm?.toFixed(1) || "—"}
              unit="cm"
              icon={Activity}
              color={CHART_COLORS.success}
            />
          </div>

          {/* Graphique évolution poids */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Évolution du poids
                </h3>
                <Link to="/dashboard/measurements">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle mesure
                  </Button>
                </Link>
              </div>
              <div className="h-[280px]">
                {filteredMeasurements.filter((m) => m.bodyWeightKg).length >
                0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredMeasurements
                        .filter((m) => m.bodyWeightKg)
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(a.date).getTime() -
                            new Date(b.date).getTime()
                        )
                        .map((m) => ({
                          date: new Date(m.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                          }),
                          weight: m.bodyWeightKg,
                        }))}
                    >
                      <defs>
                        <linearGradient
                          id="weightGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={CHART_COLORS.info}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_COLORS.info}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={["dataMin - 2", "dataMax + 2"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                        formatter={(value: number) => [
                          `${value.toFixed(1)} kg`,
                          "Poids",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke={CHART_COLORS.info}
                        strokeWidth={2.5}
                        fill="url(#weightGradient)"
                        dot={{
                          r: 4,
                          fill: CHART_COLORS.info,
                          strokeWidth: 2,
                          stroke: "hsl(var(--card))",
                        }}
                        activeDot={{
                          r: 6,
                          fill: CHART_COLORS.info,
                          strokeWidth: 3,
                          stroke: "hsl(var(--card))",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Scale className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">
                        Aucune mensuration
                      </p>
                      <Link to="/dashboard/measurements">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Autres mensurations */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                Autres mensurations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: "Bras G",
                    value: filteredMeasurements[0]?.leftArmCm,
                  },
                  {
                    label: "Bras D",
                    value: filteredMeasurements[0]?.rightArmCm,
                  },
                  {
                    label: "Cuisse G",
                    value: filteredMeasurements[0]?.leftThighCm,
                  },
                  {
                    label: "Cuisse D",
                    value: filteredMeasurements[0]?.rightThighCm,
                  },
                  { label: "Hanches", value: filteredMeasurements[0]?.hipsCm },
                  { label: "Cou", value: filteredMeasurements[0]?.neckCm },
                  {
                    label: "Mollet G",
                    value: filteredMeasurements[0]?.leftCalfCm,
                  },
                  {
                    label: "Mollet D",
                    value: filteredMeasurements[0]?.rightCalfCm,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="text-center p-3 rounded-xl bg-background/50"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {item.value ? `${item.value}` : "—"}
                      {item.value && (
                        <span className="text-xs text-muted-foreground ml-0.5">
                          cm
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Statistics;
