import React, { useState, useEffect } from "react";
import { Habit } from "../../types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../pages/ui/select";
import { Loader2, Droplet, Moon, Apple, Dumbbell, Heart } from "lucide-react";

interface HabitFormProps {
  habit?: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const categoryIcons = {
  hydration: Droplet,
  sleep: Moon,
  nutrition: Apple,
  exercise: Dumbbell,
  wellness: Heart,
};

const categoryLabels = {
  hydration: "💧 Hydratation",
  sleep: "😴 Sommeil",
  nutrition: "🥗 Nutrition",
  exercise: "💪 Exercice",
  wellness: "🧘 Bien-être",
};

export function HabitForm({
  habit,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: HabitFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "hydration" as Habit["category"],
    targetFrequency: "DAILY" as Habit["targetFrequency"],
    targetCount: "",
    reminderTime: "",
    reminderEnabled: true,
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        category: habit.category,
        targetFrequency: habit.targetFrequency,
        targetCount: habit.targetCount?.toString() || "",
        reminderTime: habit.reminderTime || "",
        reminderEnabled: habit.reminderEnabled,
        startDate: new Date(habit.startDate).toISOString().split("T")[0],
      });
    } else {
      setFormData({
        name: "",
        category: "hydration",
        targetFrequency: "DAILY",
        targetCount: "",
        reminderTime: "",
        reminderEnabled: true,
        startDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [habit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      category: formData.category,
      targetFrequency: formData.targetFrequency,
      targetCount: formData.targetCount ? parseFloat(formData.targetCount) : undefined,
      reminderTime: formData.reminderTime || undefined,
      reminderEnabled: formData.reminderEnabled,
      startDate: formData.startDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {habit ? "Modifier l'habitude" : "Nouvelle habitude"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'habitude *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Boire 1.5L d'eau"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as Habit["category"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => {
                  const Icon = categoryIcons[key as keyof typeof categoryIcons];
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetFrequency">Fréquence *</Label>
            <Select
              value={formData.targetFrequency}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  targetFrequency: value as Habit["targetFrequency"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Quotidienne</SelectItem>
                <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                <SelectItem value="MONTHLY">Mensuelle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetCount">
              Quantité cible (optionnel)
            </Label>
            <Input
              id="targetCount"
              type="number"
              step="0.1"
              value={formData.targetCount}
              onChange={(e) =>
                setFormData({ ...formData, targetCount: e.target.value })
              }
              placeholder="Ex: 1.5 (pour 1.5L)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderTime">Heure de rappel (optionnel)</Label>
            <Input
              id="reminderTime"
              type="time"
              value={formData.reminderTime}
              onChange={(e) =>
                setFormData({ ...formData, reminderTime: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

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
                  {habit ? "Modification..." : "Création..."}
                </>
              ) : (
                habit ? "Modifier" : "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
