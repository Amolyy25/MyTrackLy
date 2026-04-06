import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronUp, Search, Loader2, Dumbbell, Clock, Save } from "lucide-react";
import { PlanDay, Exercise } from "../../../../types";
import { DAYS_FULL_FR, getMoodEmoji, getTrainingTypeLabel, getTrainingTypeEmoji } from "../../../../utils/trainingPlanHelpers";
import { useToast } from "../../../../contexts/ToastContext";
import API_URL from "../../../../config/api";

interface LogPlanSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planDay?: PlanDay | null;
  onSuccess: () => void;
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repsType: "uniform" | "variable";
  repsUniform: number;
  repsPerSet: number[];
  weightKg: number;
  restSeconds: number;
  notes: string;
  isExpanded: boolean;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

const LogPlanSessionModal: React.FC<LogPlanSessionModalProps> = ({
  isOpen,
  onClose,
  planId,
  planDay,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  // Step management: 1 = exercises, 2 = mood/notes
  const [step, setStep] = useState(1);

  // Session data
  const [date, setDate] = useState(today);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  // Mood data
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [performanceNote, setPerformanceNote] = useState("");
  const [skipped, setSkipped] = useState(false);
  const [skipReason, setSkipReason] = useState("");

  // Add exercise
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayLabel = planDay ? planDay.label || DAYS_FULL_FR[planDay.dayOfWeek] : null;

  // Pre-fill exercises from plan day
  useEffect(() => {
    if (isOpen && planDay) {
      setStep(1);
      setDate(today);
      setSkipped(false);
      setMoodScore(null);
      setMoodNote("");
      setPerformanceNote("");
      setSkipReason("");

      const logs: ExerciseLog[] = (planDay.exercises ?? []).map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exercise?.name ?? "Exercice",
        sets: ex.plannedSets,
        repsType: "uniform",
        repsUniform: ex.plannedReps,
        repsPerSet: Array(ex.plannedSets).fill(ex.plannedReps),
        weightKg: ex.plannedWeightKg ?? 0,
        restSeconds: 90,
        notes: "",
        isExpanded: false,
      }));
      setExerciseLogs(logs);
    }
  }, [isOpen, planDay]);

  // Fetch exercise library when search opens
  useEffect(() => {
    if (showSearch && allExercises.length === 0) {
      setLoadingExercises(true);
      fetch(`${API_URL}/exercises`, { headers: authHeaders() })
        .then((r) => r.json())
        .then((d) => setAllExercises(Array.isArray(d) ? d : d.exercises ?? []))
        .catch(() => {})
        .finally(() => setLoadingExercises(false));
    }
  }, [showSearch]);

  if (!isOpen) return null;

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exerciseLogs];
    const ex = { ...updated[index] };

    if (field === "sets") {
      ex.sets = Math.max(1, Number(value) || 1);
      if (ex.repsType === "variable") {
        const current = ex.repsPerSet.length;
        if (ex.sets > current) {
          ex.repsPerSet = [...ex.repsPerSet, ...Array(ex.sets - current).fill(ex.repsUniform)];
        } else {
          ex.repsPerSet = ex.repsPerSet.slice(0, ex.sets);
        }
      }
    } else if (field === "repsUniform") {
      ex.repsUniform = Math.max(0, Number(value) || 0);
    } else if (field === "weightKg") {
      ex.weightKg = Math.max(0, Number(value) || 0);
    } else if (field === "restSeconds") {
      ex.restSeconds = Math.max(0, Number(value) || 0);
    } else if (field === "repsType") {
      ex.repsType = value;
      if (value === "variable") {
        ex.repsPerSet = Array(ex.sets).fill(ex.repsUniform);
      }
    } else if (field === "notes") {
      ex.notes = value;
    } else if (field === "isExpanded") {
      ex.isExpanded = value;
    }

    updated[index] = ex;
    setExerciseLogs(updated);
  };

  const updateRepForSet = (exIndex: number, setIndex: number, value: string) => {
    const updated = [...exerciseLogs];
    const reps = [...updated[exIndex].repsPerSet];
    reps[setIndex] = Math.max(0, Number(value) || 0);
    updated[exIndex] = { ...updated[exIndex], repsPerSet: reps };
    setExerciseLogs(updated);
  };

  const removeExercise = (index: number) => {
    setExerciseLogs(exerciseLogs.filter((_, i) => i !== index));
  };

  const addExercise = (exercise: { id: string; name: string }) => {
    setExerciseLogs([
      ...exerciseLogs,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: 3,
        repsType: "uniform",
        repsUniform: 10,
        repsPerSet: [10, 10, 10],
        weightKg: 0,
        restSeconds: 90,
        notes: "",
        isExpanded: true,
      },
    ]);
    setShowSearch(false);
    setSearchQ("");
  };

  const addCustomExercise = (name: string) => {
    addExercise({ id: `custom-${Date.now()}`, name });
  };

  const totalVolume = exerciseLogs.reduce((sum, ex) => {
    const reps = ex.repsType === "uniform" ? ex.sets * ex.repsUniform : ex.repsPerSet.reduce((s, r) => s + r, 0);
    return sum + reps * ex.weightKg;
  }, 0);

  const totalSets = exerciseLogs.reduce((s, ex) => s + ex.sets, 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifie");

      if (!skipped && exerciseLogs.length > 0) {
        // 1. Create a real training session
        const sessionPayload = {
          date,
          durationMinutes,
          notes: performanceNote || undefined,
          exercises: exerciseLogs.map((ex, idx) => ({
            exerciseId: ex.exerciseId,
            ...(ex.exerciseId.startsWith("custom-") && {
              exerciseName: ex.exerciseName,
              exerciseCategory: "other",
              exerciseDefaultUnit: "reps",
            }),
            sets: ex.sets,
            repsUniform: ex.repsType === "uniform" ? ex.repsUniform : undefined,
            repsPerSet: ex.repsType === "variable" ? ex.repsPerSet : undefined,
            weightKg: ex.weightKg,
            restSeconds: ex.restSeconds,
            notes: ex.notes || undefined,
            orderIndex: idx,
          })),
        };

        const sessionRes = await fetch(`${API_URL}/training-sessions`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(sessionPayload),
        });

        if (!sessionRes.ok) {
          const err = await sessionRes.json().catch(() => ({}));
          throw new Error(err.message || "Erreur creation seance");
        }

        const createdSession = await sessionRes.json();

        // 2. Also log it as a plan session for progress tracking
        const planLogPayload: Record<string, unknown> = {
          date,
          skipped: false,
          trainingSessionId: createdSession.id,
        };
        if (planDay?.id) planLogPayload.planDayId = planDay.id;
        if (moodScore !== null) planLogPayload.moodScore = moodScore;
        if (moodNote.trim()) planLogPayload.moodNote = moodNote.trim();
        if (performanceNote.trim()) planLogPayload.performanceNote = performanceNote.trim();

        await fetch(`${API_URL}/training-plans/${planId}/log-session`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(planLogPayload),
        });
      } else {
        // Skipped session — just log the plan session
        const payload: Record<string, unknown> = { date, skipped: true };
        if (planDay?.id) payload.planDayId = planDay.id;
        if (moodScore !== null) payload.moodScore = moodScore;
        if (moodNote.trim()) payload.moodNote = moodNote.trim();
        if (skipReason.trim()) payload.skipReason = skipReason.trim();

        const res = await fetch(`${API_URL}/training-plans/${planId}/log-session`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur enregistrement");
      }

      showToast("Seance enregistree !", "success");
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Une erreur est survenue", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSearch = allExercises
    .filter((ex) => ex.name.toLowerCase().includes(searchQ.toLowerCase()))
    .filter((ex) => !exerciseLogs.some((l) => l.exerciseId === ex.id))
    .slice(0, 20);

  const moodOptions = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col sm:mx-4 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Logger ma seance
            </h2>
            {dayLabel && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1.5">
                {planDay && getTrainingTypeEmoji(planDay.trainingType)} {dayLabel}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={() => !skipped && setStep(1)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              step === 1 ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600" : "text-gray-400"
            } ${skipped ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              Exercices
            </span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              step === 2 ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600" : "text-gray-400"
            }`}
          >
            Ressenti
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {step === 1 && !skipped ? (
            /* ── Step 1: Exercises ── */
            <div className="p-4 space-y-3">
              {/* Date & duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Duree (min)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Stats bar */}
              {exerciseLogs.length > 0 && (
                <div className="flex gap-3 text-center">
                  <div className="flex-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl py-2">
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{exerciseLogs.length}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Exos</p>
                  </div>
                  <div className="flex-1 bg-violet-50 dark:bg-violet-500/10 rounded-xl py-2">
                    <p className="text-lg font-black text-violet-600 dark:text-violet-400">{totalSets}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Series</p>
                  </div>
                  <div className="flex-1 bg-purple-50 dark:bg-purple-500/10 rounded-xl py-2">
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400">{totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}t` : "—"}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Volume</p>
                  </div>
                </div>
              )}

              {/* Exercise list */}
              {exerciseLogs.map((ex, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-800/30">
                  {/* Exercise header */}
                  <button
                    onClick={() => updateExercise(i, "isExpanded", !ex.isExpanded)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100/50 dark:hover:bg-gray-700/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white truncate">{ex.exerciseName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-700">
                        {ex.sets}x{ex.repsUniform} {ex.weightKg > 0 && `@${ex.weightKg}kg`}
                      </span>
                      {ex.isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {ex.isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-700/50 pt-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Series</label>
                          <input
                            type="number" min="1"
                            value={ex.sets}
                            onChange={(e) => updateExercise(i, "sets", e.target.value)}
                            className="w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Reps</label>
                          <input
                            type="number" min="0"
                            value={ex.repsUniform}
                            onChange={(e) => updateExercise(i, "repsUniform", e.target.value)}
                            className="w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Poids (kg)</label>
                          <input
                            type="number" min="0" step="0.5"
                            value={ex.weightKg || ""}
                            onChange={(e) => updateExercise(i, "weightKg", e.target.value)}
                            placeholder="—"
                            className="w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Variable reps toggle */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => updateExercise(i, "repsType", ex.repsType === "uniform" ? "variable" : "uniform")}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
                            ex.repsType === "variable"
                              ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {ex.repsType === "variable" ? "Reps variables" : "Reps par serie ?"}
                        </button>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <input
                              type="number" min="0" step="15"
                              value={ex.restSeconds}
                              onChange={(e) => updateExercise(i, "restSeconds", e.target.value)}
                              className="w-10 text-center bg-transparent text-[11px] font-bold text-gray-600 dark:text-gray-300 focus:outline-none"
                            />
                            <span className="text-[9px] text-gray-400">s</span>
                          </div>
                          <button
                            onClick={() => removeExercise(i)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Variable reps inputs */}
                      {ex.repsType === "variable" && (
                        <div className="grid grid-cols-5 gap-1.5">
                          {ex.repsPerSet.map((rep, si) => (
                            <div key={si} className="text-center">
                              <label className="block text-[8px] font-bold text-gray-400 mb-0.5">S{si + 1}</label>
                              <input
                                type="number" min="0"
                                value={rep}
                                onChange={(e) => updateRepForSet(i, si, e.target.value)}
                                className="w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-1 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      <input
                        type="text"
                        value={ex.notes}
                        onChange={(e) => updateExercise(i, "notes", e.target.value)}
                        placeholder="Notes (optionnel)..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Add exercise */}
              {showSearch ? (
                <div className="border border-indigo-200 dark:border-indigo-500/30 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        placeholder="Rechercher un exercice..."
                        className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button onClick={() => { setShowSearch(false); setSearchQ(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {loadingExercises ? (
                      <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>
                    ) : (
                      <>
                        {filteredSearch.map((ex) => (
                          <button
                            key={ex.id}
                            onClick={() => addExercise(ex)}
                            className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between transition-colors"
                          >
                            <span className="truncate">{ex.name}</span>
                            <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{ex.category}</span>
                          </button>
                        ))}
                        {searchQ.trim() && !allExercises.some((e) => e.name.toLowerCase() === searchQ.toLowerCase()) && (
                          <button
                            onClick={() => addCustomExercise(searchQ.trim())}
                            className="w-full text-left px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Creer "{searchQ}"
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un exercice
                </button>
              )}
            </div>
          ) : (
            /* ── Step 2: Mood & notes (or skip) ── */
            <div className="p-4 space-y-4">
              {/* Skip toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input
                  type="checkbox"
                  checked={skipped}
                  onChange={(e) => { setSkipped(e.target.checked); if (e.target.checked) setStep(2); }}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  J'ai saute cette seance
                </span>
              </label>

              {skipped && (
                <textarea
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="Pourquoi ? (optionnel)"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                />
              )}

              {!skipped && (
                <>
                  {/* Mood picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment s'est passee la seance ?
                    </label>
                    <div className="flex gap-3 justify-center">
                      {moodOptions.map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setMoodScore(score === moodScore ? null : score)}
                          className={`text-3xl p-2 rounded-xl transition-all ${
                            moodScore === score
                              ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-110"
                              : "hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {getMoodEmoji(score)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mood note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ressenti</label>
                    <textarea
                      value={moodNote}
                      onChange={(e) => setMoodNote(e.target.value)}
                      placeholder="Comment tu te sens ? Raconte ta seance..."
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                    />
                  </div>

                  {/* Performance note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes de performance</label>
                    <textarea
                      value={performanceNote}
                      onChange={(e) => setPerformanceNote(e.target.value)}
                      placeholder="Notes libres (PRs, sensations, ajustements...)"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          {step === 1 && !skipped ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                Suivant
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </button>
            </>
          ) : (
            <>
              {!skipped && (
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Retour
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </>
          )}
        </div>

        <div className="h-[env(safe-area-inset-bottom)] flex-shrink-0" />
      </div>
    </div>
  );
};

export default LogPlanSessionModal;
