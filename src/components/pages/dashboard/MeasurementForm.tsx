import React, { useState } from "react";
import { Measurement } from "../../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Calendar,
  Scale,
  User,
  Loader2,
  Save,
  X,
  ChevronDown,
} from "lucide-react";

interface MeasurementFormProps {
  measurement?: Measurement | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({
  measurement,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    date: measurement?.date
      ? new Date(measurement.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    bodyWeightKg: measurement?.bodyWeightKg?.toString() || "",
    leftArmCm: measurement?.leftArmCm?.toString() || "",
    rightArmCm: measurement?.rightArmCm?.toString() || "",
    leftCalfCm: measurement?.leftCalfCm?.toString() || "",
    rightCalfCm: measurement?.rightCalfCm?.toString() || "",
    chestCm: measurement?.chestCm?.toString() || "",
    waistCm: measurement?.waistCm?.toString() || "",
    hipsCm: measurement?.hipsCm?.toString() || "",
    leftThighCm: measurement?.leftThighCm?.toString() || "",
    rightThighCm: measurement?.rightThighCm?.toString() || "",
    neckCm: measurement?.neckCm?.toString() || "",
    shouldersCm: measurement?.shouldersCm?.toString() || "",
    notes: measurement?.notes || "",
  });

  const [showMore, setShowMore] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const CompactInput = ({ name, label, placeholder, icon: Icon }: {
    name: string;
    label: string;
    placeholder: string;
    icon?: React.ElementType;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <Input
          type="number"
          id={name}
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          step="0.1"
          min="0"
          placeholder={placeholder}
          className={`h-10 bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${Icon ? "pl-10" : ""} pr-10`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {name === "bodyWeightKg" ? "kg" : "cm"}
        </span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date & Weight Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs font-medium text-muted-foreground">
            Date <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </div>
            <Input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="h-10 bg-muted/30 border-border/50 text-foreground pl-10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <CompactInput name="bodyWeightKg" label="Poids" placeholder="75.5" icon={Scale} />
      </div>

      {/* Main Measurements - 2x2 Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Mesures principales</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
          <CompactInput name="chestCm" label="Poitrine" placeholder="100" />
          <CompactInput name="waistCm" label="Taille" placeholder="80" />
          <CompactInput name="hipsCm" label="Hanches" placeholder="95" />
          <CompactInput name="shouldersCm" label="Épaules" placeholder="120" />
        </div>
      </div>

      {/* Toggle More Measurements */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/30"
      >
        <span>{showMore ? "Moins de mesures" : "Plus de mesures"}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
      </button>

      {/* Additional Measurements */}
      {showMore && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Arms */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bras</span>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
              <CompactInput name="leftArmCm" label="Biceps gauche" placeholder="35" />
              <CompactInput name="rightArmCm" label="Biceps droit" placeholder="35" />
            </div>
          </div>

          {/* Legs */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jambes</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
              <CompactInput name="leftThighCm" label="Cuisse G" placeholder="60" />
              <CompactInput name="rightThighCm" label="Cuisse D" placeholder="60" />
              <CompactInput name="leftCalfCm" label="Mollet G" placeholder="38" />
              <CompactInput name="rightCalfCm" label="Mollet D" placeholder="38" />
            </div>
          </div>

          {/* Other */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Autre</span>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
              <CompactInput name="neckCm" label="Cou" placeholder="40" />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground">
          Notes (optionnel)
        </Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          placeholder="Commentaires sur cette mesure..."
          className="w-full px-4 py-2.5 bg-muted/30 border border-border/50 rounded-lg text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        />
      </div>

      {/* Action Buttons - Sticky */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 h-11 rounded-xl border-border/50 bg-transparent hover:bg-muted text-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {measurement ? "Modifier" : "Enregistrer"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default MeasurementForm;
