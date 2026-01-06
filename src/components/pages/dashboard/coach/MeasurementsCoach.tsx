import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import API_URL from "../../../../config/api";
import { useStudentMeasurements } from "../../../../hooks/useMeasurements";
import MeasurementsChart from "../MeasurementsChart";
import { Measurement } from "../../../../types";
import ErrorDisplay from "../../../composants/ErrorDisplay";
import LoadingSpinner from "../../../composants/LoadingSpinner";

interface Student {
  id: string;
  name: string;
  email: string;
  _count: {
    measurements: number;
  };
}

const MeasurementsCoach: React.FC = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des élèves");
      }

      const data = await response.json();
      setStudents(data);
      if (data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const {
    measurements,
    isLoading: measurementsLoading,
    error: measurementsError,
  } = useStudentMeasurements(selectedStudentId || "");

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mensurations des élèves
          </h1>
          <p className="mt-2 text-gray-600">
            Consultez les mensurations de vos élèves
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-center py-8">
            Vous n'avez pas encore d'élèves. Créez des codes d'invitation pour
            inviter des élèves.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Mensurations des élèves
        </h1>
        <p className="mt-2 text-gray-600">
          Consultez les mensurations de vos élèves
        </p>
      </div>

      {/* Sélection de l'élève */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un élève
        </label>
        <select
          value={selectedStudentId || ""}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.email}) - {student._count.measurements}{" "}
              mensuration{student._count.measurements > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Mensurations de l'élève sélectionné */}
      {selectedStudent && (
        <>
          {measurementsError ? (
            <ErrorDisplay error={measurementsError} fullScreen={false} />
          ) : measurementsLoading ? (
            <LoadingSpinner message="Chargement des mensurations..." fullScreen={false} />
          ) : (
            <>
              {/* Graphique */}
              {measurements.length > 0 && (
                <MeasurementsChart measurements={measurements} />
              )}

              {/* Liste des mensurations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Mensurations de {selectedStudent.name} ({measurements.length})
                </h2>
                {measurements.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    {selectedStudent.name} n'a pas encore enregistré de
                    mensuration.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {measurements.map((measurement: Measurement) => (
                      <div
                        key={measurement.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
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
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MeasurementsCoach;

