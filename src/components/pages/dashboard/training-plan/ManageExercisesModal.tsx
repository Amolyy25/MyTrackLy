import React, { useState, useEffect } from "react";
import { X, Search, Plus, Trash2, Loader2, Dumbbell, GripVertical } from "lucide-react";
import { PlanDay, PlanExercise, Exercise } from "../../../../types";
import { ExerciseInfoButton } from "../../../composants/ExerciseInfoSheet";
import { DAYS_FULL_FR, getTrainingTypeLabel, getTrainingTypeEmoji } from "../../../../utils/trainingPlanHelpers";
import API_URL from "../../../../config/api";

interface ManageExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  planDay: PlanDay;
  planId: string;
  onAddExercise: (dayId: string, exercise: Exercise) => Promise<void>;
  onDeleteExercise: (dayId: string, exId: string) => Promise<void>;
  onUpdateExercise: (dayId: string, exId: string, patch: Partial<PlanExercise>) => Promise<void>;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

const ManageExercisesModal: React.FC<ManageExercisesModalProps> = ({
  isOpen,
  onClose,
  planDay,
  planId,
  onAddExercise,
  onDeleteExercise,
  onUpdateExercise,
}) => {
  const [q, setQ] = useState("");
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"current" | "add">("current");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSets, setEditSets] = useState("");
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/exercises`, { headers: authHeaders() })
        .then((r) => r.json())
        .then((d) => setAllExercises(Array.isArray(d) ? d : d.exercises ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
      setTab("current");
      setQ("");
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dayLabel = planDay.label || DAYS_FULL_FR[planDay.dayOfWeek];
  const exercises = planDay.exercises ?? [];
  const existingIds = new Set(exercises.map((e) => e.exerciseId));

  const filtered = allExercises
    .filter((ex) => ex.name.toLowerCase().includes(q.toLowerCase()))
    .filter((ex) => !existingIds.has(ex.id))
    .slice(0, 30);

  const startEdit = (ex: PlanExercise) => {
    setEditingId(ex.id);
    setEditSets(String(ex.plannedSets));
    setEditReps(String(ex.plannedReps));
    setEditWeight(ex.plannedWeightKg != null ? String(ex.plannedWeightKg) : "");
  };

  const saveEdit = async (ex: PlanExercise) => {
    setSaving(true);
    try {
      await onUpdateExercise(planDay.id, ex.id, {
        plannedSets: Number(editSets) || ex.plannedSets,
        plannedReps: Number(editReps) || ex.plannedReps,
        plannedWeightKg: editWeight ? Number(editWeight) : null,
      });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (exercise: Exercise) => {
    await onAddExercise(planDay.id, exercise);
  };

  const handleCreateAndAdd = async (name: string) => {
    await onAddExercise(planDay.id, { name } as any);
    setQ("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal - full height on mobile, centered on desktop */}
      <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 sm:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{dayLabel}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {getTrainingTypeEmoji(planDay.trainingType)} {getTrainingTypeLabel(planDay.trainingType, planDay.customType)} - {planDay.timeOfDay}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={() => setTab("current")}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              tab === "current"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Exercices ({exercises.length})
          </button>
          <button
            onClick={() => setTab("add")}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
              tab === "add"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" />
              Ajouter
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {tab === "current" ? (
            /* ── Current exercises tab ── */
            <div className="p-4 space-y-2">
              {exercises.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Dumbbell className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aucun exercice</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Passez à l'onglet "Ajouter" pour commencer</p>
                  <button
                    onClick={() => setTab("add")}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un exercice
                  </button>
                </div>
              ) : (
                exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 rounded-xl overflow-hidden"
                  >
                    {editingId === ex.id ? (
                      /* Edit mode */
                      <div className="p-4 space-y-3">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          {ex.exercise?.name ?? "Exercice"}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Series</label>
                            <input
                              type="number" min="1" max="20"
                              value={editSets} onChange={(e) => setEditSets(e.target.value)}
                              className="w-full text-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Reps</label>
                            <input
                              type="number" min="1" max="100"
                              value={editReps} onChange={(e) => setEditReps(e.target.value)}
                              className="w-full text-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Kg</label>
                            <input
                              type="number" min="0" step="0.5"
                              value={editWeight} onChange={(e) => setEditWeight(e.target.value)}
                              placeholder="—"
                              className="w-full text-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => saveEdit(ex)}
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-50 transition-colors"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Enregistrer"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div className="flex items-center gap-3 p-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                              {ex.exercise?.name ?? "Exercice"}
                            </p>
                            <ExerciseInfoButton exerciseName={ex.exercise?.name ?? ""} size="sm" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {ex.plannedSets} series x {ex.plannedReps} reps
                            {ex.plannedWeightKg != null && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold"> @ {ex.plannedWeightKg} kg</span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => startEdit(ex)}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:text-indigo-400 transition-all"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteExercise(planDay.id, ex.id)}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-red-500 hover:border-red-300 dark:hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* ── Add exercises tab ── */
            <div className="flex flex-col h-full">
              {/* Search */}
              <div className="p-4 pb-2 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Rechercher un exercice..."
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  {q && (
                    <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Chargement...</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filtered.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => handleAdd(ex)}
                        className="w-full text-left p-3.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl flex items-center justify-between transition-all group active:scale-[0.98] border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/20"
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {ex.name}
                            </span>
                            <ExerciseInfoButton exerciseName={ex.name} size="sm" />
                          </div>
                          {ex.category && (
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              {ex.category}
                            </span>
                          )}
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                          <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </button>
                    ))}

                    {/* Create new exercise */}
                    {q.trim().length > 0 && !allExercises.some((e) => e.name.toLowerCase() === q.toLowerCase()) && (
                      <button
                        onClick={() => handleCreateAndAdd(q)}
                        className="w-full text-left p-4 bg-indigo-600 text-white rounded-xl flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Creer l'exercice</p>
                          <p className="text-xs text-indigo-200 truncate">"{q}"</p>
                        </div>
                      </button>
                    )}

                    {filtered.length === 0 && q.trim().length === 0 && (
                      <div className="text-center py-12">
                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 font-medium">Recherchez un exercice</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ou tapez un nom pour en creer un nouveau</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom safe area */}
        <div className="flex-shrink-0 h-[env(safe-area-inset-bottom)] bg-white dark:bg-slate-900" />
      </div>
    </div>
  );
};

export default ManageExercisesModal;
