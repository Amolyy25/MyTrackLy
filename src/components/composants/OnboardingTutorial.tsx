import React, { useState, useCallback, useEffect } from "react";
import {
  X,
  Dumbbell,
  CalendarDays,
  Ruler,
  Activity,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Timer,
  ClipboardList,
  Target,
  TrendingUp,
  Flame,
  Zap,
  Award,
  Heart,
  type LucideIcon,
} from "lucide-react";

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  mainIcon: LucideIcon;
  decorativeIcons: { icon: LucideIcon; position: string; color: string }[];
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
}

const STEPS: TutorialStep[] = [
  {
    title: "Bienvenue sur MyTrackLy !",
    description:
      "Votre compagnon d'entraînement tout-en-un. Suivez vos séances, planifiez vos entraînements, mesurez vos progrès et développez de bonnes habitudes. Découvrons ensemble comment tirer le meilleur de l'application.",
    mainIcon: Dumbbell,
    decorativeIcons: [
      { icon: Target, position: "top-4 right-8", color: "text-violet-300 dark:text-violet-400/50" },
      { icon: Flame, position: "bottom-6 left-6", color: "text-orange-300 dark:text-orange-400/50" },
      { icon: Award, position: "top-8 left-10", color: "text-amber-300 dark:text-amber-400/50" },
      { icon: Heart, position: "bottom-4 right-10", color: "text-pink-300 dark:text-pink-400/50" },
    ],
    gradientFrom: "from-indigo-500/20",
    gradientTo: "to-violet-500/20",
    accentColor: "text-indigo-500 dark:text-indigo-400",
  },
  {
    title: "Enregistrez vos séances",
    description:
      "Deux options s'offrent à vous : la saisie manuelle rapide après l'entraînement, ou le mode Live Workout qui vous guide en temps réel avec un chronomètre de repos et le suivi de chaque série. Accédez-y depuis le bouton '+' ou la page Séances.",
    mainIcon: ClipboardList,
    decorativeIcons: [
      { icon: Timer, position: "top-4 right-6", color: "text-indigo-300 dark:text-indigo-400/50" },
      { icon: Dumbbell, position: "bottom-6 left-8", color: "text-indigo-300 dark:text-indigo-400/50" },
      { icon: Zap, position: "top-8 left-6", color: "text-yellow-300 dark:text-yellow-400/50" },
    ],
    gradientFrom: "from-indigo-500/20",
    gradientTo: "to-blue-500/20",
    accentColor: "text-indigo-500 dark:text-indigo-400",
  },
  {
    title: "Créez un plan d'entraînement",
    description:
      "Construisez votre programme personnalisé ou choisissez parmi nos templates (Full Body, Upper/Lower, PPL, Perte de poids). Planifiez vos jours, ajoutez vos exercices et suivez votre progression semaine après semaine.",
    mainIcon: CalendarDays,
    decorativeIcons: [
      { icon: Target, position: "top-4 left-8", color: "text-violet-300 dark:text-violet-400/50" },
      { icon: ClipboardList, position: "bottom-4 right-6", color: "text-violet-300 dark:text-violet-400/50" },
      { icon: TrendingUp, position: "top-6 right-8", color: "text-emerald-300 dark:text-emerald-400/50" },
    ],
    gradientFrom: "from-violet-500/20",
    gradientTo: "to-purple-500/20",
    accentColor: "text-violet-500 dark:text-violet-400",
  },
  {
    title: "Suivez vos mensurations",
    description:
      "Enregistrez votre poids et vos mensurations corporelles (bras, poitrine, taille, hanches, cuisses...). Visualisez l'évolution de chaque mesure au fil du temps avec des graphiques clairs.",
    mainIcon: Ruler,
    decorativeIcons: [
      { icon: TrendingUp, position: "top-4 right-8", color: "text-emerald-300 dark:text-emerald-400/50" },
      { icon: Target, position: "bottom-6 left-6", color: "text-emerald-300 dark:text-emerald-400/50" },
      { icon: Award, position: "bottom-4 right-10", color: "text-yellow-300 dark:text-yellow-400/50" },
    ],
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-teal-500/20",
    accentColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    title: "Gérez vos habitudes",
    description:
      "Créez des habitudes quotidiennes : hydratation, sommeil, nutrition, étirements, méditation... Cochez-les chaque jour et construisez des streaks pour rester motivé. Vous pouvez aussi lier vos habitudes à votre plan d'entraînement.",
    mainIcon: Activity,
    decorativeIcons: [
      { icon: Flame, position: "top-4 left-8", color: "text-amber-300 dark:text-amber-400/50" },
      { icon: Heart, position: "top-6 right-6", color: "text-pink-300 dark:text-pink-400/50" },
      { icon: Zap, position: "bottom-4 right-8", color: "text-yellow-300 dark:text-yellow-400/50" },
    ],
    gradientFrom: "from-amber-500/20",
    gradientTo: "to-orange-500/20",
    accentColor: "text-amber-500 dark:text-amber-400",
  },
  {
    title: "Analysez vos progrès",
    description:
      "La page Statistiques centralise toutes vos données : volume total, fréquence d'entraînement, records personnels, répartition des groupes musculaires, évolution du poids et bien plus. Utilisez les filtres par période pour analyser votre progression.",
    mainIcon: BarChart3,
    decorativeIcons: [
      { icon: TrendingUp, position: "top-4 right-6", color: "text-blue-300 dark:text-blue-400/50" },
      { icon: Award, position: "bottom-6 left-8", color: "text-amber-300 dark:text-amber-400/50" },
      { icon: Target, position: "top-8 left-6", color: "text-blue-300 dark:text-blue-400/50" },
    ],
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-cyan-500/20",
    accentColor: "text-blue-500 dark:text-blue-400",
  },
];

const STORAGE_KEY = "mytrackly_onboarding_completed";

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const handleClose = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setCurrentStep(0);
    onClose();
  }, [onClose]);

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setDirection("next");
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection("prev");
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, goNext, goPrev, handleClose]);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;
  const MainIcon = step.mainIcon;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-colors backdrop-blur-sm"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentStep ? "next" : "prev");
                setCurrentStep(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-6 bg-indigo-500 dark:bg-indigo-400"
                  : i < currentStep
                  ? "w-1.5 bg-indigo-300 dark:bg-indigo-600"
                  : "w-1.5 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Content — animated with key remount */}
        <div
          key={currentStep}
          className={`flex flex-col items-center px-6 pb-6 ${
            direction === "next"
              ? "animate-in fade-in slide-in-from-right-4 duration-300"
              : "animate-in fade-in slide-in-from-left-4 duration-300"
          }`}
        >
          {/* Illustration */}
          <div
            className={`relative w-full h-44 sm:h-48 rounded-2xl bg-gradient-to-br ${step.gradientFrom} ${step.gradientTo} flex items-center justify-center overflow-hidden mb-5`}
          >
            <MainIcon className={`w-16 h-16 ${step.accentColor} opacity-90`} />
            {step.decorativeIcons.map((d, i) => {
              const DIcon = d.icon;
              return (
                <div key={i} className={`absolute ${d.position} opacity-60`}>
                  <DIcon className={`w-6 h-6 ${d.color}`} />
                </div>
              );
            })}
            {/* Subtle animated circles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 dark:bg-white/5" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 dark:bg-white/5" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">
            {step.title}
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2">
          {/* Skip / Back */}
          {isFirst ? (
            <button
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Passer
            </button>
          ) : (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
          )}

          {/* Next / Start */}
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.97]"
          >
            {isLast ? "C'est parti !" : "Suivant"}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
