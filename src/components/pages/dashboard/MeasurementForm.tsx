import React, { useState } from "react";
import { Measurement } from "../../../types";
import { Button } from "../ui/button";
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

// Composant CompactInput défini EN DEHORS du composant principal pour éviter les re-renders
interface CompactInputProps {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ElementType;
}

const CompactInput: React.FC<CompactInputProps> = ({ name, label, placeholder, value, onChange, icon: Icon }) => (
  <div className="space-y-1.5">
    <Label htmlFor={name} className="text-xs font-medium text-muted-foreground">
      {label}
    </Label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <input
        type="text"
        inputMode="decimal"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full h-10 bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all ${Icon ? "pl-10" : "pl-3"} pr-10`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
        {name === "bodyWeightKg" ? "kg" : "cm"}
      </span>
    </div>
  </div>
);

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
  const toLocalDateTimeInput = (d: Date) => {
    // datetime-local expects YYYY-MM-DDTHH:mm in local time (no TZ suffix).
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    date: measurement?.date
      ? toLocalDateTimeInput(new Date(measurement.date))
      : toLocalDateTimeInput(new Date()),
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
    // Autoriser les chiffres, le point et la virgule pour les décimales
    if (name !== "date" && name !== "notes") {
      // Remplacer virgule par point et ne garder que les caractères valides
      const sanitizedValue = value.replace(",", ".").replace(/[^0-9.]/g, "");
      // Éviter plusieurs points
      const parts = sanitizedValue.split(".");
      const finalValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitizedValue;
      setFormData((prev) => ({ ...prev, [name]: finalValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert local datetime-local string to ISO so backend stores a precise instant.
    await onSubmit({ ...formData, date: new Date(formData.date).toISOString() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date & Weight Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs font-medium text-muted-foreground">
            Date & heure <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full h-10 bg-muted/30 border border-border/50 text-foreground pl-10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
        <CompactInput name="bodyWeightKg" label="Poids" placeholder="75.5" value={formData.bodyWeightKg} onChange={handleChange} icon={Scale} />
      </div>

      {/* Main Measurements - 2x2 Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Mesures principales</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
          <CompactInput name="chestCm" label="Poitrine" placeholder="100" value={formData.chestCm} onChange={handleChange} />
          <CompactInput name="waistCm" label="Taille" placeholder="80" value={formData.waistCm} onChange={handleChange} />
          <CompactInput name="hipsCm" label="Hanches" placeholder="95" value={formData.hipsCm} onChange={handleChange} />
          <CompactInput name="shouldersCm" label="Épaules" placeholder="120" value={formData.shouldersCm} onChange={handleChange} />
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
              <CompactInput name="leftArmCm" label="Biceps gauche" placeholder="35" value={formData.leftArmCm} onChange={handleChange} />
              <CompactInput name="rightArmCm" label="Biceps droit" placeholder="35" value={formData.rightArmCm} onChange={handleChange} />
            </div>
          </div>

          {/* Legs */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jambes</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
              <CompactInput name="leftThighCm" label="Cuisse G" placeholder="60" value={formData.leftThighCm} onChange={handleChange} />
              <CompactInput name="rightThighCm" label="Cuisse D" placeholder="60" value={formData.rightThighCm} onChange={handleChange} />
              <CompactInput name="leftCalfCm" label="Mollet G" placeholder="38" value={formData.leftCalfCm} onChange={handleChange} />
              <CompactInput name="rightCalfCm" label="Mollet D" placeholder="38" value={formData.rightCalfCm} onChange={handleChange} />
            </div>
          </div>

          {/* Other */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Autre</span>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
              <CompactInput name="neckCm" label="Cou" placeholder="40" value={formData.neckCm} onChange={handleChange} />
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
