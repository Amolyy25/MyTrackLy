import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Target, Plus, ChevronRight, CheckCircle2, Circle, Flame, Sparkles } from "lucide-react";
import { useHabits, useCheckHabit, useUncheckHabit, useCreateHabit } from "../../../../hooks/useHabits";
import { useToast } from "../../../../contexts/ToastContext";
import { getCategoryEmoji } from "../../../../utils/habitHelpers";
import { getSuggestedHabits } from "../../../../utils/habitHelpers";
import { Habit } from "../../../../types";

interface PlanHabitsWidgetProps {
  planId: string;
  bodyGoal?: string | null;
}

const PlanHabitsWidget: React.FC<PlanHabitsWidgetProps> = ({ planId, bodyGoal }) => {
  const { showToast } = useToast();
  const { habits, isLoading, refetch } = useHabits();
  const { checkHabit, isLoading: isChecking } = useCheckHabit();
  const { uncheckHabit, isLoading: isUnchecking } = useUncheckHabit();
  const { createHabit, isLoading: isCreating } = useCreateHabit();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const todayHabits = habits.filter((h) => {
    if (h.targetFrequency === "DAILY") return true;
    return !h.completedToday;
  });

  const completed = todayHabits.filter((h) => h.completedToday).length;
  const total = todayHabits.length;

  const suggestions = getSuggestedHabits(bodyGoal);
  const existingNames = new Set(habits.map((h) => h.name.toLowerCase()));
  const newSuggestions = suggestions.filter((s) => !existingNames.has(s.name.toLowerCase()));

  const handleCheck = async (habit: Habit) => {
    try {
      if (habit.completedToday) {
        await uncheckHabit(habit.id);
      } else {
        await checkHabit(habit.id);
      }
      await refetch();
    } catch {
      showToast("Erreur", "error");
    }
  };

  const handleAddSuggestion = async (suggestion: typeof suggestions[0]) => {
    try {
      await createHabit({
        name: suggestion.name,
        category: suggestion.category,
        targetFrequency: "DAILY",
        targetCount: suggestion.targetCount,
        reminderEnabled: true,
      });
      await refetch();
      showToast(`"${suggestion.name}" ajoutee !`, "success");
    } catch {
      showToast("Erreur lors de la creation", "error");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          Habitudes du jour
        </h3>
        {total > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
            <Sparkles className="w-3 h-3" />
            {completed}/{total}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : total === 0 ? (
        <div className="text-center py-6">
          <Target className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Aucune habitude</p>
          <button
            onClick={() => setShowSuggestions(true)}
            className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            Ajouter des habitudes suggerees
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {todayHabits.slice(0, 5).map((habit) => {
            const emoji = habit.icon || getCategoryEmoji(habit.category);
            const done = habit.completedToday;
            return (
              <button
                key={habit.id}
                onClick={() => handleCheck(habit)}
                disabled={isChecking || isUnchecking}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                  done
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/40 hover:border-emerald-200 dark:hover:border-emerald-500/20"
                }`}
              >
                <span className="text-lg">{emoji}</span>
                <span className={`flex-1 text-sm font-medium text-left truncate ${done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                  {habit.name}
                </span>
                {habit.currentStreak > 0 && (
                  <span className="text-[10px] font-bold text-orange-500 flex items-center gap-0.5 flex-shrink-0">
                    <Flame className="w-3 h-3" />
                    {habit.currentStreak}
                  </span>
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? "bg-emerald-500 text-white" : "border-2 border-slate-200 dark:border-slate-600"
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-slate-300" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Suggestions based on body goal */}
      {(showSuggestions || total === 0) && newSuggestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Suggerees pour votre objectif
          </p>
          {newSuggestions.slice(0, 4).map((s, i) => (
            <button
              key={i}
              onClick={() => handleAddSuggestion(s)}
              disabled={isCreating}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all active:scale-[0.98]"
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="flex-1 text-sm font-medium text-left truncate">{s.name}</span>
              <Plus className="w-4 h-4 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Link to full habits page */}
      <Link
        to="/dashboard/habits"
        className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-400 hover:text-emerald-500 transition-colors"
      >
        Gerer mes habitudes
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

export default PlanHabitsWidget;
