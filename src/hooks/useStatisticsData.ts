import { useMemo } from "react";
import { TrainingSession, Measurement } from "../types";
import {
  getWeekKey,
  getMonthKey,
  formatWeekLabel,
  formatMonthLabel,
  formatShortDate,
  getLastWeeks,
  getLastMonths,
} from "../utils/dateUtils";
import { calculateTotalVolume } from "../utils/trainingCalculations";

// Types pour les données du graphique
export interface ChartDataPoint {
  label: string;
  value: number;
}

export type StatisticType =
  | "sessions_per_week"
  | "weight_per_month"
  | "volume_per_session"
  | "arm_circumference"
  | "chest_circumference"
  | "waist_circumference"
  | "thigh_circumference";

export interface StatisticOption {
  id: StatisticType;
  label: string;
  unit: string;
  description: string;
}

export const STATISTIC_OPTIONS: StatisticOption[] = [
  {
    id: "sessions_per_week",
    label: "Séances par semaine",
    unit: "séances",
    description: "Nombre de séances d'entraînement par semaine",
  },
  {
    id: "weight_per_month",
    label: "Poids corporel",
    unit: "kg",
    description: "Évolution du poids par mois",
  },
  {
    id: "volume_per_session",
    label: "Volume soulevé",
    unit: "kg",
    description: "Volume total soulevé par séance",
  },
  {
    id: "arm_circumference",
    label: "Tour de bras",
    unit: "cm",
    description: "Évolution du tour de bras par mois",
  },
  {
    id: "chest_circumference",
    label: "Tour de poitrine",
    unit: "cm",
    description: "Évolution du tour de poitrine par mois",
  },
  {
    id: "waist_circumference",
    label: "Tour de taille",
    unit: "cm",
    description: "Évolution du tour de taille par mois",
  },
  {
    id: "thigh_circumference",
    label: "Tour de cuisses",
    unit: "cm",
    description: "Évolution du tour de cuisses par mois",
  },
] as const;

// Constantes de configuration
const WEEKS_COUNT = 12;
const MONTHS_COUNT = 6;
const LAST_SESSIONS_COUNT = 20;

// Type helper pour les agrégations mensuelles
interface MonthlyAggregation {
  total: number;
  count: number;
}

/**
 * Calcule la moyenne arrondie à 1 décimale
 */
function roundToDecimal(value: number, decimals: number = 1): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Fonction générique pour agréger des mensurations par mois
 */
function aggregateMeasurementsByMonth(
  measurements: Measurement[],
  getValue: (m: Measurement) => number | null
): ChartDataPoint[] {
  const monthMap = new Map<string, MonthlyAggregation>();

  // Initialiser les 6 derniers mois
  const months = getLastMonths(MONTHS_COUNT);
  months.forEach((date) => {
    monthMap.set(getMonthKey(date), { total: 0, count: 0 });
  });

  // Agréger les valeurs
  measurements.forEach((measurement) => {
    const value = getValue(measurement);
    if (value !== null && value > 0) {
      const key = getMonthKey(new Date(measurement.date));
      const current = monthMap.get(key);
      if (current) {
        monthMap.set(key, {
          total: current.total + value,
          count: current.count + 1,
        });
      }
    }
  });

  // Convertir en array avec moyenne
  return months.map((date) => {
    const key = getMonthKey(date);
    const data = monthMap.get(key) || { total: 0, count: 0 };
    return {
      label: formatMonthLabel(date),
      value:
        data.count > 0 ? roundToDecimal(data.total / data.count) : 0,
    };
  });
}

/**
 * Calcule la moyenne de deux valeurs (pour bras/cuisses gauche/droite)
 */
function averageValues(value1?: number, value2?: number): number | null {
  const values = [value1, value2].filter((v) => v !== undefined && v !== null && v > 0) as number[];
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Hook principal
export function useStatisticsData(
  sessions: TrainingSession[],
  measurements: Measurement[],
  statisticType: StatisticType
) {
  const data = useMemo(() => {
    switch (statisticType) {
      case "sessions_per_week":
        return getSessionsPerWeek(sessions);
      case "weight_per_month":
        return getWeightPerMonth(measurements);
      case "volume_per_session":
        return getVolumePerSession(sessions);
      case "arm_circumference":
        return getArmCircumferencePerMonth(measurements);
      case "chest_circumference":
        return getMeasurementPerMonth(measurements, "chestCm");
      case "waist_circumference":
        return getMeasurementPerMonth(measurements, "waistCm");
      case "thigh_circumference":
        return getThighCircumferencePerMonth(measurements);
      default:
        return [];
    }
  }, [sessions, measurements, statisticType]);

  const option = useMemo(
    () => STATISTIC_OPTIONS.find((opt) => opt.id === statisticType),
    [statisticType]
  );

  return {
    data,
    unit: option?.unit || "",
    label: option?.label || "",
    description: option?.description || "",
  };
}

/**
 * Nombre de séances par semaine (12 dernières semaines)
 */
function getSessionsPerWeek(sessions: TrainingSession[]): ChartDataPoint[] {
  const weekMap = new Map<string, number>();
  const weeks = getLastWeeks(WEEKS_COUNT);

  // Initialiser toutes les semaines à 0
  weeks.forEach((date) => {
    weekMap.set(getWeekKey(date), 0);
  });

  // Compter les séances par semaine
  sessions.forEach((session) => {
    const key = getWeekKey(new Date(session.date));
    const current = weekMap.get(key);
    if (current !== undefined) {
      weekMap.set(key, current + 1);
    }
  });

  // Convertir en array
  return weeks.map((date) => {
    const key = getWeekKey(date);
    const [year, week] = key.split("-").map(Number);
    return {
      label: formatWeekLabel(year, week),
      value: weekMap.get(key) || 0,
    };
  });
}

/**
 * Poids par mois (6 derniers mois)
 */
function getWeightPerMonth(measurements: Measurement[]): ChartDataPoint[] {
  return aggregateMeasurementsByMonth(measurements, (m) => m.bodyWeightKg ?? null);
}

/**
 * Volume par séance (20 dernières séances)
 */
function getVolumePerSession(sessions: TrainingSession[]): ChartDataPoint[] {
  const sortedSessions = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-LAST_SESSIONS_COUNT);

  return sortedSessions.map((session) => ({
    label: formatShortDate(new Date(session.date)),
    value: Math.round(calculateTotalVolume(session)),
  }));
}

/**
 * Tour de bras par mois (moyenne gauche/droite)
 */
function getArmCircumferencePerMonth(measurements: Measurement[]): ChartDataPoint[] {
  return aggregateMeasurementsByMonth(measurements, (m) =>
    averageValues(m.leftArmCm, m.rightArmCm)
  );
}

/**
 * Tour de cuisses par mois (moyenne gauche/droite)
 */
function getThighCircumferencePerMonth(measurements: Measurement[]): ChartDataPoint[] {
  return aggregateMeasurementsByMonth(measurements, (m) =>
    averageValues(m.leftThighCm, m.rightThighCm)
  );
}

/**
 * Mensuration générique par mois
 */
function getMeasurementPerMonth(
  measurements: Measurement[],
  field: keyof Measurement
): ChartDataPoint[] {
  return aggregateMeasurementsByMonth(measurements, (m) => {
    const value = m[field];
    return typeof value === "number" && value > 0 ? value : null;
  });
}
