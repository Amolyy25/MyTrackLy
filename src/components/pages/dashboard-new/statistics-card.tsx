"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BarChart3 } from "lucide-react";
import {
  useStatisticsData,
  STATISTIC_OPTIONS,
  StatisticType,
} from "../../../hooks/useStatisticsData";
import { TrainingSession, Measurement } from "../../../types";
import { StatisticsChart } from "./statistics-chart";

interface StatisticsCardProps {
  sessions: TrainingSession[];
  measurements: Measurement[];
  role?: "personnel" | "coach" | "eleve";
}

export function StatisticsCard({
  sessions,
  measurements,
  role = "personnel",
}: StatisticsCardProps) {
  const [selectedStat, setSelectedStat] =
    useState<StatisticType>("sessions_per_week");

  const { data, unit, label, description } = useStatisticsData(
    sessions,
    measurements,
    selectedStat
  );

  // Vérifier si on a des données valides (au moins une valeur > 0)
  const hasValidData = useMemo(
    () => data.some((point) => point.value > 0),
    [data]
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-2.5">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Statistiques détaillées
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select
              value={selectedStat}
              onValueChange={(value) => setSelectedStat(value as StatisticType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une statistique" />
              </SelectTrigger>
              <SelectContent>
                {STATISTIC_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {hasValidData ? (
          <div className="h-[300px] w-full sm:h-[350px]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {unit}
              </span>
            </div>
            <StatisticsChart data={data} unit={unit} label={label} />
          </div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center sm:h-[350px]">
      <div className="rounded-full bg-muted p-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-foreground">
          Aucune donnée disponible
        </p>
        <p className="text-sm text-muted-foreground">
          Ajoutez des séances ou des mensurations pour voir vos statistiques
        </p>
      </div>
    </div>
  );
}
