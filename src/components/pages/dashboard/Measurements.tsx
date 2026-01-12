import React, { useState } from "react";
import {
  useMeasurements,
  useCreateMeasurement,
  useUpdateMeasurement,
  useDeleteMeasurement,
} from "../../../hooks/useMeasurements";
import { useToast } from "../../../contexts/ToastContext";
import MeasurementForm from "./MeasurementForm";
import MeasurementsChart from "./MeasurementsChart";
import { Measurement } from "../../../types";
import ErrorDisplay from "../../composants/ErrorDisplay";
import LoadingSpinner from "../../composants/LoadingSpinner";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  Plus,
  Scale,
  Ruler,
  TrendingUp,
  Calendar,
  Edit2,
  Trash2,
  X,
  Activity,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

type TabType = "overview" | "chart" | "history";

const Measurements: React.FC = () => {
  const { showToast } = useToast();
  const { measurements, isLoading, error, refetch } = useMeasurements();
  const { createMeasurement, isLoading: isCreating } = useCreateMeasurement();
  const { updateMeasurement, isLoading: isUpdating } = useUpdateMeasurement();
  const { deleteMeasurement, isLoading: isDeleting } = useDeleteMeasurement();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showForm, setShowForm] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingMeasurement) {
        await updateMeasurement(editingMeasurement.id, formData);
        showToast("Mensuration modifiée avec succès !", "success");
      } else {
        await createMeasurement(formData);
        showToast("Mensuration ajoutée avec succès !", "success");
      }
      setShowForm(false);
      setEditingMeasurement(null);
      await refetch();
    } catch (error) {
      console.error("Error saving measurement:", error);
      showToast(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement",
        "error"
      );
    }
  };

  const handleEdit = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette mensuration ?")) return;
    try {
      await deleteMeasurement(id);
      showToast("Mensuration supprimée avec succès !", "success");
      await refetch();
    } catch (error) {
      console.error("Error deleting measurement:", error);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMeasurement(null);
  };

  // Calculate stats
  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
  const previousMeasurement = measurements.length > 1 ? measurements[1] : null;
  const weightChange = latestMeasurement?.bodyWeightKg && previousMeasurement?.bodyWeightKg
    ? latestMeasurement.bodyWeightKg - previousMeasurement.bodyWeightKg : null;
  const waistChange = latestMeasurement?.waistCm && previousMeasurement?.waistCm
    ? latestMeasurement.waistCm - previousMeasurement.waistCm : null;

  if (isLoading) return <LoadingSpinner message="Chargement des mensurations..." />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  const tabs = [
    { id: "overview" as TabType, label: "Aperçu", icon: Sparkles },
    { id: "chart" as TabType, label: "Évolution", icon: BarChart3 },
    { id: "history" as TabType, label: "Historique", icon: Clock, count: measurements.length },
  ];

  // Stat item component
  const StatItem = ({ label, value, unit, icon: Icon, color, change }: {
    label: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    color: string;
    change?: number | null;
  }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${color}/10`}>
        <Icon className={`h-6 w-6 text-${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-foreground">{value || "—"}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      </div>
      {change !== null && change !== undefined && (
        <div className={`flex items-center gap-0.5 text-sm font-medium px-2 py-1 rounded-full ${
          change > 0 ? "bg-amber-500/10 text-amber-500" : change < 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
        }`}>
          {change > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : change < 0 ? <ArrowDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          {Math.abs(change).toFixed(1)}
        </div>
      )}
    </div>
  );

  // Body measurement visual component
  const BodyMeasurement = ({ label, value, position }: { label: string; value?: number; position: string }) => (
    value ? (
      <div className={`absolute ${position} flex flex-col items-center`}>
        <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm">
          <span className="text-xs font-medium text-primary">{value} cm</span>
        </div>
        <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <Ruler className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mensurations</h1>
            <p className="text-muted-foreground text-sm">Suivez votre évolution corporelle</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl h-11 px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle mesure
        </Button>
      </div>

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
            {tab.count !== undefined && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stats Grid */}
          <div className="lg:col-span-2 space-y-4">
            {latestMeasurement ? (
              <>
                {/* Primary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <StatItem
                    label="Poids actuel"
                    value={latestMeasurement.bodyWeightKg || "—"}
                    unit="kg"
                    icon={Scale}
                    color="primary"
                    change={weightChange}
                  />
                  <StatItem
                    label="Tour de taille"
                    value={latestMeasurement.waistCm || "—"}
                    unit="cm"
                    icon={Target}
                    color="emerald-500"
                    change={waistChange}
                  />
                </div>

                {/* Secondary Stats */}
                <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20 overflow-hidden">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      Dernières mesures
                      <span className="text-xs text-muted-foreground font-normal ml-auto">
                        {new Date(latestMeasurement.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Poitrine", value: latestMeasurement.chestCm },
                        { label: "Hanches", value: latestMeasurement.hipsCm },
                        { label: "Épaules", value: latestMeasurement.shouldersCm },
                        { label: "Cou", value: latestMeasurement.neckCm },
                        { label: "Bras G", value: latestMeasurement.leftArmCm },
                        { label: "Bras D", value: latestMeasurement.rightArmCm },
                        { label: "Cuisse G", value: latestMeasurement.leftThighCm },
                        { label: "Cuisse D", value: latestMeasurement.rightThighCm },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-3 rounded-xl bg-background/50">
                          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                          <p className="text-lg font-semibold text-foreground">
                            {item.value ? `${item.value}` : "—"}
                            {item.value && <span className="text-xs text-muted-foreground ml-0.5">cm</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab("chart")}
                    className="flex-1 flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Voir l'évolution</p>
                        <p className="text-xs text-muted-foreground">Graphiques et tendances</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="flex-1 flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 hover:border-border transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Historique</p>
                        <p className="text-xs text-muted-foreground">{measurements.length} mesures</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </>
            ) : (
              <Card className="border-dashed border-2 border-border bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Ruler className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Aucune mesure enregistrée</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mb-6">
                    Commencez à suivre votre évolution corporelle en ajoutant votre première mensuration.
                  </p>
                  <Button onClick={() => setShowForm(true)} className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Première mesure
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Quick Info */}
          <div className="space-y-4">
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/10">
                    <Activity className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Suivi actif</p>
                    <p className="text-xs text-muted-foreground">{measurements.length} mesures enregistrées</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Première mesure</span>
                    <span className="font-medium text-foreground">
                      {measurements.length > 0
                        ? new Date(measurements[measurements.length - 1].date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Dernière mesure</span>
                    <span className="font-medium text-foreground">
                      {latestMeasurement
                        ? new Date(latestMeasurement.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </span>
                  </div>
                  {latestMeasurement?.notes && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm text-foreground italic">"{latestMeasurement.notes}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm mb-1">Conseil</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Prenez vos mesures le matin à jeun, toujours au même moment pour des résultats cohérents.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "chart" && (
        <div className="space-y-6">
          {measurements.length > 0 ? (
            <MeasurementsChart measurements={measurements} />
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Ajoutez des mesures pour voir l'évolution</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {measurements.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune mesure dans l'historique</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {measurements.map((measurement, index) => (
                <Card
                  key={measurement.id}
                  className="border-border/50 bg-card hover:bg-muted/30 transition-all group overflow-hidden"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <span className="text-lg font-bold text-primary leading-none">
                          {new Date(measurement.date).getDate()}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase mt-0.5">
                          {new Date(measurement.date).toLocaleDateString("fr-FR", { month: "short" })}
                        </span>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          {measurement.bodyWeightKg && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10">
                              <Scale className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm font-semibold text-foreground">{measurement.bodyWeightKg} kg</span>
                            </div>
                          )}
                          {measurement.waistCm && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                              <Target className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-sm font-medium text-foreground">{measurement.waistCm} cm</span>
                            </div>
                          )}
                          {measurement.chestCm && (
                            <span className="text-sm text-muted-foreground">Poitrine: {measurement.chestCm}cm</span>
                          )}
                          {measurement.hipsCm && (
                            <span className="text-sm text-muted-foreground">Hanches: {measurement.hipsCm}cm</span>
                          )}
                        </div>
                        {measurement.notes && (
                          <p className="text-xs text-muted-foreground mt-2 truncate italic">"{measurement.notes}"</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(measurement)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(measurement.id)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal */}
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {editingMeasurement ? "Modifier la mesure" : "Nouvelle mesure"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {editingMeasurement ? "Modifiez les valeurs" : "Enregistrez vos mesures corporelles"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Form Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <MeasurementForm
                measurement={editingMeasurement}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isCreating || isUpdating}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Measurements;
