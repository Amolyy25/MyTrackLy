import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  Calendar,
  X,
  Dumbbell,
  Clock,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import {
  GlobalStyle,
  Nav,
  BigFooter,
  PageHero,
  FinalCta,
  ChapterHeader,
  CornerTicks,
  CountUp,
  Magnetic,
  EASE,
} from "./kit";

/* ============================================================
   PAGE FEATURE — Suivi de séances
   Identité "Le Carnet Millimétré"
   ============================================================ */

export const TrackingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="crn-root min-h-screen overflow-x-hidden antialiased">
      <GlobalStyle />
      <Nav />

      <main>
        {/* ------------------------------------------------ hero */}
        <PageHero
          planche="Planche — Suivi de séances"
          title={
            <>
              Ne laissez aucun record{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                au hasard.
              </span>
            </>
          }
          subtitle="L'interface de saisie la plus rapide du marché. Conçue pour être utilisée entre deux séries, sans friction."
          cta={{ label: "Commencer gratuitement", to: "/register" }}
        />

        {/* ------------------------------------------------ chapitre I — l'interface */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36 relative overflow-hidden">
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[320px] rounded-[100%] bg-[var(--indigo)] opacity-[0.07] blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-6xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="I"
              label="L'interface"
              title={
                <>
                  Une vue d'ensemble,{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    millimétrée.
                  </span>
                </>
              }
            />

            <motion.figure
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
              className="relative"
            >
              <div className="relative border border-[var(--hairline)] rounded-2xl overflow-hidden bg-[var(--ink)] aspect-video group">
                <CornerTicks />
                <img
                  src="/Pasted Graphic.jpg.jpeg"
                  alt="Interface de l'application"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <figcaption className="mt-4 text-center font-anno text-[10px] uppercase tracking-[0.25em] text-[var(--slate)]">
                Planche 01 — Vue d'ensemble de l'interface
              </figcaption>
            </motion.figure>
          </div>
        </section>

        {/* ------------------------------------------------ chapitre II — démonstration */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36 crn-grid relative overflow-hidden">
          <div className="relative max-w-4xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="II"
              label="Démonstration"
              title={
                <>
                  Essayez l'interface,{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    en direct.
                  </span>
                </>
              }
            />

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-center font-anno text-[11px] uppercase tracking-[0.25em] text-[var(--lavender)] -mt-6 mb-12"
            >
              Essayez l'interface interactive ci-dessous
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <DemoSessionTracker />
              <p className="mt-4 text-center font-anno text-[10px] uppercase tracking-[0.25em] text-[var(--slate)]">
                Planche 02 — Enregistrement d'une séance
              </p>
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------ chapitre III — fonctionnalités */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36 relative overflow-hidden">
          <div
            className="absolute left-1/2 bottom-[-160px] -translate-x-1/2 w-[700px] h-[320px] rounded-[100%] bg-[var(--indigo)] opacity-[0.08] blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-6xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="III"
              label="Fonctionnalités"
              title={
                <>
                  Tout est noté,{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    rien n'est perdu.
                  </span>
                </>
              }
            />

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: Zap,
                  fig: "Fig. 01",
                  title: "Saisie Instantanée",
                  desc: "Remplissez vos reps et poids en quelques taps. Le système se souvient de vos dernières perfs.",
                },
                {
                  icon: TrendingUp,
                  fig: "Fig. 02",
                  title: "Volume & Intensité",
                  desc: "Calcul automatique du tonnage total et de l'intensité relative de chaque séance.",
                },
                {
                  icon: Calendar,
                  fig: "Fig. 03",
                  title: "Historique Complet",
                  desc: "Retrouvez n'importe quelle séance passée en un clin d'œil grâce aux filtres avancés.",
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
                  className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)]/50 p-8 hover:border-[var(--indigo)]/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <CornerTicks />
                  <div className="flex items-center justify-between mb-7">
                    <div className="w-12 h-12 rounded-xl border border-[var(--hairline)] bg-[var(--night)]/60 flex items-center justify-center text-[var(--lavender)]">
                      <f.icon size={22} />
                    </div>
                    <span className="font-anno text-[10px] uppercase tracking-[0.25em] text-[var(--slate)]">
                      {f.fig}
                    </span>
                  </div>
                  <h3 className="font-display text-xl mb-3">{f.title}</h3>
                  <p className="text-[var(--slate)] leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ cta */}
        <FinalCta
          title={
            <>
              Prêt à tracker{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                sérieusement ?
              </span>
            </>
          }
        />
      </main>

      <BigFooter />
    </div>
  );
};

/* ============================================================
   Démo interactive — restylée "planche technique"
   ============================================================ */

const annoLabel =
  "font-anno text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--slate)]";
const inputBase =
  "w-full px-3 py-2.5 rounded-lg bg-[var(--night)] border border-[var(--hairline)] text-[var(--mist)] font-anno text-lg focus:border-[var(--indigo)] focus:outline-none transition-colors";

const DemoSessionTracker = () => {
  // Types locaux (mock de la vraie structure de données)
  type RepsType = "uniform" | "variable";
  type Exercise = {
    id: number;
    name: string;
    sets: number;
    repsType: RepsType;
    repsUniform: number;
    repsPerSet: number[];
    weight: number;
    rest: number;
    expanded: boolean;
  };

  const [exercises, setExercises] = useState<Exercise[]>([
    { id: 1, name: "Développé Couché", sets: 3, repsType: "uniform", repsUniform: 10, repsPerSet: [10, 10, 10], weight: 80, rest: 90, expanded: true },
    { id: 2, name: "Squat", sets: 4, repsType: "uniform", repsUniform: 8, repsPerSet: [8, 8, 8, 8], weight: 100, rest: 120, expanded: false },
  ]);
  const [showSelector, setShowSelector] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const updateExercise = (id: number, field: keyof Exercise, value: any) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== id) return ex;

        if (field === "sets") {
          const newSets = parseInt(value) || 1;
          let newRepsPerSet = [...ex.repsPerSet];
          if (newSets > ex.repsPerSet.length) {
            const setsToAdd = newSets - ex.repsPerSet.length;
            const filler =
              ex.repsType === "uniform"
                ? ex.repsUniform
                : ex.repsPerSet[ex.repsPerSet.length - 1] || 10;
            newRepsPerSet = [...newRepsPerSet, ...Array(setsToAdd).fill(filler)];
          } else {
            newRepsPerSet = newRepsPerSet.slice(0, newSets);
          }
          return { ...ex, sets: newSets, repsPerSet: newRepsPerSet };
        }

        if (field === "repsType") {
          return { ...ex, repsType: value, repsPerSet: Array(ex.sets).fill(ex.repsUniform) };
        }

        return { ...ex, [field]: value };
      })
    );
  };

  const updateRepsPerSet = (id: number, setIndex: number, value: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== id) return ex;
        const newRepsPerSet = [...ex.repsPerSet];
        newRepsPerSet[setIndex] = parseInt(value) || 0;
        return { ...ex, repsPerSet: newRepsPerSet };
      })
    );
  };

  const addExercise = (name: string) => {
    setExercises([
      ...exercises,
      {
        id: Date.now(),
        name,
        sets: 3,
        repsType: "uniform",
        repsUniform: 10,
        repsPerSet: [10, 10, 10],
        weight: 60,
        rest: 90,
        expanded: true,
      },
    ]);
    setShowSelector(false);
    setCustomExerciseName("");
    setShowCustomForm(false);
  };

  const removeExercise = (id: number) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const toggleExpand = (id: number) => {
    setExercises(exercises.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e)));
  };

  const calculateTotalVolume = () => {
    return exercises.reduce((acc, ex) => {
      const reps =
        ex.repsType === "uniform"
          ? ex.sets * ex.repsUniform
          : ex.repsPerSet.reduce((a, b) => a + b, 0);
      return acc + reps * ex.weight;
    }, 0);
  };

  // Vue succès
  if (isSaved) {
    return (
      <div className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)] p-8 md:p-12 text-center">
        <CornerTicks />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="w-20 h-20 rounded-full border border-[var(--indigo)] bg-[var(--indigo)]/15 flex items-center justify-center mx-auto mb-6 shadow-[0_0_36px_rgba(99,102,241,0.35)]"
        >
          <CheckCircle2 size={36} className="text-[var(--lavender)]" />
        </motion.div>
        <h2 className="font-display text-3xl mb-4">Séance Enregistrée ! 🔥</h2>
        <p className="text-lg text-[var(--slate)] max-w-lg mx-auto mb-8 leading-relaxed">
          Bravo ! Vous avez soulevé un total de{" "}
          <span className="font-anno font-semibold text-[var(--lavender)]">
            <CountUp to={calculateTotalVolume()} suffix=" kg" />
          </span>{" "}
          aujourd'hui. La régularité est la clé de la réussite. Continuez comme ça !
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Magnetic>
            <button
              onClick={() => setIsSaved(false)}
              className="px-7 py-3.5 rounded-full font-semibold border border-[var(--hairline)] text-[var(--mist)] hover:border-[var(--lavender)] hover:text-[var(--lavender)] transition-colors bg-[var(--night)]/40"
            >
              Modifier
            </button>
          </Magnetic>
          <Magnetic>
            <Link
              to="/register"
              className="inline-flex px-7 py-3.5 rounded-full font-semibold bg-[var(--indigo)] text-white hover:bg-[#7376F5] transition-colors shadow-[0_0_36px_rgba(99,102,241,0.35)]"
            >
              Créer mon compte
            </Link>
          </Magnetic>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)] p-6 md:p-8 text-left">
      <CornerTicks />

      {/* en-tête */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-[var(--hairline)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-[var(--hairline)] bg-[var(--night)]/60 flex items-center justify-center text-[var(--lavender)]">
            <Dumbbell size={18} />
          </div>
          <div>
            <h3 className="font-display text-lg leading-tight">Nouvelle séance (Démo)</h3>
            <p className={annoLabel}>
              Aujourd'hui — {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div
          title="Annuler (Démo)"
          className="p-2 border border-[var(--hairline)] text-[var(--slate)] rounded-lg cursor-not-allowed opacity-50"
        >
          <X size={18} />
        </div>
      </div>

      {/* exercices */}
      <div className="space-y-4">
        {exercises.map((ex, idx) => (
          <div
            key={ex.id}
            className="rounded-xl border border-[var(--hairline)] bg-[var(--night)]/50 transition-colors hover:border-[var(--indigo)]/50"
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(ex.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg border border-[var(--hairline)] flex items-center justify-center text-[var(--lavender)] font-anno text-xs">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--mist)]">{ex.name}</h4>
                  <p className="font-anno text-[10px] uppercase tracking-[0.18em] text-[var(--slate)] mt-0.5">
                    {ex.sets} séries • {ex.repsType === "uniform" ? ex.repsUniform : "Variable"}{" "}
                    reps • {ex.weight} kg
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-[var(--slate)] hover:text-[var(--lavender)] rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExercise(ex.id);
                  }}
                  aria-label="Supprimer l'exercice"
                >
                  <Trash2 size={16} />
                </button>
                {ex.expanded ? (
                  <ChevronUp size={20} className="text-[var(--slate)]" />
                ) : (
                  <ChevronDown size={20} className="text-[var(--slate)]" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {ex.expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ ease: EASE, duration: 0.4 }}
                  className="border-t border-[var(--hairline)] overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    {/* champs principaux */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={`${annoLabel} pl-1`}>Poids (kg)</label>
                        <input
                          type="number"
                          value={ex.weight}
                          onChange={(e) => updateExercise(ex.id, "weight", e.target.value)}
                          className={inputBase}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`${annoLabel} pl-1`}>Séries</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(ex.id, "sets", e.target.value)}
                          className={inputBase}
                        />
                      </div>
                    </div>

                    {/* configuration des répétitions */}
                    <div className="p-2 rounded-xl border border-[var(--hairline)] bg-[var(--ink)]/60">
                      <div className="flex gap-1 mb-3">
                        <button
                          onClick={() => updateExercise(ex.id, "repsType", "uniform")}
                          className={`flex-1 py-1.5 font-anno text-[10px] uppercase tracking-[0.18em] rounded-lg transition-colors ${
                            ex.repsType === "uniform"
                              ? "bg-[var(--indigo)] text-white"
                              : "text-[var(--slate)] hover:text-[var(--lavender)]"
                          }`}
                        >
                          Uniforme
                        </button>
                        <button
                          onClick={() => updateExercise(ex.id, "repsType", "variable")}
                          className={`flex-1 py-1.5 font-anno text-[10px] uppercase tracking-[0.18em] rounded-lg transition-colors ${
                            ex.repsType === "variable"
                              ? "bg-[var(--indigo)] text-white"
                              : "text-[var(--slate)] hover:text-[var(--lavender)]"
                          }`}
                        >
                          Variable
                        </button>
                      </div>

                      <div className="px-1 pb-1">
                        <label className={`block ${annoLabel} mb-1.5 pl-1`}>Répétitions</label>
                        {ex.repsType === "uniform" ? (
                          <input
                            type="number"
                            value={ex.repsUniform}
                            onChange={(e) =>
                              updateExercise(ex.id, "repsUniform", e.target.value)
                            }
                            className={`${inputBase} text-center`}
                          />
                        ) : (
                          <div className="grid grid-cols-6 gap-2">
                            {ex.repsPerSet.map((reps, i) => (
                              <div key={i}>
                                <input
                                  type="number"
                                  value={reps}
                                  onChange={(e) => updateRepsPerSet(ex.id, i, e.target.value)}
                                  className="w-full px-1 py-2 text-center text-sm font-anno rounded-lg bg-[var(--night)] border border-[var(--hairline)] text-[var(--mist)] focus:border-[var(--indigo)] focus:outline-none transition-colors"
                                />
                                <div className="font-anno text-[9px] text-center mt-1 text-[var(--slate)] uppercase tracking-[0.15em]">
                                  S{i + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* repos */}
                    <div className="flex items-center gap-3">
                      <Clock size={15} className="text-[var(--slate)]" />
                      <label className={annoLabel}>Repos :</label>
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="number"
                          value={ex.rest}
                          onChange={(e) => updateExercise(ex.id, "rest", e.target.value)}
                          className="w-20 px-2 py-1.5 text-sm font-anno rounded-lg bg-[var(--night)] border border-[var(--hairline)] text-[var(--mist)] focus:border-[var(--indigo)] focus:outline-none transition-colors"
                        />
                        <span className={annoLabel}>secondes</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* ajout d'exercice */}
      {!showSelector ? (
        <button
          onClick={() => setShowSelector(true)}
          className="mt-4 w-full py-4 border border-dashed border-[var(--hairline)] rounded-xl flex items-center justify-center gap-2 font-anno text-[11px] uppercase tracking-[0.2em] text-[var(--slate)] hover:border-[var(--indigo)] hover:text-[var(--lavender)] transition-colors"
        >
          <Plus size={16} /> Ajouter un exercice
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: EASE, duration: 0.4 }}
          className="mt-4 p-4 rounded-xl border border-[var(--hairline)] bg-[var(--night)]/60"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomForm(false)}
                className={`font-anno text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-lg transition-colors ${
                  !showCustomForm
                    ? "bg-[var(--indigo)] text-white"
                    : "text-[var(--slate)] hover:text-[var(--lavender)]"
                }`}
              >
                Bibliothèque
              </button>
              <button
                onClick={() => setShowCustomForm(true)}
                className={`font-anno text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-lg transition-colors ${
                  showCustomForm
                    ? "bg-[var(--indigo)] text-white"
                    : "text-[var(--slate)] hover:text-[var(--lavender)]"
                }`}
              >
                Personnalisé
              </button>
            </div>
            <button
              onClick={() => {
                setShowSelector(false);
                setShowCustomForm(false);
              }}
              aria-label="Fermer"
            >
              <X size={18} className="text-[var(--slate)]" />
            </button>
          </div>

          {showCustomForm ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom de votre exercice..."
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--ink)] border border-[var(--hairline)] text-[var(--mist)] placeholder-[var(--slate)] focus:border-[var(--indigo)] focus:outline-none transition-colors"
                autoFocus
                onKeyPress={(e) =>
                  e.key === "Enter" && customExerciseName && addExercise(customExerciseName)
                }
              />
              <button
                disabled={!customExerciseName}
                onClick={() => addExercise(customExerciseName)}
                className="px-5 py-2 bg-[var(--indigo)] text-white font-semibold rounded-full hover:bg-[#7376F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          ) : (
            <div className="grid gap-1">
              {["Tractions", "Soulevé de Terre", "Rowing Barre", "Dips", "Curl Biceps"].map(
                (name) => (
                  <button
                    key={name}
                    onClick={() => addExercise(name)}
                    className="p-3 text-left rounded-lg text-[var(--mist)] hover:bg-[var(--indigo)]/10 hover:text-[var(--lavender)] transition-colors flex justify-between items-center group"
                  >
                    {name}
                    <Plus
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                )
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* récapitulatif + enregistrement */}
      <div className="mt-8 flex gap-4">
        <div className="flex-1 p-4 rounded-xl border border-[var(--hairline)] bg-[var(--night)]/60 flex flex-col items-center justify-center">
          <span className={annoLabel}>Volume</span>
          <span className="font-anno text-xl font-semibold text-[var(--mist)] mt-1">
            {calculateTotalVolume().toLocaleString()} kg
          </span>
        </div>
        <Magnetic className="flex-[2] flex" strength={0.15}>
          <button
            onClick={() => setIsSaved(true)}
            className="w-full bg-[var(--indigo)] hover:bg-[#7376F5] text-white font-semibold rounded-full shadow-[0_0_36px_rgba(99,102,241,0.35)] active:scale-95 transition-all"
          >
            Enregistrer la séance
          </button>
        </Magnetic>
      </div>
    </div>
  );
};
