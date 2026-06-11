import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  CheckCircle2,
  Flame,
  CalendarRange,
  ArrowUpRight,
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

/* Données déterministes pour la heatmap (pas de Math.random au render) */
const HEAT_WEEKS = 26;
const HEAT_DAYS = 7;
const HEAT = Array.from({ length: HEAT_WEEKS * HEAT_DAYS }, (_, i) => {
  const v = ((i * 37 + 11) % 97) / 97;
  return v < 0.18 ? 0 : 0.18 + v * 0.82;
});

const WEEK_PATTERN = [1, 1, 1, 1, 0, 1, 0];
const WEEK_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const FEATURES = [
  {
    icon: Flame,
    ref: "Fig. 01",
    title: "Suivi de Streaks",
    desc: "Maintenez la flamme allumée. Visualisez vos séries de jours réussis pour rester motivé.",
  },
  {
    icon: CalendarRange,
    ref: "Fig. 02",
    title: "Heatmap GitHub-style",
    desc: "Une vue globale de votre année. Remplissez chaque case pour une année productive.",
  },
  {
    icon: CheckCircle2,
    ref: "Fig. 03",
    title: "Routines Flexibles",
    desc: "Configurez des habitudes quotidiennes, hebdomadaires ou mensuelles selon vos besoins.",
  },
];

export const HabitsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="crn-root min-h-screen overflow-x-hidden antialiased">
      <GlobalStyle />
      <Nav />
      <main>
        <PageHero
          planche="Planche — Habitudes & objectifs"
          title={
            <>
              La consistance est la{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                clé du succès.
              </span>
            </>
          }
          subtitle="Construisez une discipline de fer avec notre tracker d'habitudes intégré. Sommeil, Nutrition, Hydratation, tout compte."
          cta={{ label: "Créer ma routine", to: "/register" }}
        />

        {/* Planche 01 — mockup tracker d'habitudes */}
        <section className="relative pb-24 md:pb-32">
          <div className="max-w-3xl mx-auto px-5 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
              className="relative"
            >
              <div className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)] p-6 md:p-8">
                <CornerTicks />
                <div className="flex justify-between items-center mb-6 pb-5 border-b border-[var(--hairline)]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg border border-[var(--hairline)] flex items-center justify-center text-[var(--lavender)]">
                      <Target size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-display text-base text-[var(--mist)]">
                        Boire 3L d'eau
                      </div>
                      <div className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--slate)] mt-1">
                        Objectif quotidien
                      </div>
                    </div>
                  </div>
                  <div className="font-anno text-sm text-[var(--lavender)]">
                    <CountUp to={5} />
                    /7 jours
                  </div>
                </div>
                <div className="flex gap-2">
                  {WEEK_PATTERN.map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`h-10 w-full rounded-md flex items-center justify-center border transition-colors ${
                          s
                            ? "bg-[var(--indigo)] border-[var(--indigo)] text-white"
                            : "bg-transparent border-[var(--hairline)] text-[var(--slate)]"
                        }`}
                      >
                        <CheckCircle2 size={15} />
                      </div>
                      <span className="font-anno text-[10px] uppercase tracking-[0.2em] text-[var(--slate)]">
                        {WEEK_LABELS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--slate)]">
                Planche 01 — Suivi quotidien{" "}
                <span className="text-[var(--indigo)]">✳</span> échelle 1:1
              </div>
            </motion.div>
          </div>
        </section>

        {/* Chapitre I — Discipline */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="I"
              label="Discipline"
              title={
                <>
                  Habitudes &{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    discipline.
                  </span>
                </>
              }
            />
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
                  className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)]/50 p-8 hover:border-[var(--indigo)]/50 hover:-translate-y-1 transition duration-300"
                >
                  <CornerTicks />
                  <div className="flex items-center justify-between mb-7">
                    <div className="w-12 h-12 rounded-xl border border-[var(--hairline)] flex items-center justify-center text-[var(--lavender)]">
                      <f.icon size={22} />
                    </div>
                    <span className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--slate)]">
                      {f.ref}
                    </span>
                  </div>
                  <h3 className="font-display text-xl mb-3 text-[var(--mist)]">{f.title}</h3>
                  <p className="text-[var(--slate)] leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Chapitre II — Vue annuelle (heatmap) */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36 relative overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] rounded-[100%] bg-[var(--indigo)] opacity-[0.08] blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-5xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="II"
              label="Vue annuelle"
              title={
                <>
                  Une année,{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    case par case.
                  </span>
                </>
              }
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
              className="relative"
            >
              <div className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)] p-6 md:p-8 overflow-hidden">
                <CornerTicks />
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--hairline)]">
                  <span className="font-anno text-[11px] uppercase tracking-[0.28em] text-[var(--lavender)]">
                    Heatmap — Régularité
                  </span>
                  <span className="font-anno text-[10px] uppercase tracking-[0.22em] text-[var(--slate)]">
                    S01 → S26
                  </span>
                </div>
                <div
                  className="grid gap-[5px]"
                  style={{
                    gridTemplateColumns: `repeat(${HEAT_WEEKS}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${HEAT_DAYS}, minmax(0, 1fr))`,
                    gridAutoFlow: "column",
                  }}
                >
                  {HEAT.map((v, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-[3px] ${
                        v === 0 ? "border border-[var(--hairline)]" : "bg-[var(--indigo)]"
                      }`}
                      style={v === 0 ? undefined : { opacity: v }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--hairline)]">
                  <span className="font-anno text-[10px] uppercase tracking-[0.22em] text-[var(--slate)]">
                    Jours cohérents :{" "}
                    <span className="text-[var(--lavender)]">
                      <CountUp to={148} />
                    </span>
                  </span>
                  <div className="flex items-center gap-2 font-anno text-[10px] uppercase tracking-[0.22em] text-[var(--slate)]">
                    Moins
                    {[0.2, 0.45, 0.7, 1].map((o) => (
                      <span
                        key={o}
                        className="w-3 h-3 rounded-[3px] bg-[var(--indigo)]"
                        style={{ opacity: o }}
                      />
                    ))}
                    Plus
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--slate)]">
                Planche 02 — Grille d'habitudes{" "}
                <span className="text-[var(--indigo)]">✳</span> relevé annuel
              </div>
            </motion.div>
          </div>
        </section>

        {/* Chapitre III — section papier inversée */}
        <section className="crn-grid-paper text-[var(--ink-text)] py-24 md:py-36">
          <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
            <ChapterHeader
              numeral="III"
              label="Routine"
              title={
                <>
                  Installez de{" "}
                  <span className="font-serif-it font-normal text-[var(--indigo)]">
                    bonnes habitudes.
                  </span>
                </>
              }
              light
            />
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
              className="flex justify-center"
            >
              <Magnetic>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2.5 bg-[var(--indigo)] text-white font-semibold text-base md:text-lg px-9 py-4 rounded-full hover:bg-[#7376F5] transition-colors shadow-[0_0_36px_rgba(99,102,241,0.35)]"
                >
                  Créer ma routine <ArrowUpRight size={18} />
                </Link>
              </Magnetic>
            </motion.div>
          </div>
        </section>

        <FinalCta />
      </main>
      <BigFooter />
    </div>
  );
};
