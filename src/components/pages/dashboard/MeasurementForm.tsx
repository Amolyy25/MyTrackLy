import React, { useState, useEffect } from "react";
import { Measurement } from "../../../types";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      {/* Poids et mensurations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poids (kg)
          </label>
          <input
            type="number"
            name="bodyWeightKg"
            value={formData.bodyWeightKg}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ex: 75.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poitrine (cm)
          </label>
          <input
            type="number"
            name="chestCm"
            value={formData.chestCm}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ex: 100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taille (cm)
          </label>
          <input
            type="number"
            name="waistCm"
            value={formData.waistCm}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ex: 80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hanches (cm)
          </label>
          <input
            type="number"
            name="hipsCm"
            value={formData.hipsCm}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ex: 95"
          />
        </div>
      </div>

      {/* Bras */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Bras</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biceps gauche (cm)
            </label>
            <input
              type="number"
              name="leftArmCm"
              value={formData.leftArmCm}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 35"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biceps droit (cm)
            </label>
            <input
              type="number"
              name="rightArmCm"
              value={formData.rightArmCm}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 35"
            />
          </div>
        </div>
      </div>

      {/* Jambes */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Jambes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisse gauche (cm)
            </label>
            <input
              type="number"
              name="leftThighCm"
              value={formData.leftThighCm}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisse droite (cm)
            </label>
            <input
              type="number"
              name="rightThighCm"
              value={formData.rightThighCm}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mollet gauche (cm)
            </label>
            <input
              type="number"
              name="leftCalfCm"
              value={formData.leftCalfCm}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 38"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mollet droit (cm)
            </label>
            <input
              type="number"
              name="rightCalfCm"
              value={formData.rightCalfCm}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 38"
            />
          </div>
        </div>
      </div>

      {/* Autres mensurations */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Autres</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cou (cm)
            </label>
            <input
              type="number"
              name="neckCm"
              value={formData.neckCm}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Épaules (cm)
            </label>
            <input
              type="number"
              name="shouldersCm"
              value={formData.shouldersCm}
              onChange={handleChange}
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: 120"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optionnel)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Commentaires sur cette mesure..."
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Enregistrement..."
            : measurement
            ? "Modifier"
            : "Enregistrer"}
        </button>
      </div>
    </form>
  );
};

export default MeasurementForm;

