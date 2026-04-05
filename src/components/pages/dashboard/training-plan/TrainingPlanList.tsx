import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useTrainingPlans } from "../../../../hooks/useTrainingPlans";
import { TrainingPlan } from "../../../../types";
import {
  DAYS_FR,
  getBodyGoalLabel,
  getBodyGoalEmoji,
} from "../../../../utils/trainingPlanHelpers";
import { useToast } from "../../../../contexts/ToastContext";

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
}: {
  plan: TrainingPlan;
  onDelete: (id: string) => void;
}) {
  const daysLabel = plan.days
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((d) => DAYS_FR[d.dayOfWeek])
    .join(", ");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
          {plan.name}
        </h3>
        <button
          onClick={() => onDelete(plan.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
          title="Supprimer le plan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {plan.bodyGoal && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${goalBadgeColor(plan.bodyGoal)}`}
          >
            <span>{getBodyGoalEmoji(plan.bodyGoal)}</span>
            <span>{getBodyGoalLabel(plan.bodyGoal, plan.customGoal)}</span>
          </span>
        )}
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            plan.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {plan.isActive ? "Actif" : "Inactif"}
        </span>
      </div>

      {/* Days summary */}
      {daysLabel && (
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{daysLabel}</span>
        </p>
      )}

      {/* Footer */}
      <div className="pt-1">
        <Link
          to={`/dashboard/training-plans/${plan.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          Voir le plan
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

const TrainingPlanList: React.FC = () => {
  const navigate = useNavigate();
  const { plans, isLoading, error, deletePlan } = useTrainingPlans();
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
            <PlanCard key={plan.id} plan={plan} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingPlanList;
