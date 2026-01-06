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

const Measurements: React.FC = () => {
  const { showToast } = useToast();
  const { measurements, isLoading, error, refetch } = useMeasurements();
  const { createMeasurement, isLoading: isCreating } = useCreateMeasurement();
  const { updateMeasurement, isLoading: isUpdating } = useUpdateMeasurement();
  const { deleteMeasurement, isLoading: isDeleting } = useDeleteMeasurement();

  const [showForm, setShowForm] = useState(false);
  const [editingMeasurement, setEditingMeasurement] =
    useState<Measurement | null>(null);

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
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement",
        "error"
      );
    }
  };

  const handleEdit = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette mensuration ?")) {
      return;
    }

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensurations</h1>
          <p className="mt-2 text-gray-600">
            Suivez votre évolution corporelle au fil du temps
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <svg
              className="w-5 h-5 inline-block mr-2"
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
            Nouvelle mesure
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMeasurement
                ? "Modifier la mensuration"
                : "Ajouter une mensuration"}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
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
          <MeasurementForm
            measurement={editingMeasurement}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isCreating || isUpdating}
          />
        </div>
      )}

      {/* Graphique */}
      {measurements.length > 0 && (
        <MeasurementsChart measurements={measurements} />
      )}

      {/* Liste des mensurations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Historique ({measurements.length})
        </h2>
        {measurements.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Aucune mensuration enregistrée. Ajoutez votre première mesure pour
            commencer à suivre votre évolution.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="space-y-4">
              {measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {new Date(measurement.date).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                        {measurement.bodyWeightKg && (
                          <div>
                            <span className="text-gray-600">Poids:</span>{" "}
                            <span className="font-medium">
                              {measurement.bodyWeightKg} kg
                            </span>
                          </div>
                        )}
                        {measurement.chestCm && (
                          <div>
                            <span className="text-gray-600">Poitrine:</span>{" "}
                            <span className="font-medium">
                              {measurement.chestCm} cm
                            </span>
                          </div>
                        )}
                        {measurement.waistCm && (
                          <div>
                            <span className="text-gray-600">Taille:</span>{" "}
                            <span className="font-medium">
                              {measurement.waistCm} cm
                            </span>
                          </div>
                        )}
                        {measurement.hipsCm && (
                          <div>
                            <span className="text-gray-600">Hanches:</span>{" "}
                            <span className="font-medium">
                              {measurement.hipsCm} cm
                            </span>
                          </div>
                        )}
                        {measurement.leftArmCm && (
                          <div>
                            <span className="text-gray-600">B. gauche:</span>{" "}
                            <span className="font-medium">
                              {measurement.leftArmCm} cm
                            </span>
                          </div>
                        )}
                        {measurement.rightArmCm && (
                          <div>
                            <span className="text-gray-600">B. droit:</span>{" "}
                            <span className="font-medium">
                              {measurement.rightArmCm} cm
                            </span>
                          </div>
                        )}
                      </div>
                      {measurement.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {measurement.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(measurement)}
                        className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Modifier"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(measurement.id)}
                        disabled={isDeleting}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Measurements;

