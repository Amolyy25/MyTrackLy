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
} from "lucide-react";
import {
  TRAINING_TYPES,
  BODY_GOALS,
  DAYS_FULL_FR,
  getTrainingTypeLabel,
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

// ---- Progress Bar ----
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-8">
      <div
        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${((step) / total) * 100}%` }}
      />
    </div>
  );
}

const TOTAL_STEPS = 4;

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
  const [activeDaySearch, setActiveDaySearch] = useState<number | null>(null);

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
            plannedWeightKg: ex.plannedWeightKg
              ? parseFloat(ex.plannedWeightKg)
              : null,
            orderIndex: idx,
          })
        );

        return {
          dayOfWeek,
          timeOfDay: config?.timeOfDay ?? "08:00",
          trainingType: config?.trainingType ?? "full_body",
          customType:
            config?.trainingType === "custom" ? config.customType : null,
          exercises,
        };
      });

      const payload: Record<string, unknown> = {
        name: state.name,
        description: state.description || null,
        bodyGoal: state.bodyGoal || null,
        customGoal: state.bodyGoal === "custom" ? state.customGoal : null,
        initialWeightKg: state.initialWeightKg
          ? parseFloat(state.initialWeightKg)
          : null,
        targetWeightKg: state.targetWeightKg
          ? parseFloat(state.targetWeightKg)
          : null,
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
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Nom du plan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Ex: Programme force 3 jours"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Objectif <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BODY_GOALS.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => update({ bodyGoal: goal.value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                state.bodyGoal === goal.value
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="text-2xl">{goal.emoji}</span>
              <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300">
                {goal.label}
              </span>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Poids initial (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={state.initialWeightKg}
            onChange={(e) => update({ initialWeightKg: e.target.value })}
            placeholder="70"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Poids cible (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={state.targetWeightKg}
            onChange={(e) => update({ targetWeightKg: e.target.value })}
            placeholder="75"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Infos supplémentaires pour l'IA
        </label>
        <textarea
          value={state.initialNotes}
          onChange={(e) => update({ initialNotes: e.target.value })}
          placeholder="Infos supplémentaires pour l'IA... (blessures, disponibilités, matériel...)"
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
    </div>
  );

  // ---- STEP 2 ----
  const renderStep2 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sélectionnez vos jours d'entraînement
        </label>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS_FULL_FR.map((dayName, dayIndex) => (
            <button
              key={dayIndex}
              type="button"
              onClick={() => toggleDay(dayIndex)}
              className={`py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                state.selectedDays.includes(dayIndex)
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {dayName.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {sortedSelectedDays.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Configuration des jours sélectionnés
          </h3>
          {sortedSelectedDays.map((dayOfWeek) => {
            const config = state.dayConfigs[dayOfWeek];
            return (
              <div
                key={dayOfWeek}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3"
              >
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {DAYS_FULL_FR[dayOfWeek]}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={config?.timeOfDay ?? "08:00"}
                      onChange={(e) =>
                        updateDayConfig(dayOfWeek, { timeOfDay: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Type de séance
                    </label>
                    <select
                      value={config?.trainingType ?? "full_body"}
                      onChange={(e) =>
                        updateDayConfig(dayOfWeek, { trainingType: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {TRAINING_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.emoji} {t.label}
                        </option>
                      ))}
                    </select>
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
                      onChange={(e) =>
                        updateDayConfig(dayOfWeek, { customType: e.target.value })
                      }
                      placeholder="Ex: Mobility & Stretching"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
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
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Ajoutez des exercices pour chaque jour (optionnel).
      </p>

      {isLoadingExercises && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      )}

      {!isLoadingExercises &&
        sortedSelectedDays.map((dayOfWeek) => {
          const config = state.dayConfigs[dayOfWeek];
          const exercises = state.exercisesByDay[dayOfWeek] ?? [];
          const isActive = activeDaySearch === dayOfWeek;

          return (
            <div key={dayOfWeek} className="space-y-3">
              {/* Day header */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{DAYS_FULL_FR[dayOfWeek]}</span>
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    —{" "}
                    {getTrainingTypeLabel(
                      config?.trainingType,
                      config?.customType
                    )}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setActiveDaySearch(isActive ? null : dayOfWeek)
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter un exercice
                </button>
              </div>

              {/* Search */}
              {isActive && (
                <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un exercice..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredExercises.slice(0, 30).map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          addExercise(dayOfWeek, ex);
                          setActiveDaySearch(null);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {ex.name}
                        <span className="ml-2 text-xs text-gray-400">
                          {ex.category}
                        </span>
                      </button>
                    ))}
                    {filteredExercises.length === 0 && (
                      <p className="text-xs text-gray-400 px-3 py-2">
                        Aucun exercice trouvé
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Exercises list */}
              {exercises.length > 0 && (
                <div className="space-y-2">
                  {exercises.map((ex) => (
                    <div
                      key={ex.exerciseId}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {ex.exerciseName}
                        </p>
                        <div className="flex gap-2 mt-1.5 items-center flex-wrap">
                          <label className="text-xs text-gray-400">Séries</label>
                          <input
                            type="number"
                            min="1"
                            value={ex.plannedSets}
                            onChange={(e) =>
                              updateExercise(dayOfWeek, ex.exerciseId, {
                                plannedSets: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-14 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <label className="text-xs text-gray-400">Reps</label>
                          <input
                            type="number"
                            min="1"
                            value={ex.plannedReps}
                            onChange={(e) =>
                              updateExercise(dayOfWeek, ex.exerciseId, {
                                plannedReps: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-14 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <label className="text-xs text-gray-400">Poids</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={ex.plannedWeightKg}
                            onChange={(e) =>
                              updateExercise(dayOfWeek, ex.exerciseId, {
                                plannedWeightKg: e.target.value,
                              })
                            }
                            placeholder="kg"
                            className="w-16 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExercise(dayOfWeek, ex.exerciseId)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {exercises.length === 0 && !isActive && (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                  Aucun exercice ajouté pour ce jour
                </p>
              )}
            </div>
          );
        })}
    </div>
  );

  // ---- STEP 4 (Summary) ----
  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
        <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-base">
          {state.name}
        </h3>
        {state.description && (
          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
            {state.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {state.bodyGoal && (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Objectif</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {
                BODY_GOALS.find((g) => g.value === state.bodyGoal)?.label ??
                state.customGoal
              }
            </p>
          </div>
        )}
        {(state.initialWeightKg || state.targetWeightKg) && (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Poids</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {state.initialWeightKg && `${state.initialWeightKg} kg`}
              {state.initialWeightKg && state.targetWeightKg && " → "}
              {state.targetWeightKg && `${state.targetWeightKg} kg`}
            </p>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Planning ({sortedSelectedDays.length} jour
          {sortedSelectedDays.length > 1 ? "s" : ""})
        </h4>
        <div className="space-y-2">
          {sortedSelectedDays.map((dayOfWeek) => {
            const config = state.dayConfigs[dayOfWeek];
            const exercises = state.exercisesByDay[dayOfWeek] ?? [];
            return (
              <div
                key={dayOfWeek}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {DAYS_FULL_FR[dayOfWeek]}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {config?.timeOfDay} —{" "}
                    {getTrainingTypeLabel(config?.trainingType, config?.customType)}
                  </span>
                </div>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {exercises.length} exercice{exercises.length !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const stepTitles = [
    "Objectifs",
    "Planning hebdomadaire",
    "Exercices",
    "Récapitulatif",
  ];

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

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Créer un plan
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Étape {step} sur {TOTAL_STEPS} — {stepTitles[step - 1]}
      </p>

      <ProgressBar step={step} total={TOTAL_STEPS} />

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
