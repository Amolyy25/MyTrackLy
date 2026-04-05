import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Play,
  Flame,
  BarChart2,
  CalendarDays,
  Loader2,
  Clock,
  Dumbbell,
} from "lucide-react";
import { usePlanById } from "../../../../hooks/usePlanById";
import { usePlanProgress } from "../../../../hooks/usePlanProgress";
import { useTrainingPlans } from "../../../../hooks/useTrainingPlans";
import { useToast } from "../../../../contexts/ToastContext";
import {
  DAYS_FR,
  DAYS_FULL_FR,
  getMoodEmoji,
  getTrainingTypeLabel,
  getTrainingTypeEmoji,
  getBodyGoalLabel,
  getBodyGoalEmoji,
} from "../../../../utils/trainingPlanHelpers";
import { PlanDay } from "../../../../types";
import LogPlanSessionModal from "./LogPlanSessionModal";
import AIPlanInsights from "./AIPlanInsights";

// ---- Helpers ----
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getNextPlanDay(days: PlanDay[]): PlanDay | null {
  if (!days || days.length === 0) return null;
  const todayDow = new Date().getDay();
  // Find the next day >= today
  const sorted = [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  return (
    sorted.find((d) => d.dayOfWeek >= todayDow) ??
    sorted[0] // wrap around to beginning of week
  );
}

// ---- Sub-components ----

function ActiveToggle({
  isActive,
  onToggle,
}: {
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      title={isActive ? "Désactiver ce plan" : "Activer ce plan"}
    >
      {isActive ? (
        <ToggleRight className="w-5 h-5 text-green-500" />
      ) : (
        <ToggleLeft className="w-5 h-5 text-gray-400" />
      )}
      <span
        className={`text-sm font-medium ${
          isActive
            ? "text-green-600 dark:text-green-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {isActive ? "Actif" : "Inactif"}
      </span>
    </button>
  );
}

function WeeklyCalendar({
  days,
  onLogSession,
}: {
  days: PlanDay[];
  onLogSession: (day: PlanDay) => void;
}) {
  const todayDow = new Date().getDay();

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-indigo-500" />
        Planning hebdomadaire
      </h3>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }, (_, i) => {
          const planDay = days.find((d) => d.dayOfWeek === i);
          const isToday = i === todayDow;

          return (
            <div
              key={i}
              className={`flex flex-col rounded-xl p-2 min-h-[80px] border ${
                isToday
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : planDay
                  ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-40"
              }`}
            >
              <p
                className={`text-xs font-semibold mb-1 ${
                  isToday ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {DAYS_FR[i]}
              </p>
              {planDay ? (
                <div className="flex flex-col gap-1 flex-1">
                  <p
                    className={`text-xs ${
                      isToday
                        ? "text-indigo-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {planDay.timeOfDay}
                  </p>
                  <p
                    className={`text-xs leading-tight ${
                      isToday ? "text-white" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {getTrainingTypeEmoji(planDay.trainingType)}{" "}
                    {getTrainingTypeLabel(
                      planDay.trainingType,
                      planDay.customType
                    )}
                  </p>
                  {planDay.exercises.length > 0 && (
                    <p
                      className={`text-xs mt-auto ${
                        isToday
                          ? "text-indigo-200"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {planDay.exercises.length} ex.
                    </p>
                  )}
                  <button
                    onClick={() => onLogSession(planDay)}
                    className={`mt-1 text-xs px-1.5 py-1 rounded-lg font-medium transition-colors ${
                      isToday
                        ? "bg-white/20 hover:bg-white/30 text-white"
                        : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    <Play className="w-3 h-3 inline mr-0.5" />
                    Faire
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NextSession({ nextDay }: { nextDay: PlanDay | null }) {
  if (!nextDay) return null;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <h3 className="text-sm font-semibold text-indigo-100 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Prochaine séance
      </h3>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xl font-bold">{DAYS_FULL_FR[nextDay.dayOfWeek]}</p>
          <p className="text-sm text-indigo-200">
            {nextDay.timeOfDay} —{" "}
            {getTrainingTypeEmoji(nextDay.trainingType)}{" "}
            {getTrainingTypeLabel(nextDay.trainingType, nextDay.customType)}
          </p>
        </div>
      </div>
      {nextDay.exercises.length > 0 && (
        <div className="space-y-1.5 mt-3 pt-3 border-t border-white/20">
          {nextDay.exercises.slice(0, 5).map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-indigo-100 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" />
                {ex.exercise?.name ?? "Exercice"}
              </span>
              <span className="text-white font-medium">
                {ex.plannedSets}×{ex.plannedReps}
                {ex.plannedWeightKg && ` @ ${ex.plannedWeightKg}kg`}
              </span>
            </div>
          ))}
          {nextDay.exercises.length > 5 && (
            <p className="text-xs text-indigo-200">
              +{nextDay.exercises.length - 5} autres exercices
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressSection({
  completionRate,
  streakDays,
  weeklyBreakdown,
}: {
  completionRate: number;
  streakDays: number;
  weeklyBreakdown: Array<{ weekStart: string; planned: number; logged: number }>;
}) {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-500" />
        Progression
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Completion rate */}
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-center">
          <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
            {Math.round(completionRate)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Complétion
          </p>
        </div>
        {/* Streak */}
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-center">
          <p className="text-4xl font-black text-orange-500 dark:text-orange-400 flex items-center justify-center gap-1">
            {streakDays}
            <Flame className="w-7 h-7" />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Jours de streak
          </p>
        </div>
      </div>

      {/* Weekly bars */}
      {weeklyBreakdown.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            4 dernières semaines
          </p>
          <div className="flex gap-2 items-end h-16">
            {weeklyBreakdown.slice(-4).map((week, i) => {
              const pct =
                week.planned > 0
                  ? Math.min((week.logged / week.planned) * 100, 100)
                  : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full flex-1 relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">S{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Main Component ----
const TrainingPlanDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { updatePlan, deletePlan } = useTrainingPlans();
  const { plan, isLoading, error, refetch } = usePlanById(id ?? null);
  const { progress } = usePlanProgress(id ?? null);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logTargetDay, setLogTargetDay] = useState<PlanDay | null>(null);

  const handleToggleActive = async () => {
    if (!plan) return;
    try {
      await updatePlan(plan.id, { isActive: !plan.isActive });
      await refetch();
      showToast(
        plan.isActive ? "Plan désactivé" : "Plan activé",
        "success"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erreur",
        "error"
      );
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    if (
      !window.confirm(
        `Supprimer le plan "${plan.name}" ? Cette action est irréversible.`
      )
    )
      return;

    try {
      await deletePlan(plan.id);
      showToast("Plan supprimé", "success");
      navigate("/dashboard/training-plans");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erreur",
        "error"
      );
    }
  };

  const handleOpenLogModal = (day: PlanDay) => {
    setLogTargetDay(day);
    setLogModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">
          {error ?? "Plan introuvable"}
        </p>
        <button
          onClick={() => navigate("/dashboard/training-plans")}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Retour à mes plans
        </button>
      </div>
    );
  }

  const nextDay = getNextPlanDay(plan.days);
  const logs = plan.sessions ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/dashboard/training-plans")}
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Mes plans
        </button>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {plan.name}
            </h1>
            {plan.bodyGoal && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                <span>{getBodyGoalEmoji(plan.bodyGoal)}</span>
                <span>{getBodyGoalLabel(plan.bodyGoal, plan.customGoal)}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ActiveToggle
              isActive={plan.isActive}
              onToggle={handleToggleActive}
            />
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>

        {plan.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {plan.description}
          </p>
        )}
      </div>

      {/* 2-col layout on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Calendar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <WeeklyCalendar days={plan.days} onLogSession={handleOpenLogModal} />
          </div>

          {/* Next session */}
          {nextDay && <NextSession nextDay={nextDay} />}

          {/* Progression */}
          {progress && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <ProgressSection
                completionRate={progress.completionRate}
                streakDays={progress.streakDays}
                weeklyBreakdown={progress.weeklyBreakdown}
              />
            </div>
          )}
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <AIPlanInsights planId={plan.id} />
          </div>

          {/* Session history */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Historique récent
            </h3>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Aucune séance loggée
              </p>
            ) : (
              <div className="space-y-2">
                {logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(log.date)}
                        </p>
                        {log.moodScore && (
                          <span className="text-base">
                            {getMoodEmoji(log.moodScore)}
                          </span>
                        )}
                        {log.skipped && (
                          <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Sautée
                          </span>
                        )}
                      </div>
                      {log.moodNote && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {log.moodNote}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log session modal */}
      <LogPlanSessionModal
        isOpen={logModalOpen}
        onClose={() => {
          setLogModalOpen(false);
          setLogTargetDay(null);
        }}
        planId={plan.id}
        planDay={logTargetDay}
        onSuccess={refetch}
      />
    </div>
  );
};

export default TrainingPlanDashboard;
