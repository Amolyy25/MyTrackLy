import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Measurement } from "../../../types";

interface MeasurementsChartProps {
  measurements: Measurement[];
}

const MeasurementsChart: React.FC<MeasurementsChartProps> = ({
  measurements,
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "bodyWeightKg",
    "chestCm",
    "waistCm",
  ]);

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    return measurements
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .map((measurement) => {
        const formattedDate = new Date(measurement.date).toLocaleDateString(
          "fr-FR",
          {
            day: "2-digit",
            month: "2-digit",
          }
        );

        return {
          date: formattedDate,
          fullDate: measurement.date,
          bodyWeightKg: measurement.bodyWeightKg,
          leftArmCm: measurement.leftArmCm,
          rightArmCm: measurement.rightArmCm,
          leftCalfCm: measurement.leftCalfCm,
          rightCalfCm: measurement.rightCalfCm,
          chestCm: measurement.chestCm,
          waistCm: measurement.waistCm,
          hipsCm: measurement.hipsCm,
          leftThighCm: measurement.leftThighCm,
          rightThighCm: measurement.rightThighCm,
          neckCm: measurement.neckCm,
          shouldersCm: measurement.shouldersCm,
        };
      });
  }, [measurements]);

  const fieldLabels: Record<string, string> = {
    bodyWeightKg: "Poids (kg)",
    chestCm: "Poitrine (cm)",
    waistCm: "Taille (cm)",
    hipsCm: "Hanches (cm)",
    leftArmCm: "Biceps gauche (cm)",
    rightArmCm: "Biceps droit (cm)",
    leftCalfCm: "Mollet gauche (cm)",
    rightCalfCm: "Mollet droit (cm)",
    leftThighCm: "Cuisse gauche (cm)",
    rightThighCm: "Cuisse droite (cm)",
    neckCm: "Cou (cm)",
    shouldersCm: "Épaules (cm)",
  };

  const colors = [
    "#6366f1", // indigo
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // green
    "#3b82f6", // blue
    "#ef4444", // red
    "#14b8a6", // teal
    "#f97316", // orange
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#a855f7", // violet
  ];

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600 text-center py-8">
          Aucune donnée à afficher. Ajoutez des mensurations pour voir les
          graphiques.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Évolution des mensurations
      </h3>

      {/* Sélection des champs à afficher */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Sélectionnez les mesures à afficher :
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(fieldLabels).map((field) => {
            const isSelected = selectedFields.includes(field);
            return (
              <button
                key={field}
                onClick={() => toggleField(field)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {fieldLabels[field]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Graphique */}
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {selectedFields.map((field, index) => {
              const hasData = chartData.some(
                (d) => d[field as keyof typeof d] !== null && d[field as keyof typeof d] !== undefined
              );

              if (!hasData) return null;

              return (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  name={fieldLabels[field]}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {selectedFields.length === 0 && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Sélectionnez au moins une mesure pour afficher le graphique.
        </p>
      )}
    </div>
  );
};

export default MeasurementsChart;

