import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExercises, useMyExercises } from "../../../hooks/useExercises";
import { useCreateTrainingSession } from "../../../hooks/useTrainingSessions";
import { useToast } from "../../../contexts/ToastContext";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingSpinner from "../../composants/LoadingSpinner";
import ErrorDisplay from "../../composants/ErrorDisplay";

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
}

const NewTrainingSession: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Récupérer les exercices depuis l'API
  const {
    exercises: exerciseLibrary,
    isLoading: exercisesLoading,
    error: exercisesError,
  } = useExercises();
  const {
    exercises: myExercises,
    isLoading: myExercisesLoading,
    error: myExercisesError,
  } = useMyExercises();
  const {
    createSession,
    isLoading,
    error: createError,
  } = useCreateTrainingSession();

  // Séparer les exercices prédéfinis et les exercices custom
  const predefinedExercises = exerciseLibrary.filter((ex) => !ex.isCustom);
  const customExercises = exerciseLibrary.filter((ex) => ex.isCustom);

  const addExercise = (exercise: { id: string; name: string }) => {
    const newExercise: ExerciseForm = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      repsType: "uniform",
      repsUniform: 8,
      repsPerSet: [8, 8, 8],
      weightKg: 0,
      restSeconds: 90,
      notes: "",
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const addCustomExercise = () => {
    if (!customExerciseName.trim()) {
      return;
    }

    const newExercise: ExerciseForm = {
      exerciseId: `custom-${Date.now()}`, // ID temporaire pour les exercices custom
      exerciseName: customExerciseName.trim(),
      sets: 3,
      repsType: "uniform",
      repsUniform: 8,
      repsPerSet: [8, 8, 8],
      weightKg: 0,
      restSeconds: 90,
      notes: "",
    };
    setExercises([...exercises, newExercise]);
    setCustomExerciseName("");
    setShowCustomForm(false);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updatedExercises = [...exercises];
    const exercise = { ...updatedExercises[index] };

    if (field === "sets") {
      exercise.sets = parseInt(value) || 0;
      // Ajuster repsPerSet si mode variable
      if (exercise.repsType === "variable") {
        const newLength = exercise.sets;
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
    } else if (field === "repsType") {
      exercise.repsType = value;
      if (value === "variable") {
        exercise.repsPerSet = Array(exercise.sets).fill(exercise.repsUniform);
      }
    } else if (field === "repsUniform") {
      exercise.repsUniform = parseInt(value) || 0;
    } else if (field === "repsPerSet") {
      exercise.repsPerSet = value;
    } else if (field === "weightKg") {
      exercise.weightKg = parseFloat(value) || 0;
    } else if (field === "restSeconds") {
      exercise.restSeconds = parseInt(value) || 0;
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
    repsPerSet[setIndex] = parseInt(value) || 0;
    updatedExercises[exerciseIndex].repsPerSet = repsPerSet;
    setExercises(updatedExercises);
  };

  const calculateTotalReps = (exercise: ExerciseForm): number => {
    if (exercise.repsType === "uniform") {
      return exercise.sets * exercise.repsUniform;
    }
    return exercise.repsPerSet.reduce((sum, reps) => sum + reps, 0);
  };

  const calculateVolume = (exercise: ExerciseForm): number => {
    const totalReps = calculateTotalReps(exercise);
    return totalReps * exercise.weightKg;
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
          // Pour les exercices custom, envoyer les informations nécessaires
          ...(ex.exerciseId?.startsWith("custom-") && {
            exerciseName: ex.exerciseName,
            exerciseCategory: "other", // Par défaut, peut être amélioré plus tard
            exerciseDefaultUnit: "reps", // Par défaut, peut être amélioré plus tard
          }),
          sets: ex.sets,
          repsUniform: ex.repsType === "uniform" ? ex.repsUniform : undefined,
          repsPerSet: ex.repsType === "variable" ? ex.repsPerSet : undefined,
          weightKg: ex.weightKg,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          orderIndex: index,
        })),
      };

      await createSession(sessionData);
      
      // Afficher notification selon le rôle
      const roleMessages = {
        personnel: "Séance d'entraînement enregistrée avec succès !",
        eleve: "Séance d'entraînement enregistrée avec succès !",
        coach: "Séance d'entraînement enregistrée avec succès !",
      };
      showToast(
        roleMessages[user?.role as keyof typeof roleMessages] || "Séance enregistrée avec succès !",
        "success"
      );
      
      // Rediriger vers le dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating session:", error);
      showToast("Erreur lors de l'enregistrement de la séance", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nouvelle séance d'entraînement
          </h1>
          <p className="mt-1 text-gray-600">
            Ajoutez vos exercices et enregistrez votre séance
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Commentaires sur la séance..."
            />
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {exercise.exerciseName}
                </h3>
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Exercise Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de séries
                  </label>
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) =>
                      updateExercise(index, "sets", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    value={exercise.weightKg}
                    onChange={(e) =>
                      updateExercise(index, "weightKg", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repos (secondes)
                  </label>
                  <input
                    type="number"
                    value={exercise.restSeconds}
                    onChange={(e) =>
                      updateExercise(index, "restSeconds", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                    step="15"
                  />
                </div>
              </div>

              {/* Reps Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de répétitions
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`repsType-${index}`}
                      value="uniform"
                      checked={exercise.repsType === "uniform"}
                      onChange={(e) =>
                        updateExercise(index, "repsType", e.target.value)
                      }
                      className="mr-2 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Uniformes (toutes les séries identiques)
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`repsType-${index}`}
                      value="variable"
                      checked={exercise.repsType === "variable"}
                      onChange={(e) =>
                        updateExercise(index, "repsType", e.target.value)
                      }
                      className="mr-2 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      Variables (chaque série différente)
                    </span>
                  </label>
                </div>
              </div>

              {/* Reps Input */}
              {exercise.repsType === "uniform" ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Répétitions par série
                  </label>
                  <input
                    type="number"
                    value={exercise.repsUniform}
                    onChange={(e) =>
                      updateExercise(index, "repsUniform", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Répétitions par série
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {exercise.repsPerSet.map((reps, setIndex) => (
                      <div key={setIndex}>
                        <label className="block text-xs text-gray-600 mb-1">
                          Série {setIndex + 1}
                        </label>
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) =>
                            updateRepsPerSet(index, setIndex, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          min="1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <input
                  type="text"
                  value={exercise.notes}
                  onChange={(e) =>
                    updateExercise(index, "notes", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Sensation de force, difficultés..."
                />
              </div>

              {/* Exercise Summary */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Reps totales :</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {calculateTotalReps(exercise)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Volume :</span>
                    <span className="ml-2 font-semibold text-indigo-600">
                      {calculateVolume(exercise).toFixed(0)} kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Exercise Button */}
        {showExerciseSelector ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter un exercice
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowExerciseSelector(false);
                  setShowCustomForm(false);
                  setCustomExerciseName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Toggle between list and custom form */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  !showCustomForm
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Bibliothèque
              </button>
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showCustomForm
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Créer un exercice
              </button>
            </div>

            {showCustomForm ? (
              /* Custom Exercise Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'exercice personnalisé
                  </label>
                  <input
                    type="text"
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    placeholder="Ex: Squat bulgare, Curl marteau..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomExercise();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={addCustomExercise}
                  disabled={!customExerciseName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter l'exercice
                </button>
              </div>
            ) : (
              /* Exercise Library */
              <div className="space-y-4">
                {exercisesLoading ? (
                  <LoadingSpinner message="Chargement des exercices..." fullScreen={false} size="sm" />
                ) : exercisesError ? (
                  <ErrorDisplay error={exercisesError} fullScreen={false} />
                ) : predefinedExercises.length === 0 &&
                  customExercises.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600">
                      Aucun exercice disponible. Créez-en un personnalisé !
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Bibliothèque (exercices prédéfinis) */}
                    {predefinedExercises.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Bibliothèque
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                          {predefinedExercises.map((ex) => (
                            <button
                              key={ex.id}
                              type="button"
                              onClick={() =>
                                addExercise({ id: ex.id, name: ex.name })
                              }
                              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                            >
                              <span className="font-medium text-gray-900">
                                {ex.name}
                              </span>
                              <svg
                                className="w-5 h-5 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ma bibliothèque (exercices custom) */}
                    {customExercises.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-700 mb-2">
                          Ma bibliothèque
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                          {customExercises.map((ex) => (
                            <button
                              key={ex.id}
                              type="button"
                              onClick={() =>
                                addExercise({ id: ex.id, name: ex.name })
                              }
                              className="flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors"
                            >
                              <span className="font-medium text-gray-900">
                                {ex.name}
                              </span>
                              <svg
                                className="w-5 h-5 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowExerciseSelector(true)}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-indigo-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-medium">Ajouter un exercice</span>
          </button>
        )}

        {/* Session Summary */}
        {exercises.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Résumé de la séance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-indigo-100 text-sm">Exercices</p>
                <p className="text-2xl font-bold">{exercises.length}</p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Séries totales</p>
                <p className="text-2xl font-bold">
                  {exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                </p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Reps totales</p>
                <p className="text-2xl font-bold">
                  {exercises.reduce(
                    (sum, ex) => sum + calculateTotalReps(ex),
                    0
                  )}
                </p>
              </div>
              <div>
                <p className="text-indigo-100 text-sm">Volume total</p>
                <p className="text-2xl font-bold">
                  {calculateTotalVolume().toFixed(0)} kg
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {createError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {createError}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={exercises.length === 0 || isLoading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enregistrement..." : "Enregistrer la séance"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTrainingSession;
