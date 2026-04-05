import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Search,
  Loader2,
  ArrowRight,
  Target,
  CalendarDays,
  Dumbbell,
  X,
} from "lucide-react";
import {
  TRAINING_TYPES,
  BODY_GOALS,
  DAYS_FULL_FR,
  getTrainingTypeLabel,
  getTrainingTypeEmoji,
} from "../../../../utils/trainingPlanHelpers";
import { useTrainingPlans } from "../../../../hooks/useTrainingPlans";
import { useToast } from "../../../../contexts/ToastContext";
import { Exercise } from "../../../../types";
import API_URL from "../../../../config/api";

// ---- Types for wizard state ----
interface DayConfig {
  dayOfWeek: number;
  timeOfDay: string;
  trainingType: string;
  customType: string;
  durationMinutes: string;
}

interface ExerciseEntry {
  exerciseId: string;
  exerciseName: string;
  plannedSets: number;
  plannedReps: number;
  plannedWeightKg: string;
  orderIndex: number;
}

interface WizardState {
  // Step 1
  name: string;
  description: string;
  bodyGoal: string;
  customGoal: string;
  initialWeightKg: string;
  targetWeightKg: string;
  initialNotes: string;
  // Step 2
  selectedDays: number[];
  dayConfigs: Record<number, DayConfig>;
  // Step 3
  exercisesByDay: Record<number, ExerciseEntry[]>;
}

// ---- Color coding for training types ----
const TYPE_COLORS: Record<string, string> = {
  full_body: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  upper_body: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  lower_body: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  push: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  pull: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  cardio: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  core: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  custom: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

function getTypeBadge(trainingType: string): string {
  return TYPE_COLORS[trainingType] ?? TYPE_COLORS.custom;
}

// ---- Step indicator ----
const STEP_LABELS = ["Objectifs", "Planning", "Exercices", "Récapitulatif"];
const TOTAL_STEPS = 4;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8 gap-1">
      {STEP_LABELS.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all ${
                currentStep > i + 1
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : currentStep === i + 1
                  ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/40"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
              }`}
            >
              {currentStep > i + 1 ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-tight text-center ${
                currentStep === i + 1 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {s}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-1 mt-4 sm:mt-5 transition-colors ${
                currentStep > i + 1 ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const TrainingPlanNew: React.FC = () => {
  const navigate = useNavigate();
  const { createPlan } = useTrainingPlans();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, setState] = useState<WizardState>({
    name: "",
    description: "",
    bodyGoal: "",
    customGoal: "",
    initialWeightKg: "",
    targetWeightKg: "",
    initialNotes: "",
    selectedDays: [],
    dayConfigs: {},
    exercisesByDay: {},
  });

  // Exercise search state
  const [searchQuery, setSearchQuery] = useState("");
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);

  useEffect(() => {
    if (step === 3) {
      fetchExercises();
    }
  }, [step]);

  const fetchExercises = async () => {
    setIsLoadingExercises(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/exercises`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAllExercises(Array.isArray(data) ? data : data.exercises ?? []);
      }
    } catch {
      // non-blocking
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const update = (patch: Partial<WizardState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const toggleDay = (day: number) => {
    const selected = state.selectedDays.includes(day)
      ? state.selectedDays.filter((d) => d !== day)
      : [...state.selectedDays, day];

    const configs = { ...state.dayConfigs };
    if (!configs[day]) {
      configs[day] = {
        dayOfWeek: day,
        timeOfDay: "08:00",
        trainingType: "full_body",
        customType: "",
        durationMinutes: "",
      };
    }
    update({ selectedDays: selected, dayConfigs: configs });
  };

  const updateDayConfig = (day: number, patch: Partial<DayConfig>) => {
    update({
      dayConfigs: {
        ...state.dayConfigs,
        [day]: { ...state.dayConfigs[day], ...patch },
      },
    });
  };

  const addExercise = (dayOfWeek: number, exercise: Exercise) => {
    const current = state.exercisesByDay[dayOfWeek] ?? [];
    if (current.some((e) => e.exerciseId === exercise.id)) return;
    update({
      exercisesByDay: {
        ...state.exercisesByDay,
        [dayOfWeek]: [
          ...current,
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            plannedSets: 3,
            plannedReps: 10,
            plannedWeightKg: "",
            orderIndex: current.length,
          },
        ],
      },
    });
  };

  const removeExercise = (dayOfWeek: number, exerciseId: string) => {
    update({
      exercisesByDay: {
        ...state.exercisesByDay,
        [dayOfWeek]: (state.exercisesByDay[dayOfWeek] ?? []).filter(
          (e) => e.exerciseId !== exerciseId
        ),
      },
    });
  };

  const updateExercise = (
    dayOfWeek: number,
    exerciseId: string,
    patch: Partial<ExerciseEntry>
  ) => {
    update({
      exercisesByDay: {
        ...state.exercisesByDay,
        [dayOfWeek]: (state.exercisesByDay[dayOfWeek] ?? []).map((e) =>
          e.exerciseId === exerciseId ? { ...e, ...patch } : e
        ),
      },
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const days = state.selectedDays.map((dayOfWeek) => {
        const config = state.dayConfigs[dayOfWeek];
        const exercises = (state.exercisesByDay[dayOfWeek] ?? []).map(
          (ex, idx) => ({
            exerciseId: ex.exerciseId,
            plannedSets: ex.plannedSets,
            plannedReps: ex.plannedReps,
            plannedWeightKg: ex.plannedWeightKg ? parseFloat(ex.plannedWeightKg) : null,
            orderIndex: idx,
          })
        );

        return {
          dayOfWeek,
          timeOfDay: config?.timeOfDay ?? "08:00",
          trainingType: config?.trainingType ?? "full_body",
          customType: config?.trainingType === "custom" ? config.customType : null,
          exercises,
          // durationMinutes is not sent to backend (not yet supported)
        };
      });

      const payload: Record<string, unknown> = {
        name: state.name,
        description: state.description || null,
        bodyGoal: state.bodyGoal || null,
        customGoal: state.bodyGoal === "custom" ? state.customGoal : null,
        initialWeightKg: state.initialWeightKg ? parseFloat(state.initialWeightKg) : null,
        targetWeightKg: state.targetWeightKg ? parseFloat(state.targetWeightKg) : null,
        initialNotes: state.initialNotes || null,
        isActive: true,
        days,
      };

      const created = await createPlan(payload);
      showToast("Plan créé avec succès !", "success");
      navigate(`/dashboard/training-plans/${created.id}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erreur lors de la création",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return state.name.trim() !== "" && state.bodyGoal !== "";
    if (step === 2) return state.selectedDays.length > 0;
    return true;
  };

  const sortedSelectedDays = [...state.selectedDays].sort((a, b) => a - b);

  // ---- STEP 1 ----
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Plan name — prominent */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Nom du plan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Ex: Programme force 3 jours"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 dark:placeholder-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Description
        </label>
        <textarea
          value={state.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Décrivez votre plan..."
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Body goal — large cards */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Objectif <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BODY_GOALS.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => update({ bodyGoal: goal.value })}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                state.bodyGoal === goal.value
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm shadow-indigo-100 dark:shadow-indigo-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <span className="text-4xl">{goal.emoji}</span>
              <span className={`text-sm font-medium text-center ${state.bodyGoal === goal.value ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}>
                {goal.label}
              </span>
              {state.bodyGoal === goal.value && (
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {state.bodyGoal === "custom" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Précisez votre objectif
          </label>
          <input
            type="text"
            value={state.customGoal}
            onChange={(e) => update({ customGoal: e.target.value })}
            placeholder="Décrivez votre objectif personnalisé"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Weight inputs side by side with arrow */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Poids (kg)
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">Initial</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={state.initialWeightKg}
              onChange={(e) => update({ initialWeightKg: e.target.value })}
              placeholder="70"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col items-center gap-1 mt-5">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">Cible</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={state.targetWeightKg}
              onChange={(e) => update({ targetWeightKg: e.target.value })}
              placeholder="75"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Notes pour l'IA
        </label>
        <textarea
          value={state.initialNotes}
          onChange={(e) => update({ initialNotes: e.target.value })}
          placeholder="Infos supplémentaires... (blessures, disponibilités, matériel...)"
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all shadow-sm"
        />
        <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Plus vous donnez de contexte, plus les conseils seront précis
        </p>
      </div>
    </div>
  );

  // ---- STEP 2 ----
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Sélectionnez vos jours d'entraînement
        </label>
        {/* Full day names on desktop, abbreviated on mobile */}
        <div className="flex flex-wrap gap-2">
          {DAYS_FULL_FR.map((dayName, dayIndex) => (
            <button
              key={dayIndex}
              type="button"
              onClick={() => toggleDay(dayIndex)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                state.selectedDays.includes(dayIndex)
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="hidden sm:inline">{dayName}</span>
              <span className="sm:hidden">{dayName.slice(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>

      {sortedSelectedDays.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Configuration des jours
          </h3>
          {sortedSelectedDays.map((dayOfWeek) => {
            const config = state.dayConfigs[dayOfWeek];
            return (
              <div
                key={dayOfWeek}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
              >
                {/* Day header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {DAYS_FULL_FR[dayOfWeek]}
                    </h4>
                  </div>
                  {config?.trainingType && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getTypeBadge(config.trainingType)}`}>
                      {getTrainingTypeEmoji(config.trainingType)} {getTrainingTypeLabel(config.trainingType, config.customType)}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Heure</label>
                      <input
                        type="time"
                        value={config?.timeOfDay ?? "08:00"}
                        onChange={(e) => updateDayConfig(dayOfWeek, { timeOfDay: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Type</label>
                      <select
                        value={config?.trainingType ?? "full_body"}
                        onChange={(e) => updateDayConfig(dayOfWeek, { trainingType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {TRAINING_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.emoji} {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Durée cible</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={config?.durationMinutes ?? ""}
                          onChange={(e) => updateDayConfig(dayOfWeek, { durationMinutes: e.target.value })}
                          placeholder="60"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">MIN</span>
                      </div>
                    </div>
                  </div>
                  {config?.trainingType === "custom" && (
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Label personnalisé
                      </label>
                      <input
                        type="text"
                        value={config.customType}
                        onChange={(e) => updateDayConfig(dayOfWeek, { customType: e.target.value })}
                        placeholder="Ex: Mobility & Stretching"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ---- STEP 3 ----
  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Skip link */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ajoutez des exercices pour chaque jour (optionnel).
        </p>
        <button
          type="button"
          onClick={() => setStep(4)}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex-shrink-0"
        >
          Passer cette étape
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 -mt-4">
        Vous pourrez ajouter des exercices depuis le dashboard
      </p>

      {isLoadingExercises && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* Global search — always visible */}
      {!isLoadingExercises && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un exercice..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {!isLoadingExercises &&
        sortedSelectedDays.map((dayOfWeek) => {
          const config = state.dayConfigs[dayOfWeek];
          const exercises = state.exercisesByDay[dayOfWeek] ?? [];

          return (
            <div key={dayOfWeek} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Day header with training type badge */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <Dumbbell className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {DAYS_FULL_FR[dayOfWeek]}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getTypeBadge(config?.trainingType ?? "custom")}`}>
                  {getTrainingTypeEmoji(config?.trainingType ?? "custom")}{" "}
                  {getTrainingTypeLabel(config?.trainingType, config?.customType)}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {/* Exercise search results (only when there's a query) */}
                {searchQuery.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900">
                    {filteredExercises.slice(0, 30).map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          addExercise(dayOfWeek, ex);
                          setSearchQuery("");
                        }}
                        disabled={exercises.some((e) => e.exerciseId === ex.id)}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between"
                      >
                        <span>{ex.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{ex.category}</span>
                      </button>
                    ))}
                    {filteredExercises.length === 0 && (
                      <p className="text-xs text-gray-400 px-3 py-2 text-center">Aucun exercice trouvé</p>
                    )}
                  </div>
                )}

                {/* Added exercises as compact chips with inline edit */}
                {exercises.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {exercises.map((ex) => (
                      <div
                        key={ex.exerciseId}
                        className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-full text-sm text-indigo-700 dark:text-indigo-300 group"
                      >
                        <span className="font-medium text-xs">{ex.exerciseName}</span>
                        <span className="text-xs text-indigo-500 dark:text-indigo-400">
                          {ex.plannedSets}×{ex.plannedReps}
                          {ex.plannedWeightKg && ` @${ex.plannedWeightKg}kg`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExercise(dayOfWeek, ex.exerciseId)}
                          className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-2">
                    Aucun exercice — recherchez ci-dessus pour en ajouter
                  </p>
                )}

                {/* Edit sets/reps for each exercise */}
                {exercises.length > 0 && (
                  <div className="space-y-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ajuster les séries & répétitions</p>
                    {exercises.map((ex) => (
                      <div key={ex.exerciseId} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 truncate">{ex.exerciseName}</span>
                        <div className="flex items-center gap-4 sm:gap-2">
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Sets</span>
                            <input
                              type="number"
                              min="1"
                              value={ex.plannedSets}
                              onChange={(e) => updateExercise(dayOfWeek, ex.exerciseId, { plannedSets: parseInt(e.target.value) || 1 })}
                              className="w-14 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <span className="mt-5 text-slate-300">×</span>
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Reps</span>
                            <input
                              type="number"
                              min="1"
                              value={ex.plannedReps}
                              onChange={(e) => updateExercise(dayOfWeek, ex.exerciseId, { plannedReps: parseInt(e.target.value) || 1 })}
                              className="w-14 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">KG</span>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={ex.plannedWeightKg}
                              onChange={(e) => updateExercise(dayOfWeek, ex.exerciseId, { plannedWeightKg: e.target.value })}
                              placeholder="—"
                              className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExercise(dayOfWeek, ex.exerciseId)}
                            className="mt-5 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );

  // ---- STEP 4 (Summary) ----
  const renderStep4 = () => {
    const goalData = BODY_GOALS.find((g) => g.value === state.bodyGoal);

    return (
      <div className="space-y-5">
        {/* Preview card */}
        <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900 overflow-hidden">
          <div className="px-6 py-5 border-b border-indigo-100 dark:border-indigo-800/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{state.name || "Mon plan"}</h3>
                {state.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{state.description}</p>
                )}
              </div>
              {goalData && (
                <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                  <span>{goalData.emoji}</span>
                  <span>{goalData.label}</span>
                </span>
              )}
            </div>
            {(state.initialWeightKg || state.targetWeightKg) && (
              <div className="flex items-center gap-2 mt-3 text-sm">
                <Target className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {state.initialWeightKg ? `${state.initialWeightKg} kg` : "?"}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {state.targetWeightKg ? `${state.targetWeightKg} kg` : "?"}
                </span>
              </div>
            )}
          </div>

          {/* Day list */}
          {sortedSelectedDays.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {sortedSelectedDays.length} jour{sortedSelectedDays.length > 1 ? "s" : ""} d'entraînement
              </p>
              <div className="space-y-2">
                {sortedSelectedDays.map((dayOfWeek) => {
                  const config = state.dayConfigs[dayOfWeek];
                  const exercises = state.exercisesByDay[dayOfWeek] ?? [];
                  return (
                    <div
                      key={dayOfWeek}
                      className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {DAYS_FULL_FR[dayOfWeek]}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {config?.timeOfDay}
                            {config?.durationMinutes && ` · ${config.durationMinutes} min`}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getTypeBadge(config?.trainingType ?? "custom")}`}>
                          {getTrainingTypeEmoji(config?.trainingType ?? "custom")}{" "}
                          {getTrainingTypeLabel(config?.trainingType, config?.customType)}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {exercises.length} ex.
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">Tout est prêt !</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Vous pourrez modifier votre plan et ajouter des exercices depuis le dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate("/dashboard/training-plans")}
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Mes plans
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Créer un plan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Étape {step} sur {TOTAL_STEPS}
        </p>
      </div>

      <StepIndicator currentStep={step} />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          )}
          <div className="flex-1" />
          {step < TOTAL_STEPS && (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canGoNext()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === TOTAL_STEPS && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Créer mon plan
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanNew;
