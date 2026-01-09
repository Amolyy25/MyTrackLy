import React, { useState, useEffect } from "react";
import {
  useCoachAvailabilities,
  AvailabilitySlot,
} from "../../../../hooks/useAvailabilities";
import { useToast } from "../../../../contexts/ToastContext";

const DAYS_OF_WEEK = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const Availabilities: React.FC = () => {
  const { availabilities, slotDuration, isLoading, error, saveAvailabilities } =
    useCoachAvailabilities();
  const { showToast } = useToast();
  const [localAvailabilities, setLocalAvailabilities] = useState<
    AvailabilitySlot[]
  >([]);
  const [localSlotDuration, setLocalSlotDuration] = useState<number>(60);
  const [isSaving, setIsSaving] = useState(false);

  // Synchroniser l'état local avec les données chargées
  useEffect(() => {
    if (availabilities) {
      setLocalAvailabilities(availabilities);
    }
    if (slotDuration) {
      setLocalSlotDuration(slotDuration);
    }
  }, [availabilities, slotDuration]);

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
  };

  const handleRemoveSlot = (index: number) => {
    const newAvailabilities = [...localAvailabilities];
    newAvailabilities.splice(index, 1);
    setLocalAvailabilities(newAvailabilities);
  };

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newAvailabilities = [...localAvailabilities];
    newAvailabilities[index] = { ...newAvailabilities[index], [field]: value };
    setLocalAvailabilities(newAvailabilities);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveAvailabilities(localAvailabilities, localSlotDuration);
      showToast(
        "Vos disponibilités et configuration ont été mises à jour avec succès.",
        "success"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && localAvailabilities.length === 0) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes disponibilités</h1>
        <p className="mt-2 text-gray-600">
          Définissez vos plages horaires habituelles et la durée de vos séances.
          Ces créneaux seront proposés à vos élèves lors de la réservation, en
          tenant compte de vos événements Google Calendar existants.
        </p>
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>
      )}

      {/* Configuration globale */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Configuration des séances
        </h2>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durée des créneaux (en minutes)
          </label>
          <input
            type="number"
            min="15"
            step="15"
            value={localSlotDuration}
            onChange={(e) => setLocalSlotDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Cette durée sera utilisée pour découper vos plages horaires en
            créneaux réservables.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Plages horaires hebdomadaires
        </h2>
        <div className="space-y-8">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            // Filtrer les créneaux pour ce jour
            const daySlots = localAvailabilities.filter(
              (slot) => slot.dayOfWeek === dayIndex
            );

            return (
              <div
                key={dayIndex}
                className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 w-32 pt-2">
                    {dayName}
                  </h3>
                  <div className="flex-1 space-y-3">
                    {daySlots.length === 0 ? (
                      <p className="text-gray-400 italic pt-2 text-sm">
                        Non disponible
                      </p>
                    ) : (
                      daySlots.map((slot, slotIndex) => {
                        // Retrouver l'index global pour la modification
                        const globalIndex = localAvailabilities.indexOf(slot);
                        return (
                          <div
                            key={globalIndex}
                            className="flex items-center gap-2"
                          >
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
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-gray-500">à</span>
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
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => handleRemoveSlot(globalIndex)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                              title="Supprimer ce créneau"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
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
                        );
                      })
                    )}
                  </div>
                  <button
                    onClick={() => handleAddSlot(dayIndex)}
                    className="ml-4 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Ajouter
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Availabilities;
