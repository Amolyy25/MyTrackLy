import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  Copy,
} from "lucide-react";
import { useTrainingPlans } from "../../../../hooks/useTrainingPlans";
import { TrainingPlan } from "../../../../types";
import {
  DAYS_FR,
  getBodyGoalLabel,
  getBodyGoalEmoji,
} from "../../../../utils/trainingPlanHelpers";
import { useToast } from "../../../../contexts/ToastContext";
import { InstallBanner } from "../../../ui/InstallPrompt";

function goalBadgeColor(goal: string | null | undefined): string {
  switch (goal) {
    case "muscle_gain":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "weight_loss":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "sport_perf":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "maintenance":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}

function PlanCard({
  plan,
  onDelete,
  onDuplicate,
}: {
  plan: TrainingPlan;
  onDelete: (id: string) => void;
  onDuplicate: (plan: TrainingPlan) => void;
}) {
  const daysLabel = plan.days
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((d) => DAYS_FR[d.dayOfWeek])
    .join(", ");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-none hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {plan.name}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.preventDefault(); onDuplicate(plan); }}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex-shrink-0"
            title="Dupliquer le plan"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(plan.id); }}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
            title="Supprimer le plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {plan.bodyGoal && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${goalBadgeColor(plan.bodyGoal)}`}
          >
            <span>{getBodyGoalEmoji(plan.bodyGoal)}</span>
            <span>{getBodyGoalLabel(plan.bodyGoal, plan.customGoal)}</span>
          </span>
        )}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            plan.isActive
              ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-500/30"
              : "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
          }`}
        >
          {plan.isActive ? "Actif" : "Inactif"}
        </span>
      </div>

      {/* Days summary */}
      {daysLabel && (
        <div className="py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium">{daysLabel}</span>
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 mt-auto">
        <Link
          to={`/dashboard/training-plans/${plan.id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
        >
          Ouvrir le plan
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

const TrainingPlanList: React.FC = () => {
  const navigate = useNavigate();
  const { plans, isLoading, error, deletePlan, createPlan } = useTrainingPlans();
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce plan d'entraînement ?"
      )
    )
      return;

    try {
      await deletePlan(id);
      showToast("Plan supprimé", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
        "error"
      );
    }
  };

  const handleDuplicate = async (plan: TrainingPlan) => {
    try {
      const days = plan.days.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        timeOfDay: d.timeOfDay,
        trainingType: d.trainingType,
        customType: d.customType ?? null,
        label: d.label ?? null,
        exercises: d.exercises.map((ex, idx) => ({
          exerciseId: ex.exerciseId,
          plannedSets: ex.plannedSets,
          plannedReps: ex.plannedReps,
          plannedWeightKg: ex.plannedWeightKg ?? null,
          orderIndex: idx,
        })),
      }));

      const created = await createPlan({
        name: `${plan.name} (copie)`,
        description: plan.description ?? null,
        bodyGoal: plan.bodyGoal ?? null,
        customGoal: plan.customGoal ?? null,
        initialWeightKg: plan.initialWeightKg ?? null,
        targetWeightKg: plan.targetWeightKg ?? null,
        initialNotes: plan.initialNotes ?? null,
        isActive: false,
        days,
      });
      showToast("Plan duplique !", "success");
      navigate(`/dashboard/training-plans/${created.id}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erreur lors de la duplication",
        "error"
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Install banner — visible if app not installed and modal was dismissed */}
      <InstallBanner />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mes Plans d'Entraînement
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Planifiez et suivez votre programme hebdomadaire
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/training-plans/new")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer un plan
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Aucun plan d'entraînement
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
            Créez votre premier plan pour structurer et suivre vos séances
            d'entraînement.
          </p>
          <button
            onClick={() => navigate("/dashboard/training-plans/new")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer mon premier plan
          </button>
        </div>
      )}

      {/* Plans grid */}
      {!isLoading && plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onDelete={handleDelete} onDuplicate={handleDuplicate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingPlanList;
