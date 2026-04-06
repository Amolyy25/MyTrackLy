import React, { useState } from "react";
import { TrendingUp, Trophy, Dumbbell, ChevronDown, BarChart2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useExerciseHistory, ExerciseHistoryData } from "../../../../hooks/useExerciseHistory";

interface ExerciseProgressChartProps {
  planId: string;
}

function ExerciseCard({ data }: { data: ExerciseHistoryData }) {
  const [expanded, setExpanded] = useState(false);

  const chartData = data.entries.map((e, i) => ({
    idx: i + 1,
    poids: e.weightKg ?? 0,
    volume: e.volume,
    reps: e.reps,
  }));

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800 dark:text-white">{data.exerciseName}</p>
            <div className="flex items-center gap-3 mt-0.5">
              {data.personalBest.maxWeight && (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                  <Trophy className="w-3 h-3" />
                  {data.personalBest.maxWeight} kg
                </span>
              )}
              {data.personalBest.maxReps && (
                <span className="text-[10px] text-slate-400">
                  Max {data.personalBest.maxReps} reps
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && chartData.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white dark:bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-100 dark:border-slate-700/30">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Poids max</p>
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {data.personalBest.maxWeight ?? "—"} kg
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-100 dark:border-slate-700/30">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Volume max</p>
              <p className="text-sm font-black text-violet-600 dark:text-violet-400">
                {data.personalBest.maxVolume ?? "—"}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 rounded-lg p-2.5 text-center border border-slate-100 dark:border-slate-700/30">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Seances</p>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                {data.entries.length}
              </p>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`grad_${data.exerciseId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="idx"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#e2e8f0",
                    }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = { poids: "Poids (kg)", volume: "Volume", reps: "Reps" };
                      return [value, labels[name] ?? name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="poids"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill={`url(#grad_${data.exerciseId})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.length <= 1 && (
            <p className="text-xs text-slate-400 text-center py-4 italic">
              Logguez plus de seances pour voir l'evolution
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({ planId }) => {
  const { history, isLoading, error } = useExerciseHistory(planId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-400" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Progression par exercice
        </h3>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-xl p-3 border border-red-500/20">{error}</p>
      )}

      {!isLoading && history.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Aucune donnee de progression</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Les donnees apparaitront au fil de vos seances</p>
        </div>
      )}

      {!isLoading && history.length > 0 && (
        <div className="space-y-2">
          {history.map((data) => (
            <ExerciseCard key={data.exerciseId} data={data} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseProgressChart;
