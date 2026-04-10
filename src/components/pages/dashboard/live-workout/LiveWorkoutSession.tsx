import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Search,
  Timer,
  X,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { useToast } from "../../../../contexts/ToastContext";
import { ExerciseInfoButton } from "../../../composants/ExerciseInfoSheet";
import {
  useWorkoutAutoSave,
  clearSavedWorkout,
  getSavedWorkout,
  type WorkoutSessionData,
  type WorkoutExerciseData,
  type WorkoutSetData,
} from "../../../../hooks/useWorkoutAutoSave";
import { useWakeLock } from "../../../../hooks/useWakeLock";
import {
  getMoodEmoji,
  getTrainingTypeLabel,
  getTrainingTypeEmoji,
  DAYS_FULL_FR,
} from "../../../../utils/trainingPlanHelpers";
import { Exercise } from "../../../../types";
import API_URL from "../../../../config/api";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

function vibrate(ms = 30) {
  try { navigator.vibrate?.(ms); } catch {}
}

function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${String(m % 60).padStart(2, "0")}`;
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

// ─── REST TIMER ─────────────────────────────────────────────────────────────
interface RestTimerProps {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ seconds, onDone, onSkip }) => {
  const [remaining, setRemaining] = useState(seconds);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          vibrate(200);
          onDone();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, remaining, onDone]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Repos</p>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            className="stroke-indigo-500 transition-all duration-1000"
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${pct * 2.764} 276.4`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">{remaining}s</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setPaused(!paused)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium"
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {paused ? "Reprendre" : "Pause"}
        </button>
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium"
        >
          Passer
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const LiveWorkoutSession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Data passed from training plan dashboard
  const passedState = location.state as {
    planId: string;
    planDay: any;
    resumed?: boolean;
  } | null;

  // ── Init from passed state or recovery ─────────────────────────────────
  const [sessionData, setSessionData] = useState<WorkoutSessionData | null>(() => {
    // Try recovery first
    if (passedState?.resumed) {
      const saved = getSavedWorkout();
      if (saved) return saved;
    }

    // Build from plan day
    if (!passedState?.planDay) return null;
    const { planId, planDay } = passedState;
    const exercises: WorkoutExerciseData[] = (planDay.exercises ?? []).map((ex: any) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exercise?.name ?? "Exercice",
      plannedSets: ex.plannedSets,
      plannedReps: ex.plannedReps,
      plannedWeightKg: ex.plannedWeightKg ?? 0,
      restSeconds: 90,
      notes: "",
      sets: Array.from({ length: ex.plannedSets }, () => ({
        reps: ex.plannedReps,
        weightKg: ex.plannedWeightKg ?? 0,
        completed: false,
      })),
    }));

    return {
      planId,
      planDayId: planDay.id,
      planDayLabel: planDay.label || DAYS_FULL_FR[planDay.dayOfWeek],
      trainingType: planDay.trainingType,
      date: new Date().toISOString().split("T")[0],
      startedAt: Date.now(),
      currentExerciseIndex: 0,
      exercises,
    };
  });

  // ── State ──────────────────────────────────────────────────────────────
  const [currentExIndex, setCurrentExIndex] = useState(sessionData?.currentExerciseIndex ?? 0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [showFinish, setShowFinish] = useState(false);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [performanceNote, setPerformanceNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Add exercise search
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Swipe handling
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const isSwiping = useRef(false);

  // ── Derived ────────────────────────────────────────────────────────────
  const exercises = sessionData?.exercises ?? [];
  const currentEx = exercises[currentExIndex] ?? null;
  const totalSetsCompleted = exercises.reduce((s, ex) => s + ex.sets.filter((set) => set.completed).length, 0);
  const totalSets = exercises.reduce((s, ex) => s + ex.sets.length, 0);
  const allDone = totalSets > 0 && totalSetsCompleted === totalSets;

  // ── Auto-save ──────────────────────────────────────────────────────────
  const dataForSave = useMemo(() => {
    if (!sessionData) return null;
    return { ...sessionData, currentExerciseIndex: currentExIndex };
  }, [sessionData, currentExIndex]);

  useWorkoutAutoSave(dataForSave);
  useWakeLock(!!sessionData && !showFinish);

  // ── Elapsed timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionData) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - sessionData.startedAt);
    }, 1000);
    return () => clearInterval(id);
  }, [sessionData?.startedAt]);

  // ── Redirect if no data ────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionData) {
      navigate("/dashboard/training-plans", { replace: true });
    }
  }, [sessionData, navigate]);

  // ── Fetch exercises for search ─────────────────────────────────────────
  useEffect(() => {
    if (showAddExercise && allExercises.length === 0) {
      setLoadingExercises(true);
      fetch(`${API_URL}/exercises`, { headers: authHeaders() })
        .then((r) => r.json())
        .then((d) => setAllExercises(Array.isArray(d) ? d : d.exercises ?? []))
        .catch(() => {})
        .finally(() => setLoadingExercises(false));
    }
  }, [showAddExercise]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const updateSet = useCallback((exIndex: number, setIndex: number, field: keyof WorkoutSetData, value: any) => {
    setSessionData((prev) => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      const newSets = [...newExercises[exIndex].sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      newExercises[exIndex] = { ...newExercises[exIndex], sets: newSets };
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const toggleSetCompleted = useCallback((exIndex: number, setIndex: number) => {
    let shouldShowTimer = false;
    let timerDuration = 90;

    setSessionData((prev) => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      const newSets = [...newExercises[exIndex].sets];
      const wasCompleted = newSets[setIndex].completed;
      newSets[setIndex] = {
        ...newSets[setIndex],
        completed: !wasCompleted,
        completedAt: !wasCompleted ? Date.now() : undefined,
      };
      newExercises[exIndex] = { ...newExercises[exIndex], sets: newSets };

      // Show rest timer after completing a set (not unchecking)
      if (!wasCompleted) {
        shouldShowTimer = true;
        timerDuration = newExercises[exIndex].restSeconds || 90;
      }

      return { ...prev, exercises: newExercises };
    });

    vibrate();

    // Schedule timer outside the updater to avoid React batching issues
    requestAnimationFrame(() => {
      if (shouldShowTimer) {
        setRestSeconds(timerDuration);
        setShowRestTimer(true);
      }
    });
  }, []);

  const addSet = useCallback((exIndex: number) => {
    setSessionData((prev) => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      const ex = newExercises[exIndex];
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSets = [...ex.sets, {
        reps: lastSet?.reps ?? ex.plannedReps,
        weightKg: lastSet?.weightKg ?? ex.plannedWeightKg,
        completed: false,
      }];
      newExercises[exIndex] = { ...ex, sets: newSets, plannedSets: newSets.length };
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const removeSet = useCallback((exIndex: number, setIndex: number) => {
    setSessionData((prev) => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      const ex = newExercises[exIndex];
      if (ex.sets.length <= 1) return prev;
      const newSets = ex.sets.filter((_, i) => i !== setIndex);
      newExercises[exIndex] = { ...ex, sets: newSets, plannedSets: newSets.length };
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const updateExerciseNotes = useCallback((exIndex: number, notes: string) => {
    setSessionData((prev) => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      newExercises[exIndex] = { ...newExercises[exIndex], notes };
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const updateExerciseRest = useCallback((exIndex: number, restSeconds: number) => {
    setSessionData((prev) => {
      if (!prev) return prev;
      const newExercises = [...prev.exercises];
      newExercises[exIndex] = { ...newExercises[exIndex], restSeconds };
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const removeExercise = useCallback((exIndex: number) => {
    setSessionData((prev) => {
      if (!prev) return prev;
      const newExercises = prev.exercises.filter((_, i) => i !== exIndex);
      return { ...prev, exercises: newExercises };
    });
    if (currentExIndex >= exercises.length - 1 && currentExIndex > 0) {
      setCurrentExIndex(currentExIndex - 1);
    }
  }, [currentExIndex, exercises.length]);

  const addExercise = useCallback((exercise: { id: string; name: string }) => {
    setSessionData((prev) => {
      if (!prev) return prev;
      const newEx: WorkoutExerciseData = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        plannedSets: 3,
        plannedReps: 10,
        plannedWeightKg: 0,
        restSeconds: 90,
        notes: "",
        sets: Array.from({ length: 3 }, () => ({ reps: 10, weightKg: 0, completed: false })),
      };
      return { ...prev, exercises: [...prev.exercises, newEx] };
    });
    setShowAddExercise(false);
    setSearchQ("");
  }, []);

  const goToExercise = useCallback((index: number) => {
    if (index >= 0 && index < exercises.length) {
      setCurrentExIndex(index);
      setShowRestTimer(false);
    }
  }, [exercises.length]);

  // ── Swipe gestures ─────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
    isSwiping.current = true;
  };

  const handleTouchEnd = () => {
    // Only trigger swipe if there was actual movement
    if (!isSwiping.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = Math.abs(touchStartY.current - touchEndY.current);
    // Require: horizontal > 120px, mostly horizontal (not scrolling vertically)
    if (Math.abs(diffX) > 120 && Math.abs(diffX) > diffY * 2) {
      if (diffX > 0) goToExercise(currentExIndex + 1);
      else goToExercise(currentExIndex - 1);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!sessionData) return;
    setIsSubmitting(true);
    try {
      const durationMinutes = Math.round((Date.now() - sessionData.startedAt) / 60000);
      const exercisesPayload = sessionData.exercises
        .filter((ex) => ex.sets.some((s) => s.completed))
        .map((ex, idx) => {
          const completedSets = ex.sets.filter((s) => s.completed);
          const allSameReps = completedSets.every((s) => s.reps === completedSets[0]?.reps);
          return {
            exerciseId: ex.exerciseId,
            ...(ex.exerciseId.startsWith("custom-") && {
              exerciseName: ex.exerciseName,
              exerciseCategory: "other",
              exerciseDefaultUnit: "reps",
            }),
            sets: completedSets.length,
            repsUniform: allSameReps ? completedSets[0]?.reps : undefined,
            repsPerSet: allSameReps ? undefined : completedSets.map((s) => s.reps),
            weightKg: completedSets[0]?.weightKg ?? 0,
            restSeconds: ex.restSeconds,
            notes: ex.notes || undefined,
            orderIndex: idx,
          };
        });

      if (exercisesPayload.length === 0) {
        showToast("Aucune serie completee", "error");
        setIsSubmitting(false);
        return;
      }

      // 1. Create training session
      const sessionRes = await fetch(`${API_URL}/training-sessions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          date: sessionData.date,
          durationMinutes,
          notes: performanceNote || undefined,
          exercises: exercisesPayload,
        }),
      });

      if (!sessionRes.ok) {
        const err = await sessionRes.json().catch(() => ({}));
        throw new Error(err.message || "Erreur creation seance");
      }

      const createdSession = await sessionRes.json();

      // 2. Log as plan session
      const planLogPayload: Record<string, unknown> = {
        date: sessionData.date,
        skipped: false,
        trainingSessionId: createdSession.id,
        planDayId: sessionData.planDayId,
      };
      if (moodScore !== null) planLogPayload.moodScore = moodScore;
      if (moodNote.trim()) planLogPayload.moodNote = moodNote.trim();
      if (performanceNote.trim()) planLogPayload.performanceNote = performanceNote.trim();

      await fetch(`${API_URL}/training-plans/${sessionData.planId}/log-session`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(planLogPayload),
      });

      clearSavedWorkout();
      showToast("Seance enregistree !", "success");
      navigate(`/dashboard/training-plans/${sessionData.planId}`, { replace: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbandon = () => {
    clearSavedWorkout();
    if (sessionData) {
      navigate(`/dashboard/training-plans/${sessionData.planId}`, { replace: true });
    } else {
      navigate("/dashboard/training-plans", { replace: true });
    }
  };

  // ── Render guards ──────────────────────────────────────────────────────
  if (!sessionData) return null;

  const filteredSearch = allExercises
    .filter((ex) => ex.name.toLowerCase().includes(searchQ.toLowerCase()))
    .filter((ex) => !exercises.some((l) => l.exerciseId === ex.id))
    .slice(0, 15);

  // ── FINISH SCREEN ──────────────────────────────────────────────────────
  if (showFinish) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setShowFinish(false)} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Terminer</h2>
          <div className="w-16" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl py-3">
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{exercises.filter((e) => e.sets.some((s) => s.completed)).length}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Exos</p>
            </div>
            <div className="bg-violet-50 dark:bg-violet-500/10 rounded-2xl py-3">
              <p className="text-2xl font-black text-violet-600 dark:text-violet-400">{totalSetsCompleted}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Series</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-500/10 rounded-2xl py-3">
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{formatElapsed(elapsed)}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Duree</p>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Comment s'est passee la seance ?
            </label>
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => setMoodScore(score === moodScore ? null : score)}
                  className={`text-3xl p-2.5 rounded-2xl transition-all ${
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Ressenti</label>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Comment tu te sens ?"
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Notes de performance</label>
            <textarea
              value={performanceNote}
              onChange={(e) => setPerformanceNote(e.target.value)}
              placeholder="PRs, sensations, ajustements..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSubmitting ? "Enregistrement..." : "Enregistrer la seance"}
          </button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    );
  }

  // ── MAIN WORKOUT SCREEN ────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={handleAbandon}
          className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Quitter</span>
        </button>

        <div className="flex items-center gap-2 text-center">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {getTrainingTypeEmoji(sessionData.trainingType)} {sessionData.planDayLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-gray-900 dark:text-white">
          <Timer className="w-4 h-4 text-indigo-500" />
          {formatElapsed(elapsed)}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="flex-shrink-0">
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${totalSets > 0 ? (totalSetsCompleted / totalSets) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            Exo {currentExIndex + 1}/{exercises.length}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {totalSetsCompleted}/{totalSets} series
          </span>
        </div>
      </div>

      {/* ── Exercise Navigation Dots ── */}
      <div className="flex items-center justify-center gap-1.5 px-4 pb-2 flex-shrink-0">
        {exercises.map((ex, i) => {
          const done = ex.sets.every((s) => s.completed);
          const partial = ex.sets.some((s) => s.completed);
          return (
            <button
              key={i}
              onClick={() => goToExercise(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentExIndex ? "w-6" : "w-2"
              } ${
                done
                  ? "bg-green-500"
                  : partial
                  ? "bg-indigo-400"
                  : i === currentExIndex
                  ? "bg-indigo-600"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
          );
        })}
      </div>

      {/* ── Main Content (swipeable) ── */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {showRestTimer ? (
          <RestTimer
            seconds={restSeconds}
            onDone={() => setShowRestTimer(false)}
            onSkip={() => setShowRestTimer(false)}
          />
        ) : currentEx ? (
          <div className="px-4 py-3 space-y-3">
            {/* Exercise name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {currentEx.exerciseName}
                </h3>
                <ExerciseInfoButton exerciseName={currentEx.exerciseName} size="sm" />
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-2.5 py-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <button
                    onClick={() => updateExerciseRest(currentExIndex, Math.max(0, currentEx.restSeconds - 15))}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 active:scale-90"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 tabular-nums w-8 text-center">
                    {currentEx.restSeconds}s
                  </span>
                  <button
                    onClick={() => updateExerciseRest(currentExIndex, currentEx.restSeconds + 15)}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 active:scale-90"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sets table */}
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-2 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Serie</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Reps</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Poids (kg)</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase text-center">
                  <Check className="w-3 h-3 mx-auto" />
                </span>
              </div>

              {/* Sets */}
              {currentEx.sets.map((set, si) => (
                <div
                  key={si}
                  className={`grid grid-cols-[40px_1fr_1fr_48px] gap-2 items-center rounded-xl px-1 py-1.5 transition-all ${
                    set.completed
                      ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20"
                      : "bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                  }`}
                >
                  {/* Set number */}
                  <div className="flex items-center justify-center">
                    <span className={`text-sm font-black ${set.completed ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                      {si + 1}
                    </span>
                  </div>

                  {/* Reps input with +/- */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateSet(currentExIndex, si, "reps", Math.max(0, set.reps - 1))}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={(e) => updateSet(currentExIndex, si, "reps", Math.max(0, Number(e.target.value) || 0))}
                      className="w-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-1.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                    />
                    <button
                      onClick={() => updateSet(currentExIndex, si, "reps", set.reps + 1)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>

                  {/* Weight input with +/- */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateSet(currentExIndex, si, "weightKg", Math.max(0, set.weightKg - 2.5))}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      value={set.weightKg || ""}
                      onChange={(e) => updateSet(currentExIndex, si, "weightKg", Math.max(0, Number(e.target.value) || 0))}
                      placeholder="—"
                      className="w-14 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-1.5 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                    />
                    <button
                      onClick={() => updateSet(currentExIndex, si, "weightKg", set.weightKg + 2.5)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>

                  {/* Check button */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => toggleSetCompleted(currentExIndex, si)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                        set.completed
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add/remove set */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => addSet(currentExIndex)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wider hover:border-indigo-300 hover:text-indigo-500 transition-colors active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Serie
                </button>
                {currentEx.sets.length > 1 && (
                  <button
                    onClick={() => removeSet(currentExIndex, currentEx.sets.length - 1)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wider hover:border-red-300 hover:text-red-500 transition-colors active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Exercise notes */}
            <input
              type="text"
              value={currentEx.notes}
              onChange={(e) => updateExerciseNotes(currentExIndex, e.target.value)}
              placeholder="Notes sur cet exercice..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Exercise actions */}
            <div className="flex gap-2">
              <button
                onClick={() => removeExercise(currentExIndex)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer exo
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Bottom Navigation ── */}
      <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Prev */}
          <button
            onClick={() => goToExercise(currentExIndex - 1)}
            disabled={currentExIndex === 0}
            className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Add exercise */}
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center active:scale-90 transition-all"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Main action */}
          {currentExIndex < exercises.length - 1 ? (
            <button
              onClick={() => goToExercise(currentExIndex + 1)}
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
            >
              Exercice suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowFinish(true)}
              className={`flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all ${
                allDone
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <Save className="w-4 h-4" />
              Terminer la seance
            </button>
          )}

          {/* Next */}
          <button
            onClick={() => goToExercise(currentExIndex + 1)}
            disabled={currentExIndex === exercises.length - 1}
            className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* ── Add Exercise Modal ── */}
      {showAddExercise && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowAddExercise(false); setSearchQ(""); }} />
          <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl sm:mb-4 max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Rechercher un exercice..."
                  className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={() => { setShowAddExercise(false); setSearchQ(""); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingExercises ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>
              ) : (
                <>
                  {filteredSearch.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(ex)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate">{ex.name}</span>
                        <ExerciseInfoButton exerciseName={ex.name} size="sm" />
                      </div>
                      <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{ex.category}</span>
                    </button>
                  ))}
                  {searchQ.trim() && !allExercises.some((e) => e.name.toLowerCase() === searchQ.toLowerCase()) && (
                    <button
                      onClick={() => addExercise({ id: `custom-${Date.now()}`, name: searchQ.trim() })}
                      className="w-full text-left px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Creer "{searchQ}"
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveWorkoutSession;
