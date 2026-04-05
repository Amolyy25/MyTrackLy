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
  ArrowRight,
  Scale,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Save,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Zap,
} from "lucide-react";
import { usePlanById } from "../../../../hooks/usePlanById";
import { usePlanProgress } from "../../../../hooks/usePlanProgress";
import { useTrainingPlans } from "../../../../hooks/useTrainingPlans";
import { useToast } from "../../../../contexts/ToastContext";
import {
  DAYS_FR,
  DAYS_FULL_FR,
  TRAINING_TYPES,
  BODY_GOALS,
  getMoodEmoji,
  getTrainingTypeLabel,
  getTrainingTypeEmoji,
  getBodyGoalLabel,
  getBodyGoalEmoji,
} from "../../../../utils/trainingPlanHelpers";
import { PlanDay, PlanExercise, Exercise, Measurement } from "../../../../types";
import LogPlanSessionModal from "./LogPlanSessionModal";
import AIPlanInsights from "./AIPlanInsights";
import API_URL from "../../../../config/api";

// ─── Auth headers ────────────────────────────────────────────────────────────
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

// ─── Type color map ───────────────────────────────────────────────────────────
function getTypeColor(t: string) {
  const colors: Record<string, string> = {
    full_body: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30",
    upper_body: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
    lower_body: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
    push: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30",
    pull: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30",
    cardio: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
    core: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30",
    custom: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
  };
  return colors[t] ?? colors.custom;
}

// ─── Circular SVG ring ────────────────────────────────────────────────────────
function Ring({ pct, size = 100 }: { pct: number; size?: number }) {
  const r = size * 0.4;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cx} r={r} fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={size * 0.08} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke="url(#ringGrad)" strokeWidth={size * 0.08}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        className="transition-all duration-700"
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Format date ─────────────────────────────────────────────────────────────
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateShort(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Next plan day ────────────────────────────────────────────────────────────
function getNextPlanDay(days: PlanDay[]): PlanDay | null {
  if (!days?.length) return null;
  const today = new Date().getDay();
  const sorted = [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  return sorted.find((d) => d.dayOfWeek >= today) ?? sorted[0];
}

// ─── EditInput / EditTextarea helpers ─────────────────────────────────────────
function EditField({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm ${className}`}
    />
  );
}

function EditTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none w-full text-sm shadow-sm ${className}`}
    />
  );
}

// ─── Exercise search dropdown ─────────────────────────────────────────────────
function ExerciseSearch({ onAdd, onClose }: { onAdd: (ex: Exercise) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/exercises`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setList(Array.isArray(d) ? d : d.exercises ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = list.filter((ex) => ex.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20);

  return (
    <div 
      ref={ref} 
      className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher ou créer..."
            className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chargement...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="p-1.5">
            {filtered.map((ex) => (
              <button
                key={ex.id}
                onClick={() => { onAdd(ex); onClose(); }}
                className="w-full text-left px-3 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl flex items-center justify-between transition-all group active:scale-[0.98]"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate tracking-tight">{ex.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{ex.category}</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-slate-100 dark:border-slate-700 shrink-0">
                  <Plus className="w-4 h-4 text-indigo-500" />
                </div>
              </button>
            ))}
          </div>
        ) : q.trim().length > 0 ? (
          <div className="p-3">
            <button
              onClick={() => { onAdd({ name: q } as any); onClose(); }}
              className="w-full text-left px-4 py-4 bg-indigo-600 text-white rounded-2xl flex flex-col items-start gap-1 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 fill-current" />
                <span className="font-black text-sm uppercase tracking-wider">Créer l'exercice</span>
              </div>
              <span className="text-indigo-100 text-xs font-bold truncate w-full">"{q}"</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 opacity-50">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Commencez à taper...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exercise row (view + edit inline) ───────────────────────────────────────
function ExerciseRow({
  ex,
  editMode,
  onDelete,
  onUpdate,
}: {
  ex: PlanExercise;
  editMode: boolean;
  planId: string;
  dayId: string;
  onDelete: () => void;
  onUpdate: (patch: Partial<PlanExercise>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [sets, setSets] = useState(String(ex.plannedSets));
  const [reps, setReps] = useState(String(ex.plannedReps));
  const [weight, setWeight] = useState(ex.plannedWeightKg != null ? String(ex.plannedWeightKg) : "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({
        plannedSets: Number(sets) || ex.plannedSets,
        plannedReps: Number(reps) || ex.plannedReps,
        plannedWeightKg: weight ? Number(weight) : null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group/ex">
      {editing ? (
        <div className="flex flex-col gap-2 py-3 border-b border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/5 -mx-3 px-3 rounded-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-indigo-300 uppercase tracking-wider truncate mr-2">
              {ex.exercise?.name ?? "Exercice"}
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setEditing(false)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={save} 
                disabled={saving} 
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-sm shadow-indigo-200 dark:shadow-none"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase ml-1">Séries</label>
              <input
                type="number" min="1" max="20"
                value={sets} onChange={(e) => setSets(e.target.value)}
                className="w-full text-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase ml-1">Reps</label>
              <input
                type="number" min="1" max="100"
                value={reps} onChange={(e) => setReps(e.target.value)}
                className="w-full text-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase ml-1">Poids (kg)</label>
              <input
                type="number" min="0" step="0.5"
                value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="0"
                className="w-full text-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-2.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0 group-hover/ex:bg-slate-50/50 dark:group-hover/ex:bg-white/5 -mx-1 px-1 rounded-lg transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 flex-shrink-0" />
          <span className="flex-1 text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{ex.exercise?.name ?? "Exercice"}</span>
          <span className="text-xs font-black text-slate-400 dark:text-slate-500 flex-shrink-0 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-md border border-slate-100 dark:border-white/5">
            {ex.plannedSets}×{ex.plannedReps}
            {ex.plannedWeightKg != null && <span className="text-indigo-600 dark:text-indigo-400"> @{ex.plannedWeightKg}kg</span>}
          </span>
          {editMode && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setEditing(true)} 
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 dark:hover:border-indigo-500/30 transition-all active:scale-90"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={onDelete} 
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-500/20 dark:hover:text-red-400 dark:hover:border-red-500/30 transition-all active:scale-90"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Day card for the calendar ────────────────────────────────────────────────
function DayCard({
  dayIndex,
  planDay,
  isToday,
  editMode,
  planId,
  onLogSession,
  onAddExercise,
  onDeleteExercise,
  onUpdateExercise,
  onDeleteDay,
  onEditDay,
}: {
  dayIndex: number;
  planDay?: PlanDay;
  isToday: boolean;
  editMode: boolean;
  planId: string;
  onLogSession: (d: PlanDay) => void;
  onAddExercise: (dayId: string, ex: Exercise) => Promise<void>;
  onDeleteExercise: (dayId: string, exId: string) => Promise<void>;
  onUpdateExercise: (dayId: string, exId: string, patch: Partial<PlanExercise>) => Promise<void>;
  onDeleteDay: (dayId: string) => Promise<void>;
  onEditDay: (dayId: string, data: { timeOfDay: string; trainingType: string; label?: string }) => Promise<void>;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [editingDay, setEditingDay] = useState(false);
  const [timeVal, setTimeVal] = useState(planDay?.timeOfDay ?? "08:00");
  const [typeVal, setTypeVal] = useState(planDay?.trainingType ?? "full_body");
  const [labelVal, setLabelVal] = useState(planDay?.label ?? "");
  const [savingDay, setSavingDay] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const exCount = planDay?.exercises.length ?? 0;
  const showAll = expanded || exCount <= 3;
  const visibleEx = showAll ? planDay?.exercises : planDay?.exercises.slice(0, 3);

  const saveDay = async () => {
    if (!planDay) return;
    setSavingDay(true);
    try {
      await onEditDay(planDay.id, { timeOfDay: timeVal, trainingType: typeVal, label: labelVal });
      setEditingDay(false);
    } finally {
      setSavingDay(false);
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden ${
        isToday
          ? "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400 dark:border-indigo-400/50 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
          : planDay
          ? "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-slate-600/80 shadow-sm"
          : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/30 opacity-40"
      }`}
    >
      {/* Day header */}
      <div className={`px-3 pt-3 pb-2 border-b ${isToday ? "border-white/15" : "border-slate-700/50"}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"}`}>
            {DAYS_FR[dayIndex]}
          </span>
          {isToday && (
            <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium">
              Aujourd&apos;hui
            </span>
          )}
          {editMode && planDay && (
            <div className="flex gap-0.5">
              <button
                onClick={() => { setEditingDay(!editingDay); setTimeVal(planDay.timeOfDay); setTypeVal(planDay.trainingType); setLabelVal(planDay.label ?? ""); }}
                className={`p-1 rounded transition-colors ${isToday ? "hover:bg-white/20 text-white/70" : "hover:bg-white/10 text-slate-400 hover:text-indigo-300"}`}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDeleteDay(planDay.id)}
                className={`p-1 rounded transition-colors ${isToday ? "hover:bg-red-500/30 text-white/70" : "hover:bg-red-500/20 text-slate-400 hover:text-red-400"}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Day body */}
      <div className="flex-1 flex flex-col px-3 py-2 gap-2">
        {planDay ? (
          <>
            {editingDay ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/20 shadow-inner">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Heure</label>
                    <input
                      type="time" value={timeVal}
                      onChange={(e) => setTimeVal(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Type</label>
                    <select
                      value={typeVal}
                      onChange={(e) => setTypeVal(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      {TRAINING_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Nom du jour (optionnel)</label>
                  <input
                    type="text" value={labelVal}
                    onChange={(e) => setLabelVal(e.target.value)}
                    placeholder="Ex: Séance Jambes"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditingDay(false)}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveDay} disabled={savingDay}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-indigo-200 dark:shadow-none active:scale-95"
                  >
                    {savingDay ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                    Prêt
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 ${isToday ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}>
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-black">{planDay.timeOfDay}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-black uppercase tracking-tight ${
                    isToday ? "bg-white/20 text-white border-white/20" : getTypeColor(planDay.trainingType)
                  }`}>
                    {getTrainingTypeEmoji(planDay.trainingType)} {getTrainingTypeLabel(planDay.trainingType, planDay.customType)}
                  </span>
                </div>
                {planDay.label && (
                  <p className={`text-[10px] font-bold uppercase tracking-widest px-1 ${isToday ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"}`}>
                    {planDay.label}
                  </p>
                )}

                {/* Exercises */}
                {exCount > 0 && (
                  <div className="space-y-0">
                    {(visibleEx ?? []).map((ex) => (
                      <ExerciseRow
                        key={ex.id}
                        ex={ex}
                        editMode={editMode}
                        planId={planId}
                        dayId={planDay.id}
                        onDelete={() => onDeleteExercise(planDay.id, ex.id)}
                        onUpdate={(patch) => onUpdateExercise(planDay.id, ex.id, patch)}
                      />
                    ))}
                    {exCount > 3 && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className={`text-xs mt-1 flex items-center gap-1 ${isToday ? "text-indigo-200 hover:text-white" : "text-indigo-400 hover:text-indigo-300"}`}
                      >
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {expanded ? "Réduire" : `+${exCount - 3} exercice${exCount - 3 > 1 ? "s" : ""}`}
                      </button>
                    )}
                  </div>
                )}

                {/* Add exercise in edit mode */}
                {editMode && (
                  <div className="relative mt-auto pt-1">
                    {showSearch ? (
                      <ExerciseSearch
                        onAdd={(ex) => { onAddExercise(planDay.id, ex); setShowSearch(false); }}
                        onClose={() => setShowSearch(false)}
                      />
                    ) : (
                      <button
                        onClick={() => setShowSearch(true)}
                        className={`w-full py-2 text-xs font-black uppercase tracking-widest rounded-xl border-2 border-dashed flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                          isToday
                            ? "border-white/30 text-white/60 hover:border-white/60 hover:text-white"
                            : "border-indigo-500/30 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-500/10"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter un exercice
                      </button>
                    )}
                  </div>
                )}

                {/* Log button in view mode */}
                {!editMode && (
                  <button
                    onClick={() => onLogSession(planDay)}
                    className={`mt-auto py-2.5 text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                      isToday
                        ? "bg-white text-indigo-600 hover:bg-indigo-50"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200 dark:shadow-none"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Commencer
                  </button>
                )}
              </>
            )}
          </>
        ) : editMode ? (
          <div className="text-xs text-slate-500 text-center py-2">Repos</div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Add day form ─────────────────────────────────────────────────────────────
function AddDayForm({
  onAdd,
  onCancel,
}: {
  onAdd: (d: { dayOfWeek: number; timeOfDay: string; trainingType: string; label?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [dow, setDow] = useState(1);
  const [time, setTime] = useState("08:00");
  const [type, setType] = useState("full_body");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await onAdd({ dayOfWeek: dow, timeOfDay: time, trainingType: type, label: label || undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10 space-y-4 backdrop-blur-sm shadow-xl shadow-indigo-900/10">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <CalendarDays className="w-4 h-4" />
        </div>
        <p className="text-sm font-black uppercase tracking-wider">Nouveau jour d&apos;entraînement</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Jour de la semaine</label>
          <select
            value={dow}
            onChange={(e) => setDow(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {DAYS_FULL_FR.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Heure prévue</label>
          <input
            type="time" value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Type de séance</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {TRAINING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Label (optionnel)</label>
          <input
            type="text" value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ex: Jambes"
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={submit} disabled={saving}
          className="flex-[2] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 active:scale-95 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Ajouter au planning
        </button>
      </div>
      </div>
    </div>
  );
}

// ─── Weight progress card ─────────────────────────────────────────────────────
function WeightProgress({
  initialWeightKg,
  targetWeightKg,
  latestMeasurement,
}: {
  initialWeightKg?: number | null;
  targetWeightKg?: number | null;
  latestMeasurement?: Measurement | null;
}) {
  if (!targetWeightKg) return null;

  const currentKg = latestMeasurement?.bodyWeightKg ?? initialWeightKg;
  const startKg = initialWeightKg ?? currentKg;
  if (!currentKg || !startKg) return null;

  const totalDelta = targetWeightKg - startKg;
  const done = currentKg - startKg;
  const pct = totalDelta !== 0 ? Math.min(100, Math.max(0, Math.round((done / totalDelta) * 100))) : 0;
  const remaining = Math.abs(targetWeightKg - currentKg);
  const isLoss = targetWeightKg < (startKg ?? 0);
  const isOnTrack = isLoss ? currentKg <= (startKg ?? 0) : currentKg >= (startKg ?? 0);

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Objectif poids</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pct >= 100 ? "bg-green-500/20 text-green-300" : "bg-indigo-500/20 text-indigo-300"}`}>
          {pct}%
        </span>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Départ</p>
          <p className="text-lg font-bold text-slate-200">{startKg} kg</p>
        </div>
        <div className="flex-1 flex flex-col items-center pb-2">
          <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #818cf8, #a78bfa)",
              }}
            />
          </div>
          {latestMeasurement?.bodyWeightKg && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {isOnTrack ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-orange-400" />}
              <span>{currentKg} kg</span>
              <span className="text-slate-500">— {fmtDateShort(latestMeasurement.date)}</span>
            </p>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Objectif</p>
          <p className="text-lg font-bold text-indigo-400">{targetWeightKg} kg</p>
        </div>
      </div>

      {pct < 100 && (
        <p className="text-xs text-slate-400 text-center">
          Encore <span className="font-semibold text-white">{remaining.toFixed(1)} kg</span> {isLoss ? "à perdre" : "à prendre"}
        </p>
      )}
      {pct >= 100 && (
        <p className="text-xs text-green-300 text-center font-medium">Objectif atteint ! 🎉</p>
      )}

      {!latestMeasurement?.bodyWeightKg && (
        <p className="text-xs text-slate-500 text-center mt-1 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Enregistre tes mensurations pour suivre la progression en temps réel
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
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
  const [showAddDay, setShowAddDay] = useState(false);
  const [latestMeasurement, setLatestMeasurement] = useState<Measurement | null>(null);

  // Edit draft state (only used when editMode = true)
  const [draftName, setDraftName] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [draftGoal, setDraftGoal] = useState("");
  const [draftCustomGoal, setDraftCustomGoal] = useState("");
  const [draftTargetWeight, setDraftTargetWeight] = useState("");
  const [draftInitialWeight, setDraftInitialWeight] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);

  // Fetch latest measurement for weight sync
  useEffect(() => {
    fetch(`${API_URL}/measurements`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const list: Measurement[] = Array.isArray(data) ? data : (data.measurements ?? []);
        const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const withWeight = sorted.find((m) => m.bodyWeightKg != null);
        if (withWeight) setLatestMeasurement(withWeight);
      })
      .catch(() => {});
  }, []);

  // Sync draft state when entering edit mode
  useEffect(() => {
    if (editMode && plan) {
      setDraftName(plan.name);
      setDraftDesc(plan.description ?? "");
      setDraftGoal(plan.bodyGoal ?? "");
      setDraftCustomGoal(plan.customGoal ?? "");
      setDraftTargetWeight(plan.targetWeightKg != null ? String(plan.targetWeightKg) : "");
      setDraftInitialWeight(plan.initialWeightKg != null ? String(plan.initialWeightKg) : "");
      setDraftNotes(plan.initialNotes ?? "");
      setDraftStartDate(plan.startDate ? plan.startDate.split("T")[0] : "");
      setDraftEndDate(plan.endDate ? plan.endDate.split("T")[0] : "");
    }
  }, [editMode, plan]);

  const handleSaveAllFields = async () => {
    if (!plan) return;
    setSavingPlan(true);
    try {
      await updatePlan(plan.id, {
        name: draftName || plan.name,
        description: draftDesc || null,
        bodyGoal: draftGoal || null,
        customGoal: draftGoal === "custom" ? draftCustomGoal : null,
        targetWeightKg: draftTargetWeight ? Number(draftTargetWeight) : null,
        initialWeightKg: draftInitialWeight ? Number(draftInitialWeight) : null,
        initialNotes: draftNotes || null,
        startDate: draftStartDate || null,
        endDate: draftEndDate || null,
      });
      await refetch();
      setEditMode(false);
      showToast("Plan mis à jour", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleToggleActive = async () => {
    if (!plan) return;
    try {
      await updatePlan(plan.id, { isActive: !plan.isActive });
      await refetch();
      showToast(plan.isActive ? "Plan désactivé" : "Plan activé", "success");
    } catch {
      showToast("Erreur", "error");
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    if (!window.confirm(`Supprimer "${plan.name}" ? Cette action est irréversible.`)) return;
    try {
      await deletePlan(plan.id);
      showToast("Plan supprimé", "success");
      navigate("/dashboard/training-plans");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleAddExercise = async (dayId: string, exercise: Partial<Exercise> & { name: string }) => {
    if (!plan) return;
    try {
      const res = await fetch(`${API_URL}/training-plans/${plan.id}/days/${dayId}/exercises`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          exerciseId: exercise.id,
          exerciseName: exercise.id ? undefined : exercise.name,
          plannedSets: 3,
          plannedReps: 10,
        }),
      });
      if (!res.ok) throw new Error("Erreur ajout exercice");
      await refetch();
      showToast(`${exercise.name} ajouté`, "success");
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

  const handleUpdateExercise = async (dayId: string, exId: string, patch: Partial<PlanExercise>) => {
    if (!plan) return;
    await fetch(`${API_URL}/training-plans/${plan.id}/days/${dayId}/exercises/${exId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(patch),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Erreur modification exercice");
      await refetch();
      showToast("Exercice mis à jour", "success");
    }).catch((err) => {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    });
  };

  const handleAddDay = async (data: { dayOfWeek: number; timeOfDay: string; trainingType: string; label?: string }) => {
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
      setShowAddDay(false);
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

  const handleEditDay = async (dayId: string, data: { timeOfDay: string; trainingType: string; label?: string }) => {
    if (!plan) return;
    try {
      const res = await fetch(`${API_URL}/training-plans/${plan.id}/days/${dayId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur modification jour");
      await refetch();
      showToast("Jour mis à jour", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur", "error");
    }
  };

  // ── Loading / error ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }
  if (error || !plan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-red-400 mb-4">{error ?? "Plan introuvable"}</p>
        <button onClick={() => navigate("/dashboard/training-plans")} className="text-indigo-400 hover:underline text-sm">
          Retour à mes plans
        </button>
      </div>
    );
  }

  const nextDay = getNextPlanDay(plan.days);
  const logs = plan.sessions ?? [];
  const todayDow = new Date().getDay();
  const totalExercises = plan.days.reduce((s, d) => s + d.exercises.length, 0);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div className="w-full bg-white dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-indigo-900/20 dark:via-slate-900 dark:to-slate-900 border-b border-slate-200 dark:border-white/5 px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10">
        <button
          onClick={() => navigate("/dashboard/training-plans")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-500 mb-6 transition-all group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Mes plans
        </button>

        {editMode ? (
          /* ─ EDIT MODE header ─ */
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5" />
                Mode édition
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAllFields} disabled={savingPlan}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {savingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nom du plan</label>
                <EditField value={draftName} onChange={setDraftName} placeholder="Ex: Programme masse" className="w-full text-xl font-bold" />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Objectif</label>
                <select
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-400"
                >
                  <option value="">— Aucun —</option>
                  {BODY_GOALS.map((g) => (
                    <option key={g.value} value={g.value}>{g.emoji} {g.label}</option>
                  ))}
                </select>
              </div>

              {draftGoal === "custom" && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Objectif personnalisé</label>
                  <EditField value={draftCustomGoal} onChange={setDraftCustomGoal} placeholder="Décrivez votre objectif" className="w-full text-sm" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Poids départ (kg)</label>
                <EditField value={draftInitialWeight} onChange={setDraftInitialWeight} type="number" placeholder="ex: 80" className="w-full text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Poids cible (kg)</label>
                <EditField value={draftTargetWeight} onChange={setDraftTargetWeight} type="number" placeholder="ex: 75" className="w-full text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date début</label>
                <EditField value={draftStartDate} onChange={setDraftStartDate} type="date" className="w-full text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date fin</label>
                <EditField value={draftEndDate} onChange={setDraftEndDate} type="date" className="w-full text-sm" />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <EditTextarea value={draftDesc} onChange={setDraftDesc} placeholder="Description du programme..." />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Notes pour l&apos;IA</label>
                <EditTextarea value={draftNotes} onChange={setDraftNotes} placeholder="Contraintes, préférences, informations pour les suggestions IA..." rows={3} />
              </div>
            </div>
          </div>
        ) : (
          /* ─ VIEW MODE header ─ */
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {plan.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${plan.isActive ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                      {plan.isActive ? "Actif" : "Inactif"}
                    </span>
                    {plan.bodyGoal && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {getBodyGoalEmoji(plan.bodyGoal)} {getBodyGoalLabel(plan.bodyGoal, plan.customGoal)}
                      </span>
                    )}
                  </div>
                </div>

                {plan.description && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                    {plan.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fréquence</p>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                      {plan.days.length} j<span className="text-slate-400 font-medium">/sem</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Exercices</p>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                      {totalExercises} <span className="text-slate-400 font-medium font-mono font-bold">Total</span>
                    </p>
                  </div>
                  {plan.initialWeightKg && plan.targetWeightKg && (
                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors col-span-2 md:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Objectif Poids</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{plan.initialWeightKg}kg</p>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{plan.targetWeightKg}kg</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded font-bold">
                          {Math.abs(plan.targetWeightKg - plan.initialWeightKg).toFixed(1)}kg de {plan.targetWeightKg > plan.initialWeightKg ? "gain" : "perte"}
                        </span>
                      </div>
                    </div>
                  )}
                  {(plan.startDate || plan.endDate) && (
                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors col-span-2 md:col-span-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Période du plan</p>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {plan.startDate && <span>Du {fmtDate(plan.startDate)}</span>}
                        {plan.endDate && <span>au {fmtDate(plan.endDate)}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
              <button
                onClick={handleToggleActive}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                  plan.isActive
                    ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-100"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100"
                }`}
              >
                {plan.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {plan.isActive ? "Actif" : "Inactif"}
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm shadow-indigo-100 dark:shadow-none"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center p-2.5 rounded-2xl border border-red-200 dark:border-red-500/30 bg-white dark:bg-red-500/5 text-red-500 dark:text-red-400 hover:bg-red-50 transition-all"
                title="Supprimer le plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ─ LEFT COLUMN (8/12) ─ */}
          <div className="xl:col-span-8 space-y-6">

            {/* ── WEEKLY CALENDAR ── */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  Planning hebdomadaire
                </h2>
                {editMode && (
                  <button
                    onClick={() => setShowAddDay(!showAddDay)}
                    className="flex items-center gap-1.5 text-[10px] sm:text-xs px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/10 active:scale-95 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter un jour
                  </button>
                )}
              </div>

              {/* Mobile: horizontal scroll | Desktop: 7-col grid */}
              <div className="hidden lg:grid lg:grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <DayCard
                    key={i}
                    dayIndex={i}
                    planDay={plan.days.find((d) => d.dayOfWeek === i)}
                    isToday={i === todayDow}
                    editMode={editMode}
                    planId={plan.id}
                    onLogSession={(d) => { setLogTargetDay(d); setLogModalOpen(true); }}
                    onAddExercise={handleAddExercise}
                    onDeleteExercise={handleDeleteExercise}
                    onUpdateExercise={handleUpdateExercise}
                    onDeleteDay={handleDeleteDay}
                    onEditDay={handleEditDay}
                  />
                ))}
              </div>

              {/* Mobile: horizontal scroll */}
              <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                {Array.from({ length: 7 }, (_, i) => {
                  const pd = plan.days.find((d) => d.dayOfWeek === i);
                  if (!pd && !editMode) return null;
                  return (
                    <div key={i} className="min-w-[180px] flex-shrink-0 snap-start">
                      <DayCard
                        dayIndex={i}
                        planDay={pd}
                        isToday={i === todayDow}
                        editMode={editMode}
                        planId={plan.id}
                        onLogSession={(d) => { setLogTargetDay(d); setLogModalOpen(true); }}
                        onAddExercise={handleAddExercise}
                        onDeleteExercise={handleDeleteExercise}
                        onUpdateExercise={handleUpdateExercise}
                        onDeleteDay={handleDeleteDay}
                        onEditDay={handleEditDay}
                      />
                    </div>
                  );
                })}
              </div>

              {editMode && showAddDay && (
                <div className="mt-4">
                  <AddDayForm onAdd={handleAddDay} onCancel={() => setShowAddDay(false)} />
                </div>
              )}
            </div>

            {/* ── NEXT SESSION ── */}
            {nextDay && (
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-6 shadow-lg shadow-indigo-200 dark:shadow-none">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="relative">
                  <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Prochaine séance
                  </p>
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="text-2xl font-black text-white">{DAYS_FULL_FR[nextDay.dayOfWeek]}</h3>
                      <p className="text-indigo-200 text-sm mt-0.5">
                        {nextDay.timeOfDay} · {getTrainingTypeEmoji(nextDay.trainingType)} {getTrainingTypeLabel(nextDay.trainingType, nextDay.customType)}
                      </p>
                    </div>
                    <button
                      onClick={() => { setLogTargetDay(nextDay); setLogModalOpen(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors backdrop-blur"
                    >
                      <Play className="w-4 h-4" />
                      Logger la séance
                    </button>
                  </div>
                  {nextDay.exercises.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      {nextDay.exercises.slice(0, 4).map((ex) => (
                        <div key={ex.id} className="flex items-center justify-between bg-white/10 dark:bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                          <span className="text-sm text-white flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-indigo-100" />
                            {ex.exercise?.name ?? "Exercice"}
                          </span>
                          <span className="text-xs text-white font-mono font-bold">
                            {ex.plannedSets}×{ex.plannedReps}
                            {ex.plannedWeightKg != null && <span className="text-indigo-100"> @{ex.plannedWeightKg}kg</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── PROGRESSION ── */}
            {progress && (
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-5">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Progression
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {/* Completion ring */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="relative mb-2">
                      <Ring pct={Math.round(progress.completionRate)} size={80} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{Math.round(progress.completionRate)}%</span>
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Complétion</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{progress.totalLoggedSessions}/{progress.totalPlannedSessions} séances</p>
                  </div>

                  {/* Streak */}
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20">
                    <span className="text-4xl font-black text-orange-400 flex items-center gap-1">
                      {progress.streakDays}
                      <Flame className="w-7 h-7" />
                    </span>
                    <p className="text-xs text-slate-400 font-medium mt-1">Jours de streak</p>
                  </div>

                  {/* Mood avg */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <span className="text-4xl mb-1">
                      {progress.averageMoodScore != null ? getMoodEmoji(Math.round(progress.averageMoodScore)) : "—"}
                    </span>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Humeur moyenne</p>
                    {progress.averageMoodScore != null && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{progress.averageMoodScore.toFixed(1)}/5</p>
                    )}
                  </div>
                </div>

                {/* 4-week chart */}
                {progress.weeklyBreakdown.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">4 dernières semaines</p>
                    <div className="flex gap-3 items-end h-24">
                      {progress.weeklyBreakdown.slice(-4).map((w, i) => {
                        const pct = w.planned > 0 ? Math.min((w.logged / w.planned) * 100, 100) : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                            <div className="w-full flex-1 bg-slate-800 rounded-lg overflow-hidden relative">
                              <div
                                className="absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-700"
                                style={{
                                  height: `${pct}%`,
                                  background: pct >= 80 ? "linear-gradient(180deg, #818cf8, #6366f1)" : pct >= 50 ? "linear-gradient(180deg, #a78bfa, #8b5cf6)" : "linear-gradient(180deg, #cbd5e1, #94a3b8)",
                                }}
                              />
                            </div>
                            <div className="text-center">
                              <span className="text-xs font-bold text-white">{Math.round(pct)}%</span>
                              <span className="block text-xs text-slate-500">S{i + 1}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SESSION HISTORY ── */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <ListChecks className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Historique des séances
              </h2>
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Dumbbell className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">Aucune séance enregistrée</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Commence par logger ta première séance !</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 8).map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        log.skipped
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/30 opacity-60"
                          : "bg-slate-50/50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50 hover:border-indigo-100 dark:hover:border-slate-600/80"
                      }`}
                    >
                      <span className="text-xl flex-shrink-0 mt-0.5">
                        {log.skipped ? "⏭️" : log.moodScore ? getMoodEmoji(log.moodScore) : "✅"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{fmtDate(log.date)}</p>
                          {log.skipped && (
                            <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Sautée</span>
                          )}
                          {log.moodScore && !log.skipped && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{log.moodScore}/5</span>
                          )}
                        </div>
                        {log.moodNote && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">{log.moodNote}</p>
                        )}
                        {log.skipReason && (
                          <p className="text-xs text-slate-500 mt-0.5 italic truncate">{log.skipReason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {logs.length > 8 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-1 font-medium">+{logs.length - 8} séances supplémentaires</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─ RIGHT COLUMN (4/12) ─ */}
          <div className="xl:col-span-4 space-y-5">

            {/* Weight sync */}
            <WeightProgress
              initialWeightKg={plan.initialWeightKg}
              targetWeightKg={plan.targetWeightKg}
              latestMeasurement={latestMeasurement}
            />

            {/* Stats summary */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Résumé du plan
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Séances/sem", value: plan.days.length, unit: "jours" },
                  { label: "Exercices", value: totalExercises, unit: "planifiés" },
                  { label: "Complétion", value: progress ? `${Math.round(progress.completionRate)}%` : "—", unit: "30 jours" },
                  { label: "Streak", value: progress?.streakDays ?? 0, unit: "jours" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-700/40">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{stat.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan notes */}
            {plan.initialNotes && (
              <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4">
                <h2 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Notes & contexte
                </h2>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{plan.initialNotes}</p>
              </div>
            )}

            {/* AI insights */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
              <AIPlanInsights planId={plan.id} />
            </div>
          </div>
        </div>
      </div>

      {/* ── LOG MODAL ── */}
      {logModalOpen && logTargetDay && (
        <LogPlanSessionModal
          planId={plan.id}
          planDay={logTargetDay}
          onClose={() => { setLogModalOpen(false); setLogTargetDay(null); }}
          onLogged={() => { refetch(); setLogModalOpen(false); setLogTargetDay(null); }}
        />
      )}
    </div>
  );
};

export default TrainingPlanDashboard;
