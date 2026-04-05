import React, { useState } from "react";
import { X } from "lucide-react";
import { PlanDay } from "../../../../types";
import { DAYS_FULL_FR, getMoodEmoji } from "../../../../utils/trainingPlanHelpers";
import { useToast } from "../../../../contexts/ToastContext";
import API_URL from "../../../../config/api";

interface LogPlanSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planDay?: PlanDay | null;
  onSuccess: () => void;
}

const LogPlanSessionModal: React.FC<LogPlanSessionModalProps> = ({
  isOpen,
  onClose,
  planId,
  planDay,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [performanceNote, setPerformanceNote] = useState("");
  const [skipped, setSkipped] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayLabel = planDay
    ? planDay.label || DAYS_FULL_FR[planDay.dayOfWeek]
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Non authentifié");

      const payload: Record<string, unknown> = {
        date,
        skipped,
      };
      if (planDay?.id) payload.planDayId = planDay.id;
      if (moodScore !== null) payload.moodScore = moodScore;
      if (moodNote.trim()) payload.moodNote = moodNote.trim();
      if (performanceNote.trim()) payload.performanceNote = performanceNote.trim();
      if (skipped && skipReason.trim()) payload.skipReason = skipReason.trim();

      const response = await fetch(
        `${API_URL}/training-plans/${planId}/log-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de l'enregistrement");
      }

      showToast("Séance enregistrée !", "success");
      onSuccess();
      onClose();

      // Reset form
      setDate(today);
      setMoodScore(null);
      setMoodNote("");
      setPerformanceNote("");
      setSkipped(false);
      setSkipReason("");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Une erreur est survenue",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const moodOptions = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Logger ma séance
            </h2>
            {dayLabel && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
                {dayLabel}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Mood Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comment s'est passée la séance ?
            </label>
            <div className="flex gap-3 justify-center">
              {moodOptions.map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setMoodScore(score === moodScore ? null : score)}
                  className={`text-3xl p-2 rounded-xl transition-all ${
                    moodScore === score
                      ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-110"
                      : "hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={`Humeur : ${score}/5`}
                >
                  {getMoodEmoji(score)}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Ressenti
            </label>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Comment tu te sens ? Raconte ta séance..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Performance Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Notes de performance
            </label>
            <textarea
              value={performanceNote}
              onChange={(e) => setPerformanceNote(e.target.value)}
              placeholder="Notes de performance (poids, reps...)"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Skip checkbox */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={skipped}
                onChange={(e) => setSkipped(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                J'ai sauté cette séance
              </span>
            </label>

            {skipped && (
              <textarea
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="Pourquoi ?"
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogPlanSessionModal;
