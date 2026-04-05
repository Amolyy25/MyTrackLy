import React, { useState, useEffect, useRef } from "react";
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
  Pencil,
  Check,
  X,
  Plus,
  Search,
  Target,
  ArrowRight,
} from "lucide-react";
import { usePlanById } from "../../../../hooks/usePlanById";
import { usePlanProgress } from "../../../../hooks/usePlanProgress";
import { useTrainingPlans } from "../../../../hooks/useTrainingPlans";
import { useToast } from "../../../../contexts/ToastContext";
import {
  DAYS_FR,
  DAYS_FULL_FR,
  TRAINING_TYPES,
  getMoodEmoji,
  getTrainingTypeLabel,
  getTrainingTypeEmoji,
  getBodyGoalLabel,
  getBodyGoalEmoji,
} from "../../../../utils/trainingPlanHelpers";
import { PlanDay, PlanExercise, Exercise } from "../../../../types";
import LogPlanSessionModal from "./LogPlanSessionModal";
import AIPlanInsights from "./AIPlanInsights";
import API_URL from "../../../../config/api";

// ---- Color coding for training types ----
const TYPE_COLORS: Record<string, string> = {
  full_body: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  upper_body: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  lower_body: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  push: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  pull: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  cardio: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  core: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  custom: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

function getTypeColor(trainingType: string): string {
  return TYPE_COLORS[trainingType] ?? TYPE_COLORS.custom;
}

// ---- Circular progress ring ----
function CircleProgress({ pct }: { pct: number }) {
  const r = 52, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="120" height="120" className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-gray-800" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        className="text-indigo-500 transition-all duration-700"
      />
    </svg>
  );
}

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
  const sorted = [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  return sorted.find((d) => d.dayOfWeek >= todayDow) ?? sorted[0];
}

// ---- API helpers ----
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ---- ActiveToggle ----
function ActiveToggle({ isActive, onToggle }: { isActive: boolean; onToggle: () => void }) {
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
      <span className={`text-sm font-medium ${isActive ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
        {isActive ? "Actif" : "Inactif"}
      </span>
    </button>
  );
}

// ---- Inline editable text ----
function InlineEdit({
  value,
  onSave,
  placeholder,
  multiline = false,
  className = "",
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded px-1 -mx-1 group flex items-center gap-1 ${className}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
        <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0" />
      </span>
    );
  }

  const sharedClass = "px-2 py-1 rounded-lg border border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full";

  return (
    <span className="flex items-center gap-1 w-full">
      {multiline ? (
        <textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          rows={2}
          className={`${sharedClass} resize-none text-sm`}
        />
      ) : (
        <input
          ref={inputRef as React.Ref<HTMLInputElement>}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
          className={sharedClass}
        />
      )}
      <button onClick={commit} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
        <Check className="w-4 h-4" />
      </button>
    </span>
  );
}

// ---- AddDayForm ----
function AddDayForm({
  onAdd,
  onCancel,
}: {
  onAdd: (data: { dayOfWeek: number; timeOfDay: string; trainingType: string; customType?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState("08:00");
  const [trainingType, setTrainingType] = useState("full_body");
  const [customType, setCustomType] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onAdd({ dayOfWeek, timeOfDay, trainingType, customType: trainingType === "custom" ? customType : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10 space-y-3">
      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Ajouter un jour</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Jour</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DAYS_FULL_FR.map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Heure</label>
          <input
            type="time"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Type</label>
        <select
          value={trainingType}
          onChange={(e) => setTrainingType(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TRAINING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
          ))}
        </select>
      </div>
      {trainingType === "custom" && (
        <input
          type="text"
          value={customType}
          onChange={(e) => setCustomType(e.target.value)}
          placeholder="Label personnalisé"
          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Ajouter
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// ---- EditDayForm ----
function EditDayForm({
  day,
  onSave,
  onCancel,
}: {
  day: PlanDay;
  onSave: (data: { timeOfDay: string; trainingType: string; customType?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [timeOfDay, setTimeOfDay] = useState(day.timeOfDay);
  const [trainingType, setTrainingType] = useState(day.trainingType);
  const [customType, setCustomType] = useState(day.customType ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({ timeOfDay, trainingType, customType: trainingType === "custom" ? customType : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10 space-y-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={trainingType}
          onChange={(e) => setTrainingType(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TRAINING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
          ))}
        </select>
      </div>
      {trainingType === "custom" && (
        <input
          type="text"
          value={customType}
          onChange={(e) => setCustomType(e.target.value)}
          placeholder="Label personnalisé"
          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Enregistrer
        </button>
        <button onClick={onCancel} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs hover:bg-gray-50 dark:hover:bg-gray-800">
          Annuler
        </button>
      </div>
    </div>
  );
}

// ---- ExerciseSearch ----
function ExerciseSearch({
  onAdd,
  onClose,
}: {
  onAdd: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch(`${API_URL}/exercises`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setExercises(Array.isArray(data) ? data : data.exercises ?? []);
        }
      } catch {
        // non-blocking
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-md mt-2 space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher..."
          autoFocus
          className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /></div>
      ) : (
        <div className="max-h-36 overflow-y-auto space-y-0.5">
          {filtered.slice(0, 30).map((ex) => (
            <button
              key={ex.id}
              onClick={() => { onAdd(ex); onClose(); }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-xs text-gray-700 dark:text-gray-300 transition-colors"
            >
              {ex.name}
              <span className="ml-1.5 text-gray-400">{ex.category}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 px-2 py-2 text-center">Aucun exercice trouvé</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---- WeeklyCalendar ----
function WeeklyCalendar({
  days,
  editMode,
  onLogSession,
  onAddExercise,
  onDeleteExercise,
  onAddDay,
  onDeleteDay,
  onEditDay,
}: {
  days: PlanDay[];
  editMode: boolean;
  onLogSession: (day: PlanDay) => void;
  onAddExercise: (dayId: string, exercise: Exercise) => Promise<void>;
  onDeleteExercise: (dayId: string, exId: string) => Promise<void>;
  onAddDay: (data: { dayOfWeek: number; timeOfDay: string; trainingType: string; customType?: string }) => Promise<void>;
  onDeleteDay: (dayId: string) => Promise<void>;
  onEditDay: (dayId: string, data: { timeOfDay: string; trainingType: string; customType?: string }) => Promise<void>;
}) {
  const todayDow = new Date().getDay();
  const [searchOpenFor, setSearchOpenFor] = useState<string | null>(null);
  const [editDayId, setEditDayId] = useState<string | null>(null);
  const [showAddDayForm, setShowAddDayForm] = useState(false);

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
          const visibleExercises = planDay?.exercises.slice(0, 3) ?? [];
          const extraCount = Math.max(0, (planDay?.exercises.length ?? 0) - 3);

          return (
            <div
              key={i}
              className={`flex flex-col rounded-xl p-2 min-h-[120px] border ${
                isToday
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : planDay
                  ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`text-xs font-semibold ${isToday ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"}`}>
                  {DAYS_FR[i]}
                </p>
                {editMode && planDay && (
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => setEditDayId(editDayId === planDay.id ? null : planDay.id)}
                      className={`p-0.5 rounded transition-colors ${isToday ? "hover:bg-white/20 text-white/80" : "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500"}`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteDay(planDay.id)}
                      className={`p-0.5 rounded transition-colors ${isToday ? "hover:bg-white/20 text-white/80" : "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {planDay ? (
                <div className="flex flex-col gap-1 flex-1">
                  <p className={`text-xs ${isToday ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"}`}>
                    {planDay.timeOfDay}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-1 w-fit ${
                    isToday ? "bg-white/20 text-white" : getTypeColor(planDay.trainingType)
                  }`}>
                    {getTrainingTypeEmoji(planDay.trainingType)}{" "}
                    {getTrainingTypeLabel(planDay.trainingType, planDay.customType)}
                  </span>

                  {visibleExercises.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {visibleExercises.map((ex) => (
                        <div key={ex.id} className="flex items-center justify-between group/ex">
                          <p className={`text-xs truncate ${isToday ? "text-indigo-100" : "text-gray-600 dark:text-gray-400"}`}>
                            • {ex.exercise?.name ?? "Exercice"}
                          </p>
                          {editMode && (
                            <button
                              onClick={() => onDeleteExercise(planDay.id, ex.id)}
                              className="opacity-0 group-hover/ex:opacity-100 p-0.5 rounded transition-all text-red-400 hover:text-red-600"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <p className={`text-xs ${isToday ? "text-indigo-200" : "text-gray-400 dark:text-gray-500"}`}>
                          et {extraCount} autre{extraCount > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  {editMode && planDay && editDayId === planDay.id && (
                    <EditDayForm
                      day={planDay}
                      onSave={async (data) => { await onEditDay(planDay.id, data); setEditDayId(null); }}
                      onCancel={() => setEditDayId(null)}
                    />
                  )}

                  {editMode ? (
                    <>
                      {searchOpenFor === planDay.id ? (
                        <ExerciseSearch
                          onAdd={(ex) => onAddExercise(planDay.id, ex)}
                          onClose={() => setSearchOpenFor(null)}
                        />
                      ) : (
                        <button
                          onClick={() => setSearchOpenFor(planDay.id)}
                          className={`mt-auto text-xs px-1.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-0.5 ${
                            isToday ? "bg-white/20 hover:bg-white/30 text-white" : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          Ajouter
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => onLogSession(planDay)}
                      className={`mt-auto text-xs px-1.5 py-1 rounded-lg font-medium transition-colors ${
                        isToday
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      <Play className="w-3 h-3 inline mr-0.5" />
                      Faire
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {editMode && (
        <div className="mt-3">
          {showAddDayForm ? (
            <AddDayForm
              onAdd={async (data) => { await onAddDay(data); setShowAddDayForm(false); }}
              onCancel={() => setShowAddDayForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddDayForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un jour
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- NextSession ----
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
            {nextDay.timeOfDay} — {getTrainingTypeEmoji(nextDay.trainingType)}{" "}
            {getTrainingTypeLabel(nextDay.trainingType, nextDay.customType)}
          </p>
        </div>
      </div>
      {nextDay.exercises.length > 0 && (
        <div className="space-y-1.5 mt-3 pt-3 border-t border-white/20">
          {nextDay.exercises.slice(0, 5).map((ex) => (
            <div key={ex.id} className="flex items-center justify-between text-sm">
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
            <p className="text-xs text-indigo-200">+{nextDay.exercises.length - 5} autres exercices</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---- ProgressSection ----
function ProgressSection({
  completionRate,
  streakDays,
  weeklyBreakdown,
  initialWeightKg,
  targetWeightKg,
}: {
  completionRate: number;
  streakDays: number;
  weeklyBreakdown: Array<{ weekStart: string; planned: number; logged: number }>;
  initialWeightKg?: number | null;
  targetWeightKg?: number | null;
}) {
  const weightProgress =
    initialWeightKg && targetWeightKg && initialWeightKg !== targetWeightKg
      ? Math.min(100, Math.max(0, Math.round(((initialWeightKg - initialWeightKg) / (initialWeightKg - targetWeightKg)) * 100)))
      : null;

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-500" />
        Progression
      </h3>

      {/* Ring + streak */}
      <div className="flex items-center gap-6 mb-5">
        <div className="relative flex-shrink-0">
          <CircleProgress pct={Math.round(completionRate)} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {Math.round(completionRate)}%
            </span>
            <span className="text-xs text-gray-400">complétion</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-center">
            <p className="text-3xl font-black text-orange-500 dark:text-orange-400 flex items-center justify-center gap-1">
              {streakDays}
              <Flame className="w-6 h-6" />
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Jours de streak</p>
          </div>
        </div>
      </div>

      {/* Goal weight progress bar */}
      {initialWeightKg && targetWeightKg && (
        <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Objectif poids</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">{initialWeightKg} kg</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{targetWeightKg} kg</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${weightProgress ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Weekly bars */}
      {weeklyBreakdown.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">4 dernières semaines</p>
          <div className="flex gap-2 items-end h-16">
            {weeklyBreakdown.slice(-4).map((week, i) => {
              const pct = week.planned > 0 ? Math.min((week.logged / week.planned) * 100, 100) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
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
  const [editMode, setEditMode] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const handleToggleActive = async () => {
    if (!plan) return;
    try {
      await updatePlan(plan.id, { isActive: !plan.isActive });
      await refetch();
      showToast(plan.isActive ? "Plan désactivé" : "Plan activé", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    if (!window.confirm(`Supprimer le plan "${plan.name}" ? Cette action est irréversible.`)) return;
    try {
      await deletePlan(plan.id);
      showToast("Plan supprimé", "success");
      navigate("/dashboard/training-plans");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleOpenLogModal = (day: PlanDay) => {
    setLogTargetDay(day);
    setLogModalOpen(true);
  };

  const handleSavePlanField = async (patch: Record<string, unknown>) => {
    if (!plan) return;
    setIsSavingPlan(true);
    try {
      await updatePlan(plan.id, patch);
      await refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleAddExercise = async (dayId: string, exercise: Exercise) => {
    if (!plan) return;
    try {
      const res = await fetch(`${API_URL}/training-plans/${plan.id}/days/${dayId}/exercises`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ exerciseId: exercise.id, plannedSets: 3, plannedReps: 10 }),
      });
      if (!res.ok) throw new Error("Erreur ajout exercice");
      await refetch();
      showToast("Exercice ajouté", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleDeleteExercise = async (dayId: string, exId: string) => {
    if (!plan) return;
    try {
      const res = await fetch(`${API_URL}/training-plans/${plan.id}/days/${dayId}/exercises/${exId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur suppression exercice");
      await refetch();
      showToast("Exercice supprimé", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleAddDay = async (data: { dayOfWeek: number; timeOfDay: string; trainingType: string; customType?: string }) => {
    if (!plan) return;
    try {
      const res = await fetch(`${API_URL}/training-plans/${plan.id}/days`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur ajout jour");
      await refetch();
      showToast("Jour ajouté", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!plan) return;
    if (!window.confirm("Supprimer ce jour et tous ses exercices ?")) return;
    try {
      const res = await fetch(`${API_URL}/training-plans/${plan.id}/days/${dayId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Erreur suppression jour");
      await refetch();
      showToast("Jour supprimé", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  const handleEditDay = async (dayId: string, data: { timeOfDay: string; trainingType: string; customType?: string }) => {
    if (!plan) return;
    try {
      const res = await fetch(`${API_URL}/training-plans/${plan.id}/days/${dayId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur modification jour");
      await refetch();
      showToast("Jour modifié", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
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
        <p className="text-red-600 dark:text-red-400 mb-4">{error ?? "Plan introuvable"}</p>
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
          <div className="flex-1 min-w-0">
            {editMode ? (
              <div className="space-y-2">
                <InlineEdit
                  value={plan.name}
                  onSave={(v) => handleSavePlanField({ name: v })}
                  placeholder="Nom du plan"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                />
                <InlineEdit
                  value={plan.description ?? ""}
                  onSave={(v) => handleSavePlanField({ description: v })}
                  placeholder="Ajouter une description..."
                  multiline
                  className="text-sm text-gray-500 dark:text-gray-400"
                />
                <InlineEdit
                  value={plan.initialNotes ?? ""}
                  onSave={(v) => handleSavePlanField({ initialNotes: v })}
                  placeholder="Notes pour l'IA..."
                  multiline
                  className="text-sm text-gray-500 dark:text-gray-400"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h1>
                  {plan.bodyGoal && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      <span>{getBodyGoalEmoji(plan.bodyGoal)}</span>
                      <span>{getBodyGoalLabel(plan.bodyGoal, plan.customGoal)}</span>
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                )}
                {(plan.startDate || (plan.initialWeightKg && plan.targetWeightKg)) && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {plan.startDate && (
                      <span>Début : {formatDate(plan.startDate)}</span>
                    )}
                    {plan.initialWeightKg && plan.targetWeightKg && (
                      <span className="flex items-center gap-1">
                        {plan.initialWeightKg} kg
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{plan.targetWeightKg} kg</span>
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <ActiveToggle isActive={plan.isActive} onToggle={handleToggleActive} />
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors ${
                editMode
                  ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                  : "border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              }`}
            >
              {editMode ? (
                <>
                  {isSavingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Terminer
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Modifier le plan
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Calendar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <WeeklyCalendar
              days={plan.days}
              editMode={editMode}
              onLogSession={handleOpenLogModal}
              onAddExercise={handleAddExercise}
              onDeleteExercise={handleDeleteExercise}
              onAddDay={handleAddDay}
              onDeleteDay={handleDeleteDay}
              onEditDay={handleEditDay}
            />
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
                initialWeightKg={plan.initialWeightKg}
                targetWeightKg={plan.targetWeightKg}
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
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Historique récent</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aucune séance loggée</p>
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
                          <span className="text-base">{getMoodEmoji(log.moodScore)}</span>
                        )}
                        {log.skipped && (
                          <span className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Sautée
                          </span>
                        )}
                      </div>
                      {log.moodNote && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{log.moodNote}</p>
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
        onClose={() => { setLogModalOpen(false); setLogTargetDay(null); }}
        planId={plan.id}
        planDay={logTargetDay}
        onSuccess={refetch}
      />
    </div>
  );
};

export default TrainingPlanDashboard;
