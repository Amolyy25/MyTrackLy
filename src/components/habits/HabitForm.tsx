import React, { useState, useEffect } from "react";
import { Habit, HabitCategory } from "../../types";
import { Button } from "../pages/ui/button";
import { Label } from "../pages/ui/label";
import { Input } from "../pages/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../pages/ui/dialog";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { HABIT_CATEGORIES, HABIT_UNITS, DAYS_SHORT, getCategoryConfig } from "../../utils/habitHelpers";

interface HabitFormProps {
  habit?: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function HabitForm({
  habit,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: HabitFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "hydration" as HabitCategory,
    icon: "",
    color: "",
    targetFrequency: "DAILY" as "DAILY" | "WEEKLY" | "MONTHLY",
    targetCount: "",
    targetUnit: "",
    daysOfWeek: [] as number[],
    reminderTime: "",
    reminderEnabled: true,
    startDate: new Date().toISOString().split("T")[0],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
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
        reminderTime: habit.reminderTime || "",
        reminderEnabled: habit.reminderEnabled,
        startDate: new Date(habit.startDate).toISOString().split("T")[0],
      });
      setShowAdvanced(!!habit.description || !!habit.icon || !!habit.color || (habit.daysOfWeek?.length ?? 0) > 0);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "hydration",
        icon: "",
        color: "",
        targetFrequency: "DAILY",
        targetCount: "",
        targetUnit: "",
        daysOfWeek: [],
        reminderTime: "",
        reminderEnabled: true,
        startDate: new Date().toISOString().split("T")[0],
      });
      setShowAdvanced(false);
    }
  }, [habit, open]);

  // Auto-set unit from category
  const handleCategoryChange = (cat: HabitCategory) => {
    const config = getCategoryConfig(cat);
    setFormData({
      ...formData,
      category: cat,
      icon: config.emoji,
      color: config.color,
      targetUnit: formData.targetUnit || config.defaultUnit || "",
    });
  };

  const toggleDay = (day: number) => {
    const days = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter((d) => d !== day)
      : [...formData.daysOfWeek, day];
    setFormData({ ...formData, daysOfWeek: days });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      reminderTime: formData.reminderTime || undefined,
      reminderEnabled: formData.reminderEnabled,
      startDate: formData.startDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {habit ? "Modifier l'habitude" : "Nouvelle habitude"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'habitude *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Boire 2L d'eau par jour"
              required
              className="text-base"
            />
          </div>

          {/* Category grid */}
          <div className="space-y-2">
            <Label>Categorie *</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {HABIT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center ${
                    formData.category === cat.value
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                      : "border-transparent bg-gray-50 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequence *</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "DAILY", label: "Quotidienne", sub: "Tous les jours" },
                { value: "WEEKLY", label: "Hebdo", sub: "1x par semaine" },
                { value: "MONTHLY", label: "Mensuelle", sub: "1x par mois" },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, targetFrequency: f.value as any })}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    formData.targetFrequency === f.value
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{f.label}</p>
                  <p className="text-[10px] text-gray-400">{f.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target count + unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="targetCount">Objectif (optionnel)</Label>
              <Input
                id="targetCount"
                type="number"
                step="0.1"
                value={formData.targetCount}
                onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                placeholder="Ex: 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetUnit">Unite</Label>
              <select
                value={formData.targetUnit}
                onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {HABIT_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reminder time */}
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Heure de rappel</Label>
            <div className="flex items-center gap-3">
              <Input
                id="reminderTime"
                type="time"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                className="flex-1"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reminderEnabled}
                  onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Actif</span>
              </label>
            </div>
            <p className="text-[10px] text-gray-400">Recevez une notification push et un email a cette heure</p>
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Options avancees
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes, motivation, details..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                />
              </div>

              {/* Days of week (for DAILY) */}
              {formData.targetFrequency === "DAILY" && (
                <div className="space-y-2">
                  <Label>Jours specifiques (optionnel)</Label>
                  <p className="text-[10px] text-gray-400">Laissez vide pour tous les jours</p>
                  <div className="flex gap-1.5">
                    {DAYS_SHORT.map((day, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          formData.daysOfWeek.includes(i)
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom icon */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="icon">Emoji/icone</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="💧"
                    maxLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color || "#6366f1"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                    />
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Start date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de debut</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {habit ? "Modification..." : "Creation..."}
                </>
              ) : (
                habit ? "Modifier" : "Creer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
