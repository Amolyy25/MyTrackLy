import React, { useState, useEffect, useMemo } from "react";
import {
  useCoachAvailabilities,
  AvailabilitySlot,
} from "../../../../hooks/useAvailabilities";
import { useToast } from "../../../../contexts/ToastContext";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Settings,
  Sparkles,
  CalendarDays,
  Timer,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Sunrise,
  Coffee,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const DAYS_OF_WEEK = [
  { name: "Dimanche", short: "Dim", icon: Coffee },
  { name: "Lundi", short: "Lun", icon: Sunrise },
  { name: "Mardi", short: "Mar", icon: Sun },
  { name: "Mercredi", short: "Mer", icon: Sun },
  { name: "Jeudi", short: "Jeu", icon: Sun },
  { name: "Vendredi", short: "Ven", icon: Sun },
  { name: "Samedi", short: "Sam", icon: Moon },
];

type TabType = "overview" | "config";

const Availabilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const {
    availabilities,
    slotDuration,
    isLoading,
    error,
    saveAvailabilities,
    refetch,
  } = useCoachAvailabilities();
  const { showToast } = useToast();
  const [localAvailabilities, setLocalAvailabilities] = useState<
    AvailabilitySlot[]
  >([]);
  const [localSlotDuration, setLocalSlotDuration] = useState<number>(60);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Synchroniser l'état local avec les données chargées
  useEffect(() => {
    if (availabilities) {
      setLocalAvailabilities(availabilities);
    }
    if (slotDuration) {
      setLocalSlotDuration(slotDuration);
    }
  }, [availabilities, slotDuration]);

  // Stats
  const stats = useMemo(() => {
    const activeDays = new Set(localAvailabilities.map((s) => s.dayOfWeek)).size;
    const totalSlots = localAvailabilities.length;
    const totalHours = localAvailabilities.reduce((acc, slot) => {
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return acc + (endMinutes - startMinutes) / 60;
    }, 0);
    const creneauxPerWeek = Math.floor(
      (totalHours * 60) / (localSlotDuration || 60)
    );

    return { activeDays, totalSlots, totalHours, creneauxPerWeek };
  }, [localAvailabilities, localSlotDuration]);

  const handleAddSlot = (dayIndex: number) => {
    setLocalAvailabilities([
      ...localAvailabilities,
      {
        dayOfWeek: dayIndex,
        startTime: "09:00",
        endTime: "17:00",
        isActive: true,
      },
    ]);
    setExpandedDay(dayIndex);
    setHasUnsavedChanges(true);
  };

  const handleRemoveSlot = (index: number) => {
    const newAvailabilities = [...localAvailabilities];
    newAvailabilities.splice(index, 1);
    setLocalAvailabilities(newAvailabilities);
    setHasUnsavedChanges(true);
  };

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newAvailabilities = [...localAvailabilities];
    newAvailabilities[index] = { ...newAvailabilities[index], [field]: value };
    setLocalAvailabilities(newAvailabilities);
    setHasUnsavedChanges(true);
  };

  const handleSlotDurationChange = (duration: number) => {
    setLocalSlotDuration(duration);
    setHasUnsavedChanges(true);
  };

  const handleSave = async (newSlots?: AvailabilitySlot[], newDuration?: number) => {
    try {
      setIsSaving(true);
      await saveAvailabilities(
        newSlots ?? localAvailabilities, 
        newDuration ?? localSlotDuration
      );
      setHasUnsavedChanges(false);
      showToast("Disponibilités enregistrées avec succès !", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour appliquer un modèle et sauvegarder automatiquement
  const applyTemplate = async (templateSlots: AvailabilitySlot[], templateName: string) => {
    setLocalAvailabilities(templateSlots);
    try {
      setIsSaving(true);
      await saveAvailabilities(templateSlots, localSlotDuration);
      setHasUnsavedChanges(false);
      showToast(`Modèle "${templateName}" appliqué et enregistré`, "success");
    } catch (err) {
      setHasUnsavedChanges(true);
      showToast(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "overview" as TabType, label: "Aperçu", icon: Sparkles },
    { id: "config" as TabType, label: "Configuration", icon: Settings },
  ];

  if (isLoading && localAvailabilities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Chargement des disponibilités...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 shadow-sm">
            <Clock className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Disponibilités
            </h1>
            <p className="text-muted-foreground text-sm">
              Configurez vos créneaux de coaching
            </p>
          </div>
        </div>
        <Button
          className={`h-11 px-6 rounded-xl gap-2 transition-all ${
            hasUnsavedChanges 
              ? "bg-primary hover:bg-primary/90 ring-2 ring-primary/30 ring-offset-2" 
              : "bg-primary hover:bg-primary/90"
          }`}
          onClick={() => handleSave()}
          disabled={isSaving}
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {hasUnsavedChanges ? "Enregistrer *" : "Enregistrer"}
        </Button>
      </div>

      {/* Unsaved changes warning */}
      {hasUnsavedChanges && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-700 font-medium">
                Vous avez des modifications non enregistrées
              </p>
            </div>
            <Button
              size="sm"
              className="rounded-lg gap-2"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <p className="text-sm text-rose-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Jours actifs
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.activeDays}
                      </p>
                      <p className="text-xs text-muted-foreground">/ 7 jours</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarDays className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 to-violet-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Plages horaires
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.totalSlots}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        configurées
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="h-5 w-5 text-violet-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Heures / semaine
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.totalHours.toFixed(0)}h
                      </p>
                      <p className="text-xs text-muted-foreground">
                        disponibles
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Timer className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10 overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Créneaux
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stats.creneauxPerWeek}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        / semaine
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Schedule */}
            <Card className="border-border/50 bg-card">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Planning hebdomadaire
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Durée des créneaux : {localSlotDuration} min
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {DAYS_OF_WEEK.map((day, dayIndex) => {
                    const daySlots = localAvailabilities.filter(
                      (slot) => slot.dayOfWeek === dayIndex
                    );
                    const isExpanded = expandedDay === dayIndex;
                    const DayIcon = day.icon;
                    const hasSlots = daySlots.length > 0;

                    return (
                      <div
                        key={dayIndex}
                        className={`transition-colors ${
                          hasSlots ? "bg-background" : "bg-muted/20"
                        }`}
                      >
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() =>
                            setExpandedDay(isExpanded ? null : dayIndex)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                hasSlots
                                  ? "bg-emerald-500/10"
                                  : "bg-muted"
                              }`}
                            >
                              <DayIcon
                                className={`h-5 w-5 ${
                                  hasSlots
                                    ? "text-emerald-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {day.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {hasSlots
                                  ? `${daySlots.length} plage${
                                      daySlots.length > 1 ? "s" : ""
                                    } horaire${daySlots.length > 1 ? "s" : ""}`
                                  : "Non disponible"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {hasSlots && (
                              <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
                                {daySlots.slice(0, 2).map((slot, i) => (
                                  <span
                                    key={i}
                                    className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-medium"
                                  >
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                ))}
                                {daySlots.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{daySlots.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddSlot(dayIndex);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <div
                              className={`transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            >
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Slots */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                            {daySlots.length === 0 ? (
                              <div className="text-center py-6">
                                <p className="text-muted-foreground text-sm mb-3">
                                  Aucune disponibilité pour ce jour
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg gap-2"
                                  onClick={() => handleAddSlot(dayIndex)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Ajouter une plage horaire
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {daySlots.map((slot) => {
                                  const globalIndex =
                                    localAvailabilities.indexOf(slot);
                                  return (
                                    <div
                                      key={globalIndex}
                                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                                    >
                                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      <input
                                        type="time"
                                        value={slot.startTime}
                                        onChange={(e) =>
                                          handleTimeChange(
                                            globalIndex,
                                            "startTime",
                                            e.target.value
                                          )
                                        }
                                        className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                      />
                                      <span className="text-muted-foreground">
                                        à
                                      </span>
                                      <input
                                        type="time"
                                        value={slot.endTime}
                                        onChange={(e) =>
                                          handleTimeChange(
                                            globalIndex,
                                            "endTime",
                                            e.target.value
                                          )
                                        }
                                        className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                                      />
                                      <div className="flex-1" />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                        onClick={() =>
                                          handleRemoveSlot(globalIndex)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full mt-2 rounded-lg gap-2 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleAddSlot(dayIndex)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Ajouter une plage
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Slot Duration Config */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Durée des séances
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Configuration
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[30, 45, 60, 90, 120].map((duration) => (
                      <button
                        key={duration}
                        onClick={() => handleSlotDurationChange(duration)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          localSlotDuration === duration
                            ? "bg-primary text-primary-foreground shadow"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {duration}m
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Durée de chaque créneau réservable
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Add */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Plus className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ajout rapide</p>
                    <p className="text-xs text-muted-foreground">
                      Configurer un jour
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day, index) => {
                    const hasSlots = localAvailabilities.some(
                      (s) => s.dayOfWeek === index
                    );
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!hasSlots) handleAddSlot(index);
                          setExpandedDay(index);
                        }}
                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                          hasSlots
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {day.short}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm mb-1">
                      Bon à savoir
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Vos disponibilités sont synchronisées avec Google Calendar.
                      Les créneaux déjà occupés seront automatiquement exclus.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button (Mobile) */}
            <div className="lg:hidden">
              <Button
                className={`w-full h-12 rounded-xl gap-2 ${
                  hasUnsavedChanges 
                    ? "bg-primary ring-2 ring-primary/30 ring-offset-2" 
                    : "bg-primary"
                }`}
                onClick={() => handleSave()}
                disabled={isSaving}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {hasUnsavedChanges ? "Enregistrer *" : "Enregistrer les modifications"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slot Duration */}
          <Card className="border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Durée des créneaux
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Temps par séance de coaching
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {[30, 45, 60, 90, 120].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => handleSlotDurationChange(duration)}
                      className={`py-4 rounded-xl text-lg font-bold transition-all ${
                        localSlotDuration === duration
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {duration}
                      <span className="text-xs font-normal block">min</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Avec cette durée, vous aurez environ{" "}
                      <span className="font-semibold text-foreground">
                        {stats.creneauxPerWeek} créneaux
                      </span>{" "}
                      par semaine.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Valeur personnalisée (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="5"
                    value={localSlotDuration}
                    onChange={(e) => handleSlotDurationChange(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preset Templates */}
          <Card className="border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                  <Sparkles className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Modèles prédéfinis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configurations rapides
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Semaine standard : Lundi-Vendredi 9h-18h
                    const newSlots: AvailabilitySlot[] = [];
                    for (let i = 1; i <= 5; i++) {
                      newSlots.push({
                        dayOfWeek: i,
                        startTime: "09:00",
                        endTime: "18:00",
                        isActive: true,
                      });
                    }
                    applyTemplate(newSlots, "Semaine standard");
                  }}
                  disabled={isSaving}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-left group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Semaine standard
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Lun-Ven • 9h00-18h00
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Temps partiel : Lundi, Mercredi, Vendredi
                    const newSlots: AvailabilitySlot[] = [1, 3, 5].map((day) => ({
                      dayOfWeek: day,
                      startTime: "09:00",
                      endTime: "17:00",
                      isActive: true,
                    }));
                    applyTemplate(newSlots, "Temps partiel");
                  }}
                  disabled={isSaving}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-left group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Temps partiel</p>
                      <p className="text-sm text-muted-foreground">
                        Lun, Mer, Ven • 9h00-17h00
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Weekend only
                    const newSlots: AvailabilitySlot[] = [0, 6].map((day) => ({
                      dayOfWeek: day,
                      startTime: "10:00",
                      endTime: "16:00",
                      isActive: true,
                    }));
                    applyTemplate(newSlots, "Weekend");
                  }}
                  disabled={isSaving}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-left group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Weekend</p>
                      <p className="text-sm text-muted-foreground">
                        Sam, Dim • 10h00-16h00
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => applyTemplate([], "Tout effacer")}
                  disabled={isSaving}
                  className="w-full p-4 rounded-xl border border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all text-left group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-rose-600">Tout effacer</p>
                      <p className="text-sm text-muted-foreground">
                        Supprimer toutes les plages
                      </p>
                    </div>
                    <Trash2 className="h-5 w-5 text-rose-500" />
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Availabilities;
