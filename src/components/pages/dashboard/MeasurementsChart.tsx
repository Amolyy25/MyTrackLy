import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Measurement } from "../../../types";
import { Card, CardContent } from "../ui/card";
import { Scale, Target, TrendingUp, Check } from "lucide-react";

interface MeasurementsChartProps {
  measurements: Measurement[];
}

const MeasurementsChart: React.FC<MeasurementsChartProps> = ({ measurements }) => {
  const [selectedField, setSelectedField] = useState<string>("bodyWeightKg");

  const chartData = useMemo(() => {
    return measurements
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((m) => ({
        date: new Date(m.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        fullDate: m.date,
        bodyWeightKg: m.bodyWeightKg,
        waistCm: m.waistCm,
        chestCm: m.chestCm,
        hipsCm: m.hipsCm,
        leftArmCm: m.leftArmCm,
        rightArmCm: m.rightArmCm,
        leftThighCm: m.leftThighCm,
        rightThighCm: m.rightThighCm,
        shouldersCm: m.shouldersCm,
        neckCm: m.neckCm,
      }));
  }, [measurements]);

  const fields = [
    { id: "bodyWeightKg", label: "Poids", unit: "kg", color: "hsl(262, 83%, 58%)", icon: Scale },
    { id: "waistCm", label: "Taille", unit: "cm", color: "hsl(142, 76%, 36%)", icon: Target },
    { id: "chestCm", label: "Poitrine", unit: "cm", color: "hsl(210, 80%, 60%)" },
    { id: "hipsCm", label: "Hanches", unit: "cm", color: "hsl(38, 92%, 50%)" },
    { id: "shouldersCm", label: "Épaules", unit: "cm", color: "hsl(280, 70%, 55%)" },
    { id: "leftArmCm", label: "Bras G", unit: "cm", color: "hsl(340, 80%, 60%)" },
    { id: "rightArmCm", label: "Bras D", unit: "cm", color: "hsl(340, 60%, 50%)" },
    { id: "leftThighCm", label: "Cuisse G", unit: "cm", color: "hsl(180, 60%, 45%)" },
    { id: "rightThighCm", label: "Cuisse D", unit: "cm", color: "hsl(180, 40%, 40%)" },
  ];

  const selectedFieldData = fields.find((f) => f.id === selectedField);
  const hasData = chartData.some((d) => d[selectedField as keyof typeof d] != null);

  // Calculate stats for selected field
  const values = chartData.map((d) => d[selectedField as keyof typeof d]).filter((v) => v != null) as number[];
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const change = values.length >= 2 ? values[values.length - 1] - values[0] : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl shadow-xl p-3 min-w-[120px]">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-bold text-foreground">
            {payload[0].value} <span className="text-sm font-normal text-muted-foreground">{selectedFieldData?.unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Field Selection */}
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => {
          const fieldHasData = chartData.some((d) => d[field.id as keyof typeof d] != null);
          if (!fieldHasData) return null;

          const isSelected = selectedField === field.id;
          return (
            <button
              key={field.id}
              onClick={() => setSelectedField(field.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "text-white shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              style={isSelected ? { backgroundColor: field.color } : undefined}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
              {field.label}
            </button>
          );
        })}
      </div>

      {/* Stats Row */}
      {hasData && (
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">Min</p>
            <p className="text-lg font-bold text-foreground">{minValue.toFixed(1)}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">Max</p>
            <p className="text-lg font-bold text-foreground">{maxValue.toFixed(1)}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">Moyenne</p>
            <p className="text-lg font-bold text-foreground">{avgValue.toFixed(1)}</p>
          </div>
          <div className={`p-3 rounded-xl text-center ${
            change > 0 ? "bg-amber-500/10" : change < 0 ? "bg-emerald-500/10" : "bg-muted/30"
          }`}>
            <p className="text-xs text-muted-foreground">Évolution</p>
            <p className={`text-lg font-bold ${
              change > 0 ? "text-amber-500" : change < 0 ? "text-emerald-500" : "text-foreground"
            }`}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-muted/10 overflow-hidden">
        <CardContent className="p-0">
          {hasData ? (
            <div className="h-[300px] sm:h-[350px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedFieldData?.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={selectedFieldData?.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={selectedField}
                    stroke={selectedFieldData?.color}
                    strokeWidth={2.5}
                    fill="url(#colorGradient)"
                    dot={{
                      r: 4,
                      fill: selectedFieldData?.color,
                      strokeWidth: 2,
                      stroke: "hsl(var(--card))",
                    }}
                    activeDot={{
                      r: 6,
                      fill: selectedFieldData?.color,
                      strokeWidth: 3,
                      stroke: "hsl(var(--card))",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Aucune donnée pour cette mesure</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeasurementsChart;
