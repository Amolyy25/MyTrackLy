"use client";

import * as React from "react";
import {
  Plus,
  TrendingDown,
  Scale,
  Ruler,
  Camera,
  Clock,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";

export interface MeasurementItem {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}

export interface WeightPoint {
  day: string;
  weight: number;
}

interface MeasurementsProps {
  weightData: WeightPoint[];
  measurements: MeasurementItem[];
  currentWeight: number;
  weightChange: number;
  role?: "coach" | "eleve" | "personnel";
  studentName?: string;
}

export function Measurements({
  weightData,
  measurements,
  currentWeight,
  weightChange,
  role = "personnel",
  studentName,
}: MeasurementsProps) {
  const hasData = weightData.length > 0 || currentWeight > 0;

  if (!hasData) {
    return (
      <Card className="border-border bg-card h-full">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/10 p-2.5">
              <Scale className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {role === "coach" ? "Mensurations élève" : "Mensurations"}
              </CardTitle>
              {studentName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="h-3 w-3" />
                  {studentName}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Scale className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Aucune donnée</p>
            <p className="text-xs text-muted-foreground mt-1">
              {role === "coach"
                ? "Cet élève n'a pas encore de mensurations"
                : "Ajoutez votre première mesure"}
            </p>
          </div>
          {role !== "coach" && (
            <Link to="/dashboard/measurements">
              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card h-full">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/10 p-2.5">
            <Scale className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {role === "coach" ? "Mensurations élève" : "Mensurations"}
            </CardTitle>
            {studentName ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <User className="h-3 w-3" />
                {studentName}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Mis à jour récemment
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {/* Mini Weight Chart */}
        {weightData.length > 1 && (
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value} kg`, "Poids"]}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                  strokeLinecap="round"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Current Weight */}
        <div className="rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 p-5 text-center border border-border">
          <p className="text-4xl font-bold tracking-tight text-foreground">
            {currentWeight}{" "}
            <span className="text-xl font-normal text-muted-foreground">
              kg
            </span>
          </p>
          {weightChange !== 0 && (
            <div
              className={`mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold ${
                weightChange > 0 ? "text-destructive" : "text-chart-2"
              }`}
            >
              <TrendingDown
                className={`h-4 w-4 ${weightChange > 0 ? "rotate-180" : ""}`}
              />
              {weightChange > 0 ? "+" : ""}
              {weightChange} kg
            </div>
          )}
        </div>

        {/* Other Measurements */}
        {measurements.length > 0 && (
          <div className="space-y-2">
            {measurements.map((m) => (
              <div
                key={m.label}
                className="flex items-center justify-between rounded-xl bg-muted/30 p-3 border border-transparent hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2">
                    <m.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {m.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {m.value}
                  </span>
                  {m.change !== "0 cm" && (
                    <span
                      className={`text-xs font-semibold ${
                        m.positive ? "text-chart-2" : "text-destructive"
                      }`}
                    >
                      {m.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {role !== "coach" && (
          <div className="grid grid-cols-2 gap-2">
            <Link to="/dashboard/measurements">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted btn-press"
              >
                <Plus className="mr-2 h-4 w-4" />
                Mesure
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-border bg-transparent text-foreground hover:bg-muted btn-press"
              disabled
            >
              <Camera className="mr-2 h-4 w-4" />
              Photo
              <span className="ml-1 badge-soon text-[8px]">Soon</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
