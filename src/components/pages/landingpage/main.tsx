import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowRight, Check, Plus } from "lucide-react";
import {
  EASE,
  GlobalStyle,
  CornerTicks,
  Magnetic,
  LineReveal,
  CountUp,
  ChapterHeader,
  Nav,
  BigFooter,
} from "./kit";

/* ============================================================
   MYTRACKLY — LANDING "LE CARNET MILLIMÉTRÉ"
   Identité partagée : voir ./kit.tsx
   ============================================================ */

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  highlight?: boolean;
};

/* ============================================================ PAGE */

const LandingPage: React.FC = () => {
  return (
    <div className="crn-root min-h-screen overflow-x-hidden antialiased">
      <GlobalStyle />
      <Nav />
      <main>
        <Hero />
        <SystemChapter />
        <MethodChapter />
        <CoachChapter />
        <PricingSection />
      </main>
      <BigFooter />
    </div>
  );
};

/* ------------------------------------------------ mot animé façon carnet
   Cycle : écrit (révélation) → surligné (marqueur) → rayé (trait)
   → gommé (effacement) → mot suivant. Uniquement clip-path / transform /
   opacity — composités GPU, fluide aussi sur mobile. */

const HERO_WORDS = ["progrès.", "records.", "résultats.", "discipline."];
const WORD_CYCLE = 3.8;

const RotatingWord = () => {
  const [idx, setIdx] = useState(0);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  if (reduced) {
    return (
      <span className="font-serif-it font-normal text-[var(--lavender)]">{HERO_WORDS[0]}</span>
    );
  }

  return (
    <span className="relative inline-block whitespace-nowrap align-baseline">
      {/* surlignage marqueur */}
      <motion.span
        key={`hl-${idx}`}
        aria-hidden
        className="absolute -inset-x-[0.1em] top-[14%] bottom-[2%] rounded-[0.18em] bg-[var(--indigo)]/30 origin-left"
        style={{ rotate: "-1.2deg" }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 0, 1, 1, 1], opacity: [1, 1, 1, 1, 0] }}
        transition={{
          duration: WORD_CYCLE,
          times: [0, 0.3, 0.44, 0.86, 1],
          ease: "easeInOut",
        }}
      />
      {/* mot — écrit puis gommé */}
      <motion.span
        key={`w-${idx}`}
        className="relative font-serif-it font-normal text-[var(--lavender)]"
        initial={{ clipPath: "inset(-20% 100% -20% 0)" }}
        animate={{
          clipPath: [
            "inset(-20% 100% -20% 0)", // caché
            "inset(-20% 0% -20% 0)", // écrit (gauche → droite)
            "inset(-20% 0% -20% 0)", // tenu
            "inset(-20% 0% -20% 100%)", // gommé (gauche → droite)
          ],
        }}
        transition={{
          duration: WORD_CYCLE,
          times: [0, 0.16, 0.85, 1],
          ease: ["easeOut", "linear", "easeIn"],
        }}
        onAnimationComplete={() => setIdx((i) => (i + 1) % HERO_WORDS.length)}
      >
        {HERO_WORDS[idx]}
      </motion.span>
      {/* rayure */}
      <motion.span
        key={`s-${idx}`}
        aria-hidden
        className="absolute left-[-0.04em] right-[-0.04em] top-[54%] h-[0.05em] bg-[var(--mist)]/85 origin-left rounded-full"
        style={{ rotate: "-2deg" }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 0, 1, 1], opacity: [1, 1, 1, 0] }}
        transition={{
          duration: WORD_CYCLE,
          times: [0, 0.64, 0.74, 1],
          ease: "easeInOut",
        }}
      />
    </span>
  );
};

/* ------------------------------------------------ hero */

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yMockup = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !ref.current) return;
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative pt-32 md:pt-44 pb-20 md:pb-28 overflow-hidden crn-grid"
    >
      {/* spotlight souris + halo horizon */}
      <div className="absolute inset-0 crn-spot pointer-events-none" aria-hidden />
      <div
        className="absolute left-1/2 top-[58%] -translate-x-1/2 w-[900px] h-[420px] rounded-[100%] bg-[var(--indigo)] opacity-[0.13] blur-[120px] pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 text-center">
        {/* eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="inline-flex items-center gap-3 font-anno text-[11px] tracking-[0.32em] uppercase text-[var(--lavender)] border border-[var(--hairline)] rounded-full px-5 py-2 mb-10 bg-[var(--ink)]/60 backdrop-blur"
        >
          <span className="text-[var(--indigo)]">✳</span>
          Carnet d'entraînement numérique — Édition 2026
        </motion.div>

        {/* titre — animation au montage (au-dessus de la ligne de flottaison) */}
        <h1 className="font-display leading-[1.0] text-[clamp(2.8rem,7.5vw,6.8rem)] mb-8">
          <LineReveal mount delay={0.15}>
            L'effort devient donnée.
          </LineReveal>
          <LineReveal mount delay={0.28}>
            <span>
              La donnée devient <RotatingWord />
            </span>
          </LineReveal>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="text-lg md:text-xl text-[var(--slate)] max-w-2xl mx-auto leading-relaxed mb-12"
        >
          MyTrackLy enregistre vos séances, calcule votre tonnage, trace vos records — et
          transforme votre régularité en{" "}
          <span className="text-[var(--mist)]">résultats mesurables</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.62, ease: EASE }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 md:mb-28"
        >
          <Magnetic>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2.5 bg-[var(--indigo)] text-white font-semibold text-base md:text-lg px-9 py-4 rounded-full hover:bg-[#7376F5] transition-colors shadow-[0_0_44px_rgba(99,102,241,0.45)] w-full sm:w-auto"
            >
              Commencer gratuitement <ArrowUpRight size={18} />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              to="/features/tracking"
              className="flex items-center justify-center gap-2.5 border border-[var(--hairline)] text-[var(--mist)] font-semibold text-base md:text-lg px-9 py-4 rounded-full hover:border-[var(--lavender)] hover:text-[var(--lavender)] transition-colors w-full sm:w-auto bg-[var(--ink)]/40"
            >
              Voir la démo
            </Link>
          </Magnetic>
        </motion.div>

        {/* planche 01 — mockup annoté */}
        <motion.div
          style={{ y: yMockup }}
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease: EASE }}
          className="relative max-w-5xl mx-auto"
        >
          {/* annotations latérales */}
          <div className="hidden xl:block absolute -left-44 top-16 text-left crn-float" aria-hidden>
            <div className="font-anno text-[10px] tracking-[0.2em] text-[var(--lavender)] border border-dashed border-[var(--hairline)] rounded-md px-3.5 py-2.5 bg-[var(--ink)]/80 backdrop-blur rotate-[-3deg]">
              TONNAGE CALCULÉ
              <br />
              AUTOMATIQUEMENT
            </div>
            <svg width="120" height="46" className="ml-16 -mt-1">
              <path
                d="M4,4 C40,30 80,38 116,40"
                fill="none"
                stroke="var(--lavender)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.55"
              />
            </svg>
          </div>
          <div
            className="hidden xl:block absolute -right-40 top-40 text-left crn-float"
            style={{ animationDelay: "1.4s" }}
            aria-hidden
          >
            <svg width="110" height="40" className="ml-2 mb-1">
              <path
                d="M106,4 C70,26 36,32 4,36"
                fill="none"
                stroke="var(--lavender)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.55"
              />
            </svg>
            <div className="font-anno text-[10px] tracking-[0.2em] text-[var(--lavender)] border border-dashed border-[var(--hairline)] rounded-md px-3.5 py-2.5 bg-[var(--ink)]/80 backdrop-blur rotate-[2.5deg]">
              SÉRIE EN COURS
              <br />
              03 JOURS ▲
            </div>
          </div>

          <div className="relative border border-[var(--hairline)] rounded-2xl overflow-hidden shadow-[0_50px_140px_-30px_rgba(99,102,241,0.35)] select-none pointer-events-none">
            <CornerTicks />
            <DashboardMockup />
          </div>
          <div className="font-anno text-[10px] tracking-[0.3em] uppercase text-[var(--slate)] mt-5">
            Planche 01 — Tableau de bord élève · Échelle 1:1
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ------------------------------------------------ mockup dashboard */

const DashboardMockup = () => (
  <div className="bg-[var(--ink)] text-left">
    {/* barre haute */}
    <div className="h-12 md:h-14 border-b border-[var(--hairline)] flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <span className="font-display text-base md:text-lg">
          MyTrackLy<span className="text-[var(--indigo)]">✳</span>
        </span>
        <span className="font-anno text-[9px] tracking-[0.2em] px-2 py-0.5 rounded-full bg-[var(--indigo)]/15 text-[var(--lavender)] border border-[var(--indigo)]/30">
          ÉLÈVE
        </span>
      </div>
      <div className="hidden md:flex items-center gap-6 font-anno text-[10px] tracking-[0.18em] text-[var(--slate)]">
        {["ACCUEIL", "SÉANCES", "RÉSERVATIONS", "MENSURATIONS"].map((item, i) => (
          <span key={item} className={i === 0 ? "text-[var(--lavender)]" : ""}>
            {item}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:inline font-anno text-[10px] tracking-[0.15em] text-[var(--slate)]">
          T. PESQUET
        </span>
        <div className="w-7 h-7 rounded-full bg-[var(--indigo)]/20 border border-[var(--indigo)]/40 flex items-center justify-center text-[10px] text-[var(--lavender)] font-anno">
          T
        </div>
      </div>
    </div>

    {/* contenu */}
    <div className="p-4 md:p-7 flex flex-col gap-5 md:gap-7">
      <div>
        <div className="font-anno text-[10px] tracking-[0.25em] text-[var(--slate)] mb-2.5">
          VENDREDI 30 JANVIER 2026
        </div>
        <div className="font-display text-2xl md:text-3xl leading-tight mb-3">
          Bon retour, <span className="font-serif-it font-normal text-[var(--lavender)]">Thomas</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-anno text-[10px] tracking-[0.18em] px-3 py-1.5 rounded-full border border-[var(--hairline)] text-[var(--lavender)]">
            ▲ 7 SÉANCES CE MOIS
          </span>
          <span className="inline-flex items-center gap-1.5 font-anno text-[10px] tracking-[0.18em] px-3 py-1.5 rounded-full bg-[var(--indigo)] text-white">
            <Plus size={11} strokeWidth={3} /> NOUVELLE SÉANCE
          </span>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3.5">
        {[
          { label: "SÉANCES", value: "07", sub: "CE MOIS-CI" },
          { label: "VOLUME TOTAL", value: "3.0T", sub: "SOULEVÉ" },
          { label: "STREAK", value: "03J", sub: "SÉRIE EN COURS", bars: true },
          { label: "OBJECTIF", value: "60%", sub: "VOLUME / 5T", progress: 60 },
        ].map((s) => (
          <div
            key={s.label}
            className="relative border border-[var(--hairline)] rounded-xl p-3 md:p-4 bg-[var(--night)]/60"
          >
            <div className="font-anno text-[9px] tracking-[0.22em] text-[var(--slate)] mb-2">
              {s.label}
            </div>
            <div className="font-display text-2xl md:text-3xl leading-none mb-1.5">{s.value}</div>
            <div className="font-anno text-[9px] tracking-[0.18em] text-[var(--slate)]">{s.sub}</div>
            {s.bars && (
              <div className="flex gap-1 mt-2.5">
                {[1, 1, 1, 0, 0, 0, 0].map((on, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      on ? "bg-[var(--indigo)]" : "bg-[var(--hairline)]"
                    }`}
                  />
                ))}
              </div>
            )}
            {s.progress != null && (
              <div className="h-1.5 mt-2.5 bg-[var(--hairline)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--indigo)]" style={{ width: `${s.progress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* graphe */}
      <div className="relative border border-[var(--hairline)] rounded-xl bg-[var(--night)]/60 p-4 md:p-5 h-32 md:h-40 overflow-hidden">
        <div className="flex justify-between relative z-10">
          <span className="font-anno text-[9px] tracking-[0.22em] text-[var(--slate)]">
            VOLUME / SEMAINE
          </span>
          <span className="font-anno text-[9px] tracking-[0.22em] text-[var(--lavender)]">
            ▲ +12%
          </span>
        </div>
        <svg
          className="absolute bottom-0 left-0 right-0 h-20 md:h-28 w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1000 200"
        >
          <defs>
            <linearGradient id="crnChart" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,200 L0,160 L120,150 L240,110 L360,130 L480,80 L600,95 L720,55 L840,70 L1000,30 L1000,200 Z"
            fill="url(#crnChart)"
          />
          <path
            d="M0,160 L120,150 L240,110 L360,130 L480,80 L600,95 L720,55 L840,70 L1000,30"
            fill="none"
            stroke="#818CF8"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------ schémas line-art des figures */

const FigIcon = ({ kind }: { kind: string }) => {
  const stroke = "var(--lavender)";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="fig-icon" aria-hidden>
      {kind === "seances" && (
        <>
          <line className="draw" x1="8" y1="28" x2="48" y2="28" {...common} />
          <rect className="draw" x="10" y="18" width="6" height="20" rx="1.5" {...common} />
          <rect className="draw" x="40" y="18" width="6" height="20" rx="1.5" {...common} />
          <rect className="draw" x="4" y="22" width="4" height="12" rx="1" {...common} />
          <rect className="draw" x="48" y="22" width="4" height="12" rx="1" {...common} />
        </>
      )}
      {kind === "prs" && (
        <>
          <path className="draw" d="M6,46 L18,46 L18,34 L30,34 L30,20 L42,20 L42,8" {...common} />
          <path className="draw" d="M36,8 L42,8 L42,14" {...common} />
          <circle className="draw" cx="46" cy="6" r="3" {...common} />
        </>
      )}
      {kind === "mensurations" && (
        <>
          <rect className="draw" x="6" y="22" width="44" height="12" rx="2" {...common} />
          <line className="draw" x1="14" y1="22" x2="14" y2="28" {...common} />
          <line className="draw" x1="22" y1="22" x2="22" y2="30" {...common} />
          <line className="draw" x1="30" y1="22" x2="30" y2="28" {...common} />
          <line className="draw" x1="38" y1="22" x2="38" y2="30" {...common} />
          <line className="draw" x1="46" y1="22" x2="46" y2="28" {...common} />
        </>
      )}
      {kind === "habitudes" && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              className="draw"
              x={6 + i * 12}
              y="22"
              width="9"
              height="9"
              rx="2"
              {...common}
            />
          ))}
          <path className="draw" d="M8,26 L10,29 L13,24" {...common} />
          <path className="draw" d="M20,26 L22,29 L25,24" {...common} />
          <path className="draw" d="M32,26 L34,29 L37,24" {...common} />
        </>
      )}
      {kind === "ia" && (
        <>
          <circle className="draw" cx="28" cy="14" r="5" {...common} />
          <circle className="draw" cx="12" cy="34" r="5" {...common} />
          <circle className="draw" cx="44" cy="34" r="5" {...common} />
          <circle className="draw" cx="28" cy="46" r="4" {...common} />
          <line className="draw" x1="24" y1="17" x2="15" y2="30" {...common} />
          <line className="draw" x1="32" y1="17" x2="41" y2="30" {...common} />
          <line className="draw" x1="16" y1="37" x2="25" y2="44" {...common} />
          <line className="draw" x1="40" y1="37" x2="31" y2="44" {...common} />
        </>
      )}
      {kind === "coach" && (
        <>
          <rect className="draw" x="12" y="8" width="32" height="40" rx="3" {...common} />
          <line className="draw" x1="20" y1="20" x2="36" y2="20" {...common} />
          <line className="draw" x1="20" y1="28" x2="36" y2="28" {...common} />
          <line className="draw" x1="20" y1="36" x2="30" y2="36" {...common} />
          <path className="draw" d="M22,4 L34,4 L34,10 L22,10 Z" {...common} />
        </>
      )}
    </svg>
  );
};

/* ------------------------------------------------ chapitre I — le système */

const FIGURES = [
  {
    num: "01",
    kind: "seances",
    title: "Suivi de séances",
    desc: "Enregistrez vos séries entre deux répétitions. Tonnage et statistiques calculés automatiquement.",
    to: "/features/tracking",
  },
  {
    num: "02",
    kind: "prs",
    title: "Suivi des PRs",
    desc: "Vos records, vos 1RM estimés, vos courbes d'évolution. Toute votre progression, tracée.",
    to: "/features/tracking",
  },
  {
    num: "03",
    kind: "mensurations",
    title: "Mensurations",
    desc: "Poids, mesures, historique complet. L'évolution de votre physique, noir sur blanc.",
    to: "/features/measurements",
  },
  {
    num: "04",
    kind: "habitudes",
    title: "Habitudes & objectifs",
    desc: "Construisez une routine solide. Chaque case cochée renforce la régularité.",
    to: "/features/habits",
  },
  {
    num: "05",
    kind: "ia",
    title: "Insights IA",
    desc: "Des conseils personnalisés basés sur vos données pour casser les plateaux.",
    to: "/features/science",
  },
  {
    num: "06",
    kind: "coach",
    title: "Mode Coach",
    desc: "Programmes, élèves, réservations, paiements. Votre activité de coaching, digitalisée.",
    to: "/features/coaching",
  },
];

const SystemChapter = () => (
  <section id="features" className="py-24 md:py-36 border-t border-[var(--hairline)]">
    <div className="max-w-7xl mx-auto px-5 md:px-8">
      <ChapterHeader
        numeral="I"
        label="Le Système"
        title={
          <>
            Tout votre entraînement,{" "}
            <span className="font-serif-it font-normal text-[var(--lavender)]">
              consigné au même endroit.
            </span>
          </>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {FIGURES.map((fig, i) => (
          <motion.div
            key={fig.num}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.65, delay: (i % 3) * 0.1, ease: EASE }}
          >
            <Link
              to={fig.to}
              className="fig-card group relative flex flex-col h-full border border-[var(--hairline)] rounded-2xl p-7 md:p-8 bg-[var(--ink)]/50 hover:bg-[var(--ink)] hover:border-[var(--indigo)]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(99,102,241,0.3)]"
            >
              <CornerTicks />
              <div className="flex items-start justify-between mb-7">
                <FigIcon kind={fig.kind} />
                <span className="font-anno text-[10px] tracking-[0.3em] text-[var(--slate)] group-hover:text-[var(--lavender)] transition-colors">
                  FIG. {fig.num}
                </span>
              </div>
              <h3 className="font-display text-xl md:text-2xl mb-3">{fig.title}</h3>
              <p className="text-sm md:text-[15px] text-[var(--slate)] leading-relaxed flex-grow">
                {fig.desc}
              </p>
              <span className="inline-flex items-center gap-2 mt-6 font-anno text-[10px] tracking-[0.25em] uppercase text-[var(--lavender)] opacity-0 group-hover:opacity-100 transition-opacity">
                Examiner <ArrowRight size={13} />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------ chapitre II — la méthode */

const STEPS = [
  {
    num: "1",
    title: "Circuit de la dopamine",
    desc: "Valider une série déclenche une micro-récompense immédiate. Ce feedback positif crée une boucle d'habitude indestructible.",
  },
  {
    num: "2",
    title: "Surcharge progressive",
    desc: "L'hypertrophie exige un stress mécanique croissant. Sans suivi précis, vous stagnez. Avec des données, vous forcez l'adaptation.",
  },
  {
    num: "3",
    title: "Charge mentale zéro",
    desc: "L'effort cognitif appartient au mouvement, pas au calcul. Externalisez la mémoire, maximisez la connexion muscle-cerveau.",
  },
];

const MethodChapter = () => (
  <section className="py-24 md:py-36 border-t border-[var(--hairline)] relative overflow-hidden">
    <div
      className="absolute right-[-200px] top-1/3 w-[600px] h-[600px] rounded-full bg-[var(--indigo)] opacity-[0.07] blur-[140px] pointer-events-none"
      aria-hidden
    />
    <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
      <ChapterHeader
        numeral="II"
        label="La Méthode"
        title={
          <>
            Plus qu'une app,{" "}
            <span className="font-serif-it font-normal text-[var(--lavender)]">un protocole.</span>
          </>
        }
      />

      {/* étapes le long d'une ligne pointillée */}
      <div className="relative grid md:grid-cols-3 gap-12 md:gap-8 mb-20 md:mb-28">
        <div
          className="hidden md:block absolute top-6 left-[16%] right-[16%] border-t border-dashed border-[var(--hairline)]"
          aria-hidden
        />
        {STEPS.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.7, delay: i * 0.14, ease: EASE }}
            className="text-center md:px-4"
          >
            <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full border border-[var(--indigo)]/50 bg-[var(--night)] font-anno text-[var(--lavender)] mb-6 shadow-[0_0_24px_rgba(99,102,241,0.25)]">
              {s.num}
            </div>
            <h3 className="font-display text-xl md:text-2xl mb-3.5">{s.title}</h3>
            <p className="text-[15px] text-[var(--slate)] leading-relaxed max-w-sm mx-auto">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* relevés */}
      <div className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)]/50 grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
        <CornerTicks />
        {[
          { value: 500, suffix: "+", label: "Exercices en bibliothèque" },
          { value: 14, suffix: "j", label: "D'essai gratuit, sans CB" },
          { value: 0, suffix: "", label: "Charge mentale en séance" },
          { value: 100, suffix: "%", label: "Pensé pour le mobile" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`p-7 md:p-10 text-center ${
              i > 0 ? "border-l border-[var(--hairline)]" : ""
            } ${i >= 2 ? "border-t lg:border-t-0 border-[var(--hairline)]" : ""} ${
              i === 2 ? "lg:border-l border-l-0" : ""
            }`}
          >
            <div className="font-display text-[clamp(2.2rem,4.5vw,3.6rem)] leading-none text-[var(--lavender)] mb-2.5">
              <CountUp to={s.value} suffix={s.suffix} />
            </div>
            <div className="font-anno text-[10px] uppercase tracking-[0.22em] text-[var(--slate)]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/features/science"
          className="group inline-flex items-center gap-2.5 font-anno text-[11px] uppercase tracking-[0.28em] text-[var(--lavender)] hover:text-white transition-colors"
        >
          La science derrière MyTrackLy
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1.5" />
        </Link>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------ chapitre III — coachs (page papier) */

const CoachChapter = () => (
  <section className="py-24 md:py-36 crn-grid-paper text-[var(--ink-text)]">
    <div className="max-w-7xl mx-auto px-5 md:px-8">
      <ChapterHeader
        numeral="III"
        label="Espace Coach"
        light
        title={
          <>
            Votre coaching,{" "}
            <span className="font-serif-it font-normal text-[var(--indigo)]">
              en ordre de marche.
            </span>
          </>
        }
      />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <p className="text-lg md:text-xl leading-relaxed text-[var(--ink-text)]/65 mb-10 max-w-xl">
            Digitalisez votre activité. Programmes, élèves, agenda, paiements — tout au même
            endroit, pour que votre temps reparte sur le terrain.
          </p>

          <ul className="mb-12">
            {[
              "Création de programmes en quelques clics",
              "Bibliothèque de 500+ exercices",
              "Sync Google Calendar & réservations",
              "Paiements automatisés par Stripe",
              "CRM clients complet",
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                className="flex items-center gap-4 py-4 border-b border-[var(--indigo)]/15"
              >
                <span className="font-anno text-[10px] tracking-[0.18em] text-[var(--indigo)] shrink-0 w-7">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-medium">{item}</span>
                <Check className="ml-auto w-4 h-4 text-[var(--indigo)] shrink-0" strokeWidth={3} />
              </motion.li>
            ))}
          </ul>

          <Magnetic>
            <Link
              to="/features/coaching"
              className="inline-flex items-center gap-2.5 bg-[var(--ink-text)] text-white font-semibold text-base px-9 py-4 rounded-full hover:bg-[var(--indigo)] transition-colors"
            >
              Je suis coach <ArrowUpRight size={18} />
            </Link>
          </Magnetic>
        </div>

        {/* agenda */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative bg-white rounded-2xl p-6 md:p-8 border border-[var(--indigo)]/20 shadow-[0_32px_80px_-24px_rgba(99,102,241,0.35)]"
        >
          <CornerTicks color="#6366F1" />
          <div className="flex items-center justify-between mb-7 pb-5 border-b border-[var(--indigo)]/12">
            <div>
              <div className="font-display text-xl md:text-2xl leading-none mb-1.5">
                Agenda collaboratif
              </div>
              <div className="font-anno text-[10px] tracking-[0.22em] text-[var(--ink-text)]/45">
                MARDI 24 JANVIER
              </div>
            </div>
            <span className="font-anno text-[10px] tracking-[0.18em] px-2.5 py-1 rounded-full bg-[var(--indigo)]/10 text-[var(--indigo)] border border-[var(--indigo)]/25">
              SYNC
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { time: "09:00", name: "Séance Épaules — Thomas", type: "COACHING 1:1" },
              { time: "11:30", name: "Bilan Mensuel — Sarah", type: "VISIO" },
              { time: "14:00", name: "Séance Jambes — Alex", type: "COACHING 1:1" },
            ].map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-5 p-4 rounded-xl border border-[var(--indigo)]/12 border-l-[3px] border-l-[var(--indigo)] bg-[var(--paper)]/60"
              >
                <span className="font-anno text-sm text-[var(--ink-text)]/50">{slot.time}</span>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{slot.name}</div>
                  <div className="font-anno text-[9px] tracking-[0.22em] text-[var(--indigo)] mt-1">
                    {slot.type}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="font-anno text-[9px] tracking-[0.25em] uppercase text-[var(--ink-text)]/35 mt-6">
            Planche 02 — Vue agenda coach
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------ chapitre IV — tarifs */

const PLANS: PricingPlan[] = [
  {
    id: "personnel",
    name: "Personnel",
    price: "4.99€",
    period: "/mois",
    description: "Parfait pour suivre votre progression personnelle",
    features: [
      "Suivi personnel complet de vos séances",
      "Statistiques et progression détaillées",
      "Mensurations et historique",
      "Habitudes et objectifs personnels",
      "Historique complet de vos séances",
      "Support par email",
    ],
    cta: "Essai gratuit 14j",
    highlight: false,
  },
  {
    id: "coach",
    name: "Coach",
    price: "49.99€",
    period: "/mois",
    description: "Solution complète pour gérer vos élèves",
    features: [
      "Toutes les fonctionnalités du plan Personnel",
      "Gestion illimitée de vos élèves",
      "Visualisation complète des données de vos élèves",
      "Création de séances pour vos élèves",
      "Messagerie avec tous vos élèves",
      "Programmes d'entraînement personnalisés",
      "Rappels et notifications par email",
      "Statistiques globales de vos élèves",
      "Support prioritaire 24/7",
    ],
    cta: "Essai gratuit 14j",
    popular: true,
    highlight: true,
  },
  {
    id: "eleve",
    name: "Élève",
    price: "0€",
    period: "",
    description: "Idéal pour être accompagné par un coach",
    features: [
      "Toutes les fonctionnalités du plan Personnel",
      "Coach assigné pour vous accompagner",
      "Réservation de séances avec votre coach",
      "Discussion et messagerie avec le coach",
      "Accès aux programmes créés par votre coach",
      "Suivi personnalisé par votre coach",
      "Support prioritaire",
    ],
    cta: "S'inscrire",
    highlight: false,
  },
];

export const PricingSection = ({ theme }: { theme?: string }) => {
  void theme; // identité unique — le design ne dépend plus du thème
  return (
    <section id="pricing" className="crn-root py-24 md:py-36 border-t border-[var(--hairline)]">
      <GlobalStyle />
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <ChapterHeader
          numeral="IV"
          label="L'Engagement"
          title={
            <>
              Un prix clair,{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                zéro friction.
              </span>
            </>
          }
        />

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="text-center font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--slate)] mt-10">
          Pas de frais cachés · Annulation en 1 clic
        </p>
      </div>
    </section>
  );
};

const PricingCard = ({ plan }: { plan: PricingPlan }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";
      const endpoint = token
        ? `${API_URL}/stripe/create-subscription-checkout`
        : `${API_URL}/stripe/public-subscription-checkout`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error("Erreur de paiement", data);
        alert("Une erreur est survenue lors de l'accès au paiement.");
      }
    } catch (err) {
      console.error("Erreur réseau", err);
      alert("Problème de connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const hl = plan.highlight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`relative flex flex-col rounded-2xl p-7 md:p-9 ${
        hl
          ? "border border-[var(--indigo)] bg-[var(--ink)] shadow-[0_0_70px_-12px_rgba(99,102,241,0.45)]"
          : "border border-[var(--hairline)] bg-[var(--ink)]/45"
      }`}
    >
      {hl && <CornerTicks color="#6366F1" />}
      <div className="flex items-start justify-between mb-7">
        <h3 className="font-display text-2xl md:text-3xl leading-none">{plan.name}</h3>
        {plan.popular && (
          <span className="font-anno text-[9px] tracking-[0.22em] px-3 py-1 rounded-full bg-[var(--indigo)] text-white">
            RECOMMANDÉ
          </span>
        )}
      </div>

      <div className="mb-3 min-h-[3.5rem]">
        {plan.id === "eleve" ? (
          <div>
            <div className="font-display text-xl leading-tight mb-1">Géré par votre coach</div>
            <div className="font-anno text-[10px] tracking-[0.18em] text-[var(--slate)]">
              VOTRE COACH PAIE VOTRE ACCÈS
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl leading-none tracking-tight">{plan.price}</span>
            {plan.period && (
              <span className="font-anno text-xs text-[var(--slate)]">{plan.period}</span>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-[var(--slate)] mb-9">{plan.description}</p>

      <ul className="flex flex-col gap-3.5 mb-9 flex-grow">
        {plan.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-snug">
            <Check
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                hl ? "text-[var(--indigo)]" : "text-[var(--lavender)]"
              }`}
              strokeWidth={3}
            />
            <span className="text-[var(--mist)]/85">{feat}</span>
          </li>
        ))}
      </ul>

      {plan.id === "eleve" ? (
        <Link
          to="/register?plan=eleve"
          className="flex items-center justify-center gap-2 border border-[var(--hairline)] font-semibold py-3.5 rounded-full hover:border-[var(--lavender)] hover:text-[var(--lavender)] transition-colors"
        >
          {plan.cta} <ArrowUpRight size={16} />
        </Link>
      ) : (
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 font-semibold py-3.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            hl
              ? "bg-[var(--indigo)] text-white hover:bg-[#7376F5] shadow-[0_0_32px_rgba(99,102,241,0.4)]"
              : "border border-[var(--hairline)] hover:border-[var(--lavender)] hover:text-[var(--lavender)]"
          }`}
        >
          {isLoading ? (
            <span
              className="w-5 h-5 border-[3px] rounded-full animate-spin"
              style={{ borderColor: "currentColor", borderTopColor: "transparent", opacity: 0.8 }}
            />
          ) : (
            <>
              {plan.cta} <ArrowUpRight size={16} />
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};

export default LandingPage;
