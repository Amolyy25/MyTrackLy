import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useExercises } from "../../../hooks/useExercises";
import {
  useCreateTrainingSession,
  useCreateTrainingSessionForStudent,
} from "../../../hooks/useTrainingSessions";
import { useToast } from "../../../contexts/ToastContext";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingSpinner from "../../composants/LoadingSpinner";
import ErrorDisplay from "../../composants/ErrorDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Plus,
  X,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
  Dumbbell,
  Weight,
  Timer,
  Hash,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Library,
  Save,
  BarChart3,
  Target,
} from "lucide-react";

interface ExerciseForm {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  repsType: "uniform" | "variable";
  repsUniform: number;
  repsPerSet: number[];
  weightKg: number;
  restSeconds: number;
  notes: string;
  isExpanded: boolean;
}

const NewTrainingSession: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentIdFromQuery = searchParams.get("studentId");
  const { showToast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    exercises: exerciseLibrary,
    isLoading: exercisesLoading,
    error: exercisesError,
  } = useExercises();

  const {
    createSession: createSessionSelf,
    isLoading: isLoadingSelf,
    error: createErrorSelf,
  } = useCreateTrainingSession();
  const {
    createSession: createSessionForStudent,
    isLoading: isLoadingStudent,
    error: createErrorStudent,
  } = useCreateTrainingSessionForStudent();

  const isLoading = isLoadingSelf || isLoadingStudent;
  const createError = createErrorSelf || createErrorStudent;

  const predefinedExercises = exerciseLibrary.filter((ex) => !ex.isCustom);
  const customExercises = exerciseLibrary.filter((ex) => ex.isCustom);

  // Filtrer les exercices par recherche
  const filteredPredefined = predefinedExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCustom = customExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addExercise = (exercise: { id: string; name: string }) => {
    const newExercise: ExerciseForm = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      repsType: "uniform",
      repsUniform: 10,
      repsPerSet: [10, 10, 10],
      weightKg: 0,
      restSeconds: 90,
      notes: "",
      isExpanded: true,
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseSelector(false);
    setSearchTerm("");
  };

  const addCustomExercise = () => {
    if (!customExerciseName.trim()) return;

    const newExercise: ExerciseForm = {
      exerciseId: `custom-${Date.now()}`,
      exerciseName: customExerciseName.trim(),
      sets: 3,
      repsType: "uniform",
      repsUniform: 10,
      repsPerSet: [10, 10, 10],
      weightKg: 0,
      restSeconds: 90,
      notes: "",
      isExpanded: true,
    };
    setExercises([...exercises, newExercise]);
    setCustomExerciseName("");
    setShowCustomForm(false);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const toggleExerciseExpanded = (index: number) => {
    const updated = [...exercises];
    updated[index].isExpanded = !updated[index].isExpanded;
    setExercises(updated);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updatedExercises = [...exercises];
    const exercise = { ...updatedExercises[index] };

    if (field === "sets") {
      if (value === "") {
        // Laisser le champ visuellement vide au lieu de remettre 0
        (exercise as any).sets = "";
      } else {
        const parsed = parseInt(value, 10);
        exercise.sets = Number.isNaN(parsed) ? 0 : parsed;
        if (exercise.repsType === "variable") {
          const newLength = Number(exercise.sets) || 0;
          const currentLength = exercise.repsPerSet.length;
          if (newLength > currentLength) {
            exercise.repsPerSet = [
              ...exercise.repsPerSet,
              ...Array(newLength - currentLength).fill(exercise.repsUniform),
            ];
          } else {
            exercise.repsPerSet = exercise.repsPerSet.slice(0, newLength);
          }
        }
      }
    } else if (field === "repsType") {
      exercise.repsType = value;
      if (value === "variable") {
        exercise.repsPerSet = Array(exercise.sets).fill(exercise.repsUniform);
      }
    } else if (field === "repsUniform") {
      if (value === "") {
        (exercise as any).repsUniform = "";
      } else {
        const parsed = parseInt(value, 10);
        exercise.repsUniform = Number.isNaN(parsed) ? 0 : parsed;
      }
    } else if (field === "repsPerSet") {
      exercise.repsPerSet = value;
    } else if (field === "weightKg") {
      if (value === "") {
        (exercise as any).weightKg = "";
      } else {
        const parsed = parseFloat(value);
        exercise.weightKg = Number.isNaN(parsed) ? 0 : parsed;
      }
    } else if (field === "restSeconds") {
      if (value === "") {
        (exercise as any).restSeconds = "";
      } else {
        const parsed = parseInt(value, 10);
        exercise.restSeconds = Number.isNaN(parsed) ? 0 : parsed;
      }
    } else if (field === "notes") {
      exercise.notes = value;
    }

    updatedExercises[index] = exercise;
    setExercises(updatedExercises);
  };

  const updateRepsPerSet = (
    exerciseIndex: number,
    setIndex: number,
    value: string
  ) => {
    const updatedExercises = [...exercises];
    const repsPerSet = [...updatedExercises[exerciseIndex].repsPerSet];
    if (value === "") {
      (repsPerSet as any)[setIndex] = "";
    } else {
      const parsed = parseInt(value, 10);
      repsPerSet[setIndex] = Number.isNaN(parsed) ? 0 : parsed;
    }
    updatedExercises[exerciseIndex].repsPerSet = repsPerSet;
    setExercises(updatedExercises);
  };

  const calculateTotalReps = (exercise: ExerciseForm): number => {
    if (exercise.repsType === "uniform") {
      const sets = Number((exercise as any).sets || 0);
      const repsUniform = Number((exercise as any).repsUniform || 0);
      return sets * repsUniform;
    }
    return exercise.repsPerSet.reduce(
      (sum, reps) => sum + Number((reps as any) || 0),
      0
    );
  };

  const calculateVolume = (exercise: ExerciseForm): number => {
    const weight = Number((exercise as any).weightKg || 0);
    return calculateTotalReps(exercise) * weight;
  };

  const calculateTotalVolume = (): number => {
    return exercises.reduce((sum, ex) => sum + calculateVolume(ex), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const sessionData = {
        date,
        durationMinutes,
        notes,
        exercises: exercises.map((ex, index) => ({
          exerciseId: ex.exerciseId,
          ...(ex.exerciseId?.startsWith("custom-") && {
            exerciseName: ex.exerciseName,
            exerciseCategory: "other",
            exerciseDefaultUnit: "reps",
          }),
          sets: ex.sets,
          repsUniform:
            ex.repsType === "uniform"
              ? Number((ex as any).repsUniform || 0)
              : undefined,
          repsPerSet:
            ex.repsType === "variable"
              ? ex.repsPerSet.map((r) => Number((r as any) || 0))
              : undefined,
          sets: Number((ex as any).sets || 0),
          weightKg: Number((ex as any).weightKg || 0),
          restSeconds: Number((ex as any).restSeconds || 0),
          notes: ex.notes,
          orderIndex: index,
        })),
      };

      if (studentIdFromQuery) {
        await createSessionForStudent(studentIdFromQuery, sessionData);
        showToast(
          "Séance enregistrée pour cet élève avec succès ! 💪",
          "success"
        );
        navigate(`/dashboard/coach/student/${studentIdFromQuery}`);
      } else {
        await createSessionSelf(sessionData);
        showToast("Séance enregistrée avec succès ! 💪", "success");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      showToast("Erreur lors de l'enregistrement de la séance", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            Nouvelle séance
          </h1>
          <p className="mt-2 text-muted-foreground">
            Créez votre séance d'entraînement personnalisée
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Info Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Durée estimée
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(parseInt(e.target.value))
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-colors"
                    min="1"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    min
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (optionnel)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-colors resize-none"
                  rows={2}
                  placeholder="Objectif de la séance, sensations..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercises List */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <Card
              key={index}
              className="border-border bg-card overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Exercise Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExerciseExpanded(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {exercise.exerciseName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{exercise.sets} séries</span>
                      <span>•</span>
                      <span>
                        {exercise.repsType === "uniform"
                          ? `${exercise.repsUniform} reps`
                          : "Reps variables"}
                      </span>
                      {exercise.weightKg > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-chart-2 font-medium">
                            {exercise.weightKg} kg
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExercise(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {exercise.isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Exercise Details (Expandable) */}
              {exercise.isExpanded && (
                <CardContent className="border-t border-border pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Main inputs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Séries
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExercise(index, "sets", e.target.value)
                          }
                          className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Poids
                      </label>
                      <div className="relative">
                        <Weight className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="number"
                          value={exercise.weightKg}
                          onChange={(e) =>
                            updateExercise(index, "weightKg", e.target.value)
                          }
                          className="w-full pl-8 pr-8 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
                          min="0"
                          step="0.5"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          kg
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Repos
                      </label>
                      <div className="relative">
                        <Timer className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="number"
                          value={exercise.restSeconds}
                          onChange={(e) =>
                            updateExercise(index, "restSeconds", e.target.value)
                          }
                          className="w-full pl-8 pr-6 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
                          min="0"
                          step="15"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reps Type Toggle */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Répétitions
                    </label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateExercise(index, "repsType", "uniform")
                        }
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          exercise.repsType === "uniform"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Uniformes
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateExercise(index, "repsType", "variable")
                        }
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          exercise.repsType === "variable"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        Variables
                      </button>
                    </div>

                    {exercise.repsType === "uniform" ? (
                      <input
                        type="number"
                        value={exercise.repsUniform}
                        onChange={(e) =>
                          updateExercise(index, "repsUniform", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
                        min="1"
                        placeholder="Répétitions par série"
                      />
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {exercise.repsPerSet.map((reps, setIndex) => (
                          <div key={setIndex}>
                            <label className="block text-[10px] text-muted-foreground mb-1 text-center">
                              S{setIndex + 1}
                            </label>
                            <input
                              type="number"
                              value={reps}
                              onChange={(e) =>
                                updateRepsPerSet(index, setIndex, e.target.value)
                              }
                              className="w-full px-2 py-1.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm text-center"
                              min="1"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Exercise Notes */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Notes (optionnel)
                    </label>
                    <input
                      type="text"
                      value={exercise.notes}
                      onChange={(e) =>
                        updateExercise(index, "notes", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm"
                      placeholder="Sensations, difficultés..."
                    />
                  </div>

                  {/* Exercise Summary */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reps: </span>
                        <span className="font-semibold text-foreground">
                          {calculateTotalReps(exercise)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volume: </span>
                        <span className="font-semibold text-chart-2">
                          {calculateVolume(exercise).toFixed(0)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Add Exercise Section */}
        {showExerciseSelector ? (
          <Card className="border-border bg-card animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Ajouter un exercice
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowExerciseSelector(false);
                    setShowCustomForm(false);
                    setCustomExerciseName("");
                    setSearchTerm("");
                  }}
                  className="h-8 w-8 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    !showCustomForm
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Library className="h-4 w-4" />
                  Bibliothèque
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    showCustomForm
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Personnalisé
                </button>
              </div>

              {showCustomForm ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    placeholder="Nom de l'exercice..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomExercise();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addCustomExercise}
                    disabled={!customExerciseName.trim()}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search */}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un exercice..."
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />

                  {exercisesLoading ? (
                    <LoadingSpinner
                      message="Chargement..."
                      fullScreen={false}
                      size="sm"
                    />
                  ) : exercisesError ? (
                    <ErrorDisplay error={exercisesError} fullScreen={false} />
                  ) : filteredPredefined.length === 0 &&
                    filteredCustom.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun exercice trouvé
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {filteredCustom.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                            Mes exercices
                          </h4>
                          <div className="grid grid-cols-1 gap-1.5">
                            {filteredCustom.map((ex) => (
                              <button
                                key={ex.id}
                                type="button"
                                onClick={() =>
                                  addExercise({ id: ex.id, name: ex.name })
                                }
                                className="flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg text-left transition-colors group"
                              >
                                <span className="font-medium text-foreground">
                                  {ex.name}
                                </span>
                                <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredPredefined.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Bibliothèque
                          </h4>
                          <div className="grid grid-cols-1 gap-1.5">
                            {filteredPredefined.map((ex) => (
                              <button
                                key={ex.id}
                                type="button"
                                onClick={() =>
                                  addExercise({ id: ex.id, name: ex.name })
                                }
                                className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-lg text-left transition-colors group"
                              >
                                <span className="font-medium text-foreground">
                                  {ex.name}
                                </span>
                                <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <button
            type="button"
            onClick={() => setShowExerciseSelector(true)}
            className="w-full border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary group"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            <span className="font-medium">Ajouter un exercice</span>
          </button>
        )}

        {/* Session Summary */}
        {exercises.length > 0 && (
          <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Résumé de la séance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-primary-foreground/70 text-xs mb-1">
                    Exercices
                  </p>
                  <p className="text-2xl font-bold">{exercises.length}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-primary-foreground/70 text-xs mb-1">
                    Séries
                  </p>
                  <p className="text-2xl font-bold">
                    {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-primary-foreground/70 text-xs mb-1">
                    Répétitions
                  </p>
                  <p className="text-2xl font-bold">
                    {exercises.reduce(
                      (sum, ex) => sum + calculateTotalReps(ex),
                      0
                    )}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-primary-foreground/70 text-xs mb-1">
                    Volume
                  </p>
                  <p className="text-2xl font-bold">
                    {calculateTotalVolume().toFixed(0)} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {createError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
            {createError}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 sticky bottom-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="flex-1 h-12 border-border bg-card hover:bg-muted"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={exercises.length === 0 || isLoading}
            className="flex-1 h-12 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTrainingSession;
