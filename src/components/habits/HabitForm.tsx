import React, { useState, useEffect } from "react";
import { Habit, HabitCategory, HabitFrequency } from "../../types";
import { Loader2, ChevronDown, ChevronUp, ChevronLeft, X, Bell, BellOff, Calendar, Repeat, Target as TargetIcon } from "lucide-react";
import { HABIT_CATEGORIES, HABIT_UNITS, DAYS_SHORT, getCategoryConfig } from "../../utils/habitHelpers";

interface HabitFormProps {
  habit?: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  category: HabitCategory;
  icon: string;
  color: string;
  targetFrequency: HabitFrequency;
  targetCount: string;
  targetUnit: string;
  daysOfWeek: number[];
  everyXDays: string;
  reminderTime: string;
  reminderEnabled: boolean;
  startDate: string;
}

const FREQUENCIES: { value: HabitFrequency; label: string; sub: string; icon: string }[] = [
  { value: "DAILY", label: "Tous les jours", sub: "Chaque jour", icon: "📅" },
  { value: "SPECIFIC_DAYS", label: "Certains jours", sub: "Lun, Mar, Ven...", icon: "🗓️" },
  { value: "EVERY_X_DAYS", label: "Tous les X jours", sub: "Tous les 2, 3 jours...", icon: "🔄" },
  { value: "WEEKLY", label: "Hebdomadaire", sub: "1x par semaine", icon: "📆" },
  { value: "BIWEEKLY", label: "Toutes les 2 sem.", sub: "1x toutes les 2 semaines", icon: "📋" },
  { value: "MONTHLY", label: "Mensuelle", sub: "1x par mois", icon: "🗓️" },
];

export function HabitForm({
  habit,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: HabitFormProps) {
  const [step, setStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "hydration",
    icon: "",
    color: "",
    targetFrequency: "DAILY",
    targetCount: "",
    targetUnit: "",
    daysOfWeek: [],
    everyXDays: "2",
    reminderTime: "",
    reminderEnabled: true,
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!open) return;
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description ?? "",
        category: habit.category,
        icon: habit.icon ?? "",
        color: habit.color ?? "",
        targetFrequency: habit.targetFrequency,
        targetCount: habit.targetCount?.toString() || "",
        targetUnit: habit.targetUnit ?? "",
        daysOfWeek: habit.daysOfWeek ?? [],
        everyXDays: habit.everyXDays?.toString() || "2",
        reminderTime: habit.reminderTime || "",
        reminderEnabled: habit.reminderEnabled,
        startDate: new Date(habit.startDate).toISOString().split("T")[0],
      });
      setStep(1);
      setShowAdvanced(!!habit.description || !!habit.icon || !!habit.color);
    } else {
      setFormData({
        name: "", description: "", category: "hydration", icon: "", color: "",
        targetFrequency: "DAILY", targetCount: "", targetUnit: "",
        daysOfWeek: [], everyXDays: "2", reminderTime: "", reminderEnabled: true,
        startDate: new Date().toISOString().split("T")[0],
      });
      setStep(1);
      setShowAdvanced(false);
    }
  }, [habit, open]);

  const handleCategoryChange = (cat: HabitCategory) => {
    const config = getCategoryConfig(cat);
    setFormData({ ...formData, category: cat, icon: config.emoji, color: config.color, targetUnit: formData.targetUnit || config.defaultUnit || "" });
  };

  const toggleDay = (day: number) => {
    const days = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter((d) => d !== day)
      : [...formData.daysOfWeek, day];
    setFormData({ ...formData, daysOfWeek: days });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    await onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      icon: formData.icon || undefined,
      color: formData.color || undefined,
      targetFrequency: formData.targetFrequency,
      targetCount: formData.targetCount ? parseFloat(formData.targetCount) : undefined,
      targetUnit: formData.targetUnit || undefined,
      daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
      everyXDays: formData.targetFrequency === "EVERY_X_DAYS" ? parseInt(formData.everyXDays) || 2 : undefined,
      reminderTime: formData.reminderTime || undefined,
      reminderEnabled: formData.reminderEnabled,
      startDate: formData.startDate,
    });
  };

  if (!open) return null;

  const canGoNext = () => {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) {
      if (formData.targetFrequency === "SPECIFIC_DAYS") return formData.daysOfWeek.length > 0;
      return true;
    }
    return true;
  };

  const totalSteps = 3;
  const selectedCatConfig = getCategoryConfig(formData.category);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] sm:mx-4 animate-in slide-in-from-bottom duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {habit ? "Modifier" : "Nouvelle habitude"}
              </h2>
              <p className="text-xs text-gray-400">Etape {step}/{totalSteps}</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <div className="h-full bg-indigo-600 transition-all duration-300 rounded-r-full" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nom de l'habitude
                </label>
                <input
                  autoFocus
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Boire 2L d'eau"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Categorie</label>
                <div className="grid grid-cols-3 gap-2">
                  {HABIT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        formData.category === cat.value
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm"
                          : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 active:scale-95"
                      }`}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 leading-tight text-center">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Objectif <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.targetCount}
                    onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                    placeholder="Ex: 2"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={formData.targetUnit}
                    onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                    className="w-28 px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {HABIT_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-indigo-500" />
                  A quelle frequence ?
                </label>
                <div className="space-y-2">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, targetFrequency: f.value })}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                        formData.targetFrequency === f.value
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                          : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                    >
                      <span className="text-xl">{f.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{f.label}</p>
                        <p className="text-[11px] text-gray-400">{f.sub}</p>
                      </div>
                      {formData.targetFrequency === f.value && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {formData.targetFrequency === "SPECIFIC_DAYS" && (
                <div className="space-y-2 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20">
                  <label className="block text-sm font-semibold text-indigo-700 dark:text-indigo-300">Quels jours ?</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS_SHORT.map((day, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all active:scale-90 ${
                          formData.daysOfWeek.includes(i)
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {formData.daysOfWeek.length > 0 && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                      {formData.daysOfWeek.length} jour{formData.daysOfWeek.length > 1 ? "s" : ""} selectionne{formData.daysOfWeek.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}

              {formData.targetFrequency === "EVERY_X_DAYS" && (
                <div className="space-y-2 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20">
                  <label className="block text-sm font-semibold text-indigo-700 dark:text-indigo-300">Tous les combien de jours ?</label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Tous les</span>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={formData.everyXDays}
                      onChange={(e) => setFormData({ ...formData, everyXDays: e.target.value })}
                      className="w-20 px-3 py-3 rounded-xl border border-indigo-300 dark:border-indigo-500/30 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 text-center text-lg font-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-500">jours</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-500" />
                  Rappel
                </label>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <input
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, reminderEnabled: !formData.reminderEnabled })}
                    className={`p-3 rounded-xl transition-all ${
                      formData.reminderEnabled ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}
                  >
                    {formData.reminderEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Notification push + email a cette heure</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description <span className="font-normal text-gray-400">(optionnel)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes, motivation, details..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Date de debut
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Personnalisation avancee
              </button>

              {showAdvanced && (
                <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase">Emoji</label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder={selectedCatConfig.emoji}
                        maxLength={4}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase">Couleur</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.color || selectedCatConfig.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          placeholder={selectedCatConfig.color}
                          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recap */}
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Recap</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{formData.icon || selectedCatConfig.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.name || "..."}</p>
                    <p className="text-xs text-gray-500">
                      {FREQUENCIES.find((f) => f.value === formData.targetFrequency)?.label}
                      {formData.targetFrequency === "SPECIFIC_DAYS" && formData.daysOfWeek.length > 0 &&
                        ` (${formData.daysOfWeek.map((d) => DAYS_SHORT[d]).join(", ")})`}
                      {formData.targetFrequency === "EVERY_X_DAYS" && ` (${formData.everyXDays}j)`}
                      {formData.targetCount && ` — ${formData.targetCount}${formData.targetUnit ? " " + formData.targetUnit : ""}`}
                    </p>
                    {formData.reminderTime && (
                      <p className="text-xs text-indigo-500 mt-0.5">Rappel a {formData.reminderTime}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          {step < totalSteps ? (
            <>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
                className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors active:scale-95"
              >
                Suivant
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !formData.name.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TargetIcon className="w-4 h-4" />
                )}
                {isLoading ? "Enregistrement..." : habit ? "Modifier" : "Creer l'habitude"}
              </button>
            </>
          )}
        </div>

        <div className="h-[env(safe-area-inset-bottom)] flex-shrink-0" />
      </div>
    </div>
  );
}
