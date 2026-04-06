import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Check, Loader2, AlertTriangle, Zap, ArrowUp, RotateCcw } from "lucide-react";
import { PlanDay, PlanExercise } from "../../../../types";
import { PlanProgress } from "../../../../types";
import { useToast } from "../../../../contexts/ToastContext";
import API_URL from "../../../../config/api";

interface ProgressiveOverloadProps {
  planId: string;
  days: PlanDay[];
  progress: PlanProgress | null;
  onApplied: () => void;
}

interface OverloadRecommendation {
  dayId: string;
  dayLabel: string;
  exerciseId: string;
  exerciseName: string;
  currentSets: number;
  currentReps: number;
  currentWeight: number | null;
  newSets: number;
  newReps: number;
  newWeight: number | null;
  type: "weight_increase" | "rep_increase" | "set_increase";
  reason: string;
}

interface DeloadRecommendation {
  shouldDeload: boolean;
  reason: string;
  suggestedDuration: number; // weeks
  reductionPercent: number;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

/**
 * Analyzes plan data to generate progressive overload recommendations.
 * In production, this would come from the AI backend.
 * For now, we use client-side heuristics.
 */
function generateOverloadRecommendations(days: PlanDay[], progress: PlanProgress | null): OverloadRecommendation[] {
  const recs: OverloadRecommendation[] = [];

  if (!progress || progress.totalLoggedSessions < 2) return recs;

  // Only suggest if completion rate is decent (> 70%)
  if (progress.completionRate < 70) return recs;

  for (const day of days) {
    const dayLabel = day.label || `Jour ${day.dayOfWeek}`;
    for (const ex of day.exercises) {
      const name = ex.exercise?.name ?? "Exercice";

      if (ex.plannedWeightKg && ex.plannedWeightKg > 0) {
        // Weight-based exercise: suggest +2.5kg if completing well
        const increment = ex.plannedWeightKg < 40 ? 2.5 : 5;
        recs.push({
          dayId: day.id,
          dayLabel,
          exerciseId: ex.id,
          exerciseName: name,
          currentSets: ex.plannedSets,
          currentReps: ex.plannedReps,
          currentWeight: ex.plannedWeightKg,
          newSets: ex.plannedSets,
          newReps: ex.plannedReps,
          newWeight: ex.plannedWeightKg + increment,
          type: "weight_increase",
          reason: `+${increment}kg — progression lineaire`,
        });
      } else if (ex.plannedReps < 15) {
        // Bodyweight or no weight: suggest +2 reps
        recs.push({
          dayId: day.id,
          dayLabel,
          exerciseId: ex.id,
          exerciseName: name,
          currentSets: ex.plannedSets,
          currentReps: ex.plannedReps,
          currentWeight: ex.plannedWeightKg ?? null,
          newSets: ex.plannedSets,
          newReps: ex.plannedReps + 2,
          newWeight: ex.plannedWeightKg ?? null,
          type: "rep_increase",
          reason: `+2 reps — augmenter le volume`,
        });
      } else {
        // Already at high reps: suggest +1 set
        recs.push({
          dayId: day.id,
          dayLabel,
          exerciseId: ex.id,
          exerciseName: name,
          currentSets: ex.plannedSets,
          currentReps: ex.plannedReps,
          currentWeight: ex.plannedWeightKg ?? null,
          newSets: ex.plannedSets + 1,
          newReps: ex.plannedReps,
          newWeight: ex.plannedWeightKg ?? null,
          type: "set_increase",
          reason: `+1 serie — plus de volume`,
        });
      }
    }
  }

  return recs;
}

function analyzeDeload(progress: PlanProgress | null): DeloadRecommendation {
  if (!progress) {
    return { shouldDeload: false, reason: "", suggestedDuration: 0, reductionPercent: 0 };
  }

  // Detect stagnation: mood dropping + completion rate decreasing
  const recentWeeks = progress.weeklyBreakdown.slice(-4);
  const hasMoodDecline = progress.averageMoodScore != null && progress.averageMoodScore < 3;
  const hasCompletionDecline = recentWeeks.length >= 3 && recentWeeks.every((w) => w.logged < w.planned);
  const hasSkippedMany = progress.skippedSessions > progress.totalLoggedSessions * 0.3;

  if (hasMoodDecline && (hasCompletionDecline || hasSkippedMany)) {
    return {
      shouldDeload: true,
      reason: "Humeur en baisse et seances manquees : signes de fatigue accumulee. Une semaine de deload permettra de recuperer et repartir plus fort.",
      suggestedDuration: 1,
      reductionPercent: 40,
    };
  }

  if (hasCompletionDecline && progress.totalLoggedSessions > 8) {
    return {
      shouldDeload: true,
      reason: "Completion en baisse sur les dernieres semaines. Un deload preventif peut relancer la progression.",
      suggestedDuration: 1,
      reductionPercent: 30,
    };
  }

  return { shouldDeload: false, reason: "", suggestedDuration: 0, reductionPercent: 0 };
}

const ProgressiveOverload: React.FC<ProgressiveOverloadProps> = ({ planId, days, progress, onApplied }) => {
  const { showToast } = useToast();
  const [applying, setApplying] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingDeload, setApplyingDeload] = useState(false);

  const recommendations = useMemo(() => generateOverloadRecommendations(days, progress), [days, progress]);
  const deload = useMemo(() => analyzeDeload(progress), [progress]);

  const applyRecommendation = async (rec: OverloadRecommendation) => {
    setApplying(true);
    try {
      const res = await fetch(`${API_URL}/training-plans/${planId}/days/${rec.dayId}/exercises/${rec.exerciseId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          plannedSets: rec.newSets,
          plannedReps: rec.newReps,
          plannedWeightKg: rec.newWeight,
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      setAppliedIds((prev) => new Set(prev).add(rec.exerciseId));
      showToast(`${rec.exerciseName} mis a jour`, "success");
      onApplied();
    } catch {
      showToast("Erreur lors de la mise a jour", "error");
    } finally {
      setApplying(false);
    }
  };

  const applyAllRecommendations = async () => {
    setApplying(true);
    try {
      const remaining = recommendations.filter((r) => !appliedIds.has(r.exerciseId));
      for (const rec of remaining) {
        await fetch(`${API_URL}/training-plans/${planId}/days/${rec.dayId}/exercises/${rec.exerciseId}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            plannedSets: rec.newSets,
            plannedReps: rec.newReps,
            plannedWeightKg: rec.newWeight,
          }),
        });
      }
      setAppliedIds(new Set(recommendations.map((r) => r.exerciseId)));
      showToast("Toutes les recommandations appliquees !", "success");
      onApplied();
    } catch {
      showToast("Erreur lors de la mise a jour", "error");
    } finally {
      setApplying(false);
    }
  };

  const applyDeload = async () => {
    setApplyingDeload(true);
    try {
      const factor = 1 - deload.reductionPercent / 100;
      for (const day of days) {
        for (const ex of day.exercises) {
          const newWeight = ex.plannedWeightKg ? Math.round(ex.plannedWeightKg * factor * 2) / 2 : null;
          const newSets = Math.max(2, Math.round(ex.plannedSets * factor));
          await fetch(`${API_URL}/training-plans/${planId}/days/${day.id}/exercises/${ex.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({
              plannedSets: newSets,
              plannedReps: ex.plannedReps,
              plannedWeightKg: newWeight,
            }),
          });
        }
      }
      showToast(`Deload applique : -${deload.reductionPercent}% sur tout le plan`, "success");
      onApplied();
    } catch {
      showToast("Erreur lors du deload", "error");
    } finally {
      setApplyingDeload(false);
    }
  };

  const allApplied = recommendations.length > 0 && recommendations.every((r) => appliedIds.has(r.exerciseId));

  if (recommendations.length === 0 && !deload.shouldDeload) {
    return null; // Nothing to show
  }

  return (
    <div className="space-y-5">
      {/* Deload alert */}
      {deload.shouldDeload && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-300">Deload recommande</h4>
              <p className="text-xs text-amber-400/80 mt-1 leading-relaxed">{deload.reason}</p>
            </div>
          </div>
          <button
            onClick={applyDeload}
            disabled={applyingDeload}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold disabled:opacity-50 transition-all active:scale-95"
          >
            {applyingDeload ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Appliquer le deload (-{deload.reductionPercent}% pendant {deload.suggestedDuration} semaine)
          </button>
        </div>
      )}

      {/* Progressive overload */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Surcharge progressive
            </h3>
            {!allApplied && (
              <button
                onClick={applyAllRecommendations}
                disabled={applying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 transition-all active:scale-95"
              >
                {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
                Tout appliquer
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Recommandations basees sur vos performances. Appliquez individuellement ou tout d'un coup.
          </p>

          <div className="space-y-2">
            {recommendations.map((rec) => {
              const isApplied = appliedIds.has(rec.exerciseId);
              return (
                <div
                  key={`${rec.dayId}-${rec.exerciseId}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isApplied
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/40 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{rec.exerciseName}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex-shrink-0">{rec.dayLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="text-slate-400">
                        {rec.currentSets}x{rec.currentReps}
                        {rec.currentWeight && ` @${rec.currentWeight}kg`}
                      </span>
                      <span className="text-indigo-500 font-bold">→</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {rec.newSets}x{rec.newReps}
                        {rec.newWeight && ` @${rec.newWeight}kg`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{rec.reason}</p>
                  </div>

                  {isApplied ? (
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <button
                      onClick={() => applyRecommendation(rec)}
                      disabled={applying}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 transition-all active:scale-95 flex-shrink-0"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveOverload;
