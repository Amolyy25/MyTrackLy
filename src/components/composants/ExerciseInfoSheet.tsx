import React, { useState } from "react";
import {
  X,
  Info,
  Play,
  Target,
  AlertTriangle,
  Lightbulb,
  ListOrdered,
  Dumbbell,
  ExternalLink,
  Zap,
  Star,
} from "lucide-react";
import {
  getExerciseInfo,
  hasExerciseInfo,
  type ExerciseInfo,
} from "../../data/exerciseDatabase";

// ─── ExerciseInfoButton ───────────────────────────────────────────────
// Bouton réutilisable qui ouvre la fiche d'un exercice.

interface ExerciseInfoButtonProps {
  exerciseName: string;
  size?: "sm" | "md";
  className?: string;
}

export const ExerciseInfoButton: React.FC<ExerciseInfoButtonProps> = ({
  exerciseName,
  size = "sm",
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  if (!hasExerciseInfo(exerciseName)) return null;

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnSize =
    size === "sm"
      ? "w-6 h-6 min-w-[24px]"
      : "w-8 h-8 min-w-[32px]";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className={`${btnSize} rounded-lg flex items-center justify-center text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex-shrink-0 ${className}`}
        title={`Voir la fiche de ${exerciseName}`}
      >
        <Info className={iconSize} />
      </button>
      {open && (
        <ExerciseInfoSheet
          exerciseName={exerciseName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

// ─── ExerciseInfoSheet ────────────────────────────────────────────────
// Modal plein écran qui affiche toutes les informations d'un exercice.

interface ExerciseInfoSheetProps {
  exerciseName: string;
  onClose: () => void;
}

const difficultyConfig = {
  beginner: {
    label: "Débutant",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  intermediate: {
    label: "Intermédiaire",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  advanced: {
    label: "Avancé",
    color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  },
};

const ExerciseInfoSheet: React.FC<ExerciseInfoSheetProps> = ({
  exerciseName,
  onClose,
}) => {
  const info = getExerciseInfo(exerciseName);

  if (!info) return null;

  const diff = difficultyConfig[info.difficulty];

  const handleVideoClick = () => {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(info.videoSearchQuery)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white dark:bg-slate-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {info.displayName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${diff.color}`}>
                  {diff.label}
                </span>
                {info.category === "strength" && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                    Musculation
                  </span>
                )}
                {info.category === "cardio" && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                    Cardio
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5">
          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {info.description}
          </p>

          {/* Muscles ciblés */}
          <Section icon={Target} title="Muscles ciblés" color="text-indigo-500 dark:text-indigo-400">
            <div className="space-y-2">
              {info.primaryMuscles.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Principaux
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {info.primaryMuscles.map((m) => (
                      <span
                        key={m}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {info.secondaryMuscles.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Secondaires
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {info.secondaryMuscles.map((m) => (
                      <span
                        key={m}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Matériel */}
          {info.equipment.length > 0 && (
            <Section icon={Dumbbell} title="Matériel" color="text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap gap-1.5">
                {info.equipment.map((e) => (
                  <span
                    key={e}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Instructions */}
          <Section icon={ListOrdered} title="Exécution" color="text-violet-500 dark:text-violet-400">
            <ol className="space-y-2">
              {info.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Vidéo */}
          <button
            onClick={handleVideoClick}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/10 border border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Voir une vidéo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recherche YouTube — {info.displayName}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>

          {/* Bienfaits */}
          <Section icon={Zap} title="Bienfaits" color="text-emerald-500 dark:text-emerald-400">
            <ul className="space-y-1.5">
              {info.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Star className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Erreurs courantes */}
          <Section
            icon={AlertTriangle}
            title="Erreurs courantes"
            color="text-amber-500 dark:text-amber-400"
          >
            <ul className="space-y-1.5">
              {info.commonMistakes.map((m, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-600 dark:text-slate-300 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/10"
                >
                  {m}
                </li>
              ))}
            </ul>
          </Section>

          {/* Conseils */}
          <Section icon={Lightbulb} title="Conseils" color="text-blue-500 dark:text-blue-400">
            <ul className="space-y-1.5">
              {info.tips.map((t, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-600 dark:text-slate-300 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/10"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Safe area */}
        <div className="flex-shrink-0 h-[env(safe-area-inset-bottom)] bg-white dark:bg-slate-900" />
      </div>
    </div>
  );
};

// ─── Section helper ──────────────────────────────────────────────────

const Section: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  color: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, color, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-2.5">
      <Icon className={`w-4 h-4 ${color}`} />
      <h3 className="text-sm font-bold text-slate-800 dark:text-white">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

export default ExerciseInfoSheet;
