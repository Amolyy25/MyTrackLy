import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LineChart as LineChartIcon, Camera, Target, ArrowUpRight } from "lucide-react";
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

/* ------------------------------------------------ données de la planche */

const weightData = [
  { name: "Jan", weight: 82.5 },
  { name: "Fév", weight: 81.8 },
  { name: "Mar", weight: 81.2 },
  { name: "Avr", weight: 80.5 },
  { name: "Mai", weight: 79.8 },
  { name: "Juin", weight: 79.0 },
  { name: "Juil", weight: 78.5 },
];

const metrics = [
  { label: "Tour de Taille", value: "78", unit: " cm", change: "−2.5 cm", count: 78, suffix: " cm" },
  { label: "Tour de Bras", value: "42", unit: " cm", change: "+1.2 cm", count: 42, suffix: " cm" },
  { label: "Body Fat", value: "14.2", unit: " %", change: "−3.8 %", count: null, suffix: "" },
  { label: "Poids", value: "78.5", unit: " kg", change: "−4.0 kg", count: null, suffix: "" },
];

const features = [
  {
    icon: LineChartIcon,
    title: "Graphiques Intuitifs",
    desc: "Voyez d'un coup d'œil vos tendances de poids et de mensurations sur la durée.",
    fig: "Fig. 01",
  },
  {
    icon: Camera,
    title: "Photos Avant/Après",
    desc: "Stockez vos photos de progrès de manière sécurisée et comparez votre évolution.",
    fig: "Fig. 02",
  },
  {
    icon: Target,
    title: "Objectifs Intelligents",
    desc: "Définissez des cibles de poids ou de taille et suivez votre chemin vers l'objectif.",
    fig: "Fig. 03",
  },
];

/* géométrie du graphe — viewBox 640 × 240, 78→83 kg sur l'axe Y */
const X0 = 20;
const STEP = 100;
const yOf = (w: number) => 30 + (83 - w) * 36;
const pts = weightData.map((d, i) => ({ x: X0 + i * STEP, y: yOf(d.weight), ...d }));
const linePath = pts
  .map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const mx = (prev.x + p.x) / 2;
    return `C ${mx} ${prev.y}, ${mx} ${p.y}, ${p.x} ${p.y}`;
  })
  .join(" ");
const areaPath = `${linePath} L ${pts[pts.length - 1].x} 240 L ${X0} 240 Z`;

/* ------------------------------------------------ page */

export const MeasurementsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="crn-root min-h-screen overflow-x-hidden antialiased">
      <GlobalStyle />
      <Nav />
      <main>
        <PageHero
          planche="Planche — Mensurations & poids"
          title={
            <>
              Visualisez votre{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                transformation.
              </span>
            </>
          }
          subtitle="Au delà du poids sur la balance. Suivez l'évolution de chaque groupe musculaire avec précision."
          cta={{ label: "Commencer gratuitement", to: "/register" }}
        />

        {/* ============ CHAPITRE I — la courbe de poids ============ */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36 relative overflow-hidden">
          <div
            className="absolute right-[-200px] top-1/3 w-[600px] h-[400px] rounded-[100%] bg-[var(--indigo)] opacity-[0.08] blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-7xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="I"
              label="Courbe de poids"
              title={
                <>
                  Chaque relevé trace{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    la tendance.
                  </span>
                </>
              }
            />

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)] p-6 md:p-10">
                <CornerTicks />

                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                  <div>
                    <div className="font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--lavender)] mb-2">
                      Évolution du Poids
                    </div>
                    <p className="text-sm text-[var(--slate)]">−4.0 kg sur 6 mois</p>
                  </div>
                  <span className="font-anno text-[11px] tracking-[0.2em] uppercase text-[var(--lavender)] border border-[var(--hairline)] rounded-full px-4 py-1.5 bg-[var(--night)]/60">
                    −4.8%
                  </span>
                </div>

                {/* relevé technique — courbe SVG */}
                <svg
                  viewBox="0 0 640 240"
                  className="w-full h-auto"
                  role="img"
                  aria-label="Courbe d'évolution du poids de 82.5 kg à 78.5 kg sur sept mois"
                >
                  <defs>
                    <linearGradient id="crnWeightFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* lignes de cote horizontales */}
                  {[82, 81, 80, 79].map((kg) => (
                    <g key={kg}>
                      <line
                        x1={X0}
                        y1={yOf(kg)}
                        x2="620"
                        y2={yOf(kg)}
                        stroke="rgba(165,180,252,0.12)"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                      />
                      <text
                        x="624"
                        y={yOf(kg) + 3}
                        className="font-anno"
                        fontSize="9"
                        fill="#64748B"
                      >
                        {kg}
                      </text>
                    </g>
                  ))}

                  {/* aire + courbe */}
                  <path d={areaPath} fill="url(#crnWeightFill)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* points de relevé */}
                  {pts.map((p) => (
                    <circle key={p.name} cx={p.x} cy={p.y} r="3.5" fill="#070B14" stroke="#818CF8" strokeWidth="2" />
                  ))}

                  {/* cote du dernier relevé */}
                  <line
                    x1={pts[6].x}
                    y1={pts[6].y + 8}
                    x2={pts[6].x}
                    y2="214"
                    stroke="#6366F1"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={pts[6].x - 6}
                    y={pts[6].y - 12}
                    textAnchor="end"
                    className="font-anno"
                    fontSize="10"
                    fill="#A5B4FC"
                  >
                    78.5 kg
                  </text>

                  {/* règle graduée + mois */}
                  <line x1={X0} y1="222" x2="620" y2="222" stroke="rgba(165,180,252,0.25)" strokeWidth="1" />
                  {Array.from({ length: 61 }, (_, i) => X0 + i * 10).map((x, i) => (
                    <line
                      key={x}
                      x1={x}
                      y1="222"
                      x2={x}
                      y2={i % 5 === 0 ? 216 : 219}
                      stroke="rgba(165,180,252,0.3)"
                      strokeWidth="1"
                    />
                  ))}
                  {pts.map((p) => (
                    <text
                      key={p.name}
                      x={p.x}
                      y="237"
                      textAnchor="middle"
                      className="font-anno"
                      fontSize="9"
                      fill="#64748B"
                    >
                      {p.name.toUpperCase()}
                    </text>
                  ))}
                </svg>
              </div>
              <p className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--slate)] text-center mt-5">
                Planche 01 — Courbe de poids · Janvier → Juillet
              </p>
            </motion.div>
          </div>
        </section>

        {/* ============ CHAPITRE II — la fiche de mensurations (papier) ============ */}
        <section className="crn-grid-paper text-[var(--ink-text)] py-24 md:py-36">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="II"
              label="Fiche de mensurations"
              title={
                <>
                  La précision,{" "}
                  <span className="font-serif-it font-normal text-[var(--indigo)]">
                    au millimètre.
                  </span>
                </>
              }
              light
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                  className="relative border border-[#1E1B4B]/15 rounded-2xl bg-white/70 backdrop-blur-sm p-6 hover:border-[var(--indigo)]/50 hover:-translate-y-1 transition"
                >
                  <CornerTicks color="var(--indigo)" />
                  <div className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--indigo)] mb-4">
                    {m.label}
                  </div>
                  <div className="font-display text-4xl leading-none mb-3">
                    {m.count !== null ? <CountUp to={m.count} suffix={m.suffix} /> : m.value + m.unit}
                  </div>
                  {/* trait de cote */}
                  <div className="flex items-center gap-2 mb-3" aria-hidden>
                    <span className="h-px flex-1 border-t border-dashed border-[#1E1B4B]/30" />
                    <span className="w-px h-2.5 bg-[#1E1B4B]/30" />
                  </div>
                  <span className="font-anno text-[11px] tracking-[0.16em] text-[var(--indigo)]">
                    {m.change}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="font-anno text-[10px] uppercase tracking-[0.24em] text-[#1E1B4B]/55 text-center mt-8"
            >
              Planche 02 — Fiche de mensurations · Relevés du mois
            </motion.p>
          </div>
        </section>

        {/* ============ CHAPITRE III — les instruments ============ */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="III"
              label="Instruments"
              title={
                <>
                  Trois outils pour{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    tout mesurer.
                  </span>
                </>
              }
            />

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
                  className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)]/50 p-7 hover:border-[var(--indigo)]/50 hover:-translate-y-1 transition"
                >
                  <CornerTicks />
                  <div className="flex items-center justify-between mb-7">
                    <div className="w-11 h-11 rounded-xl border border-[var(--hairline)] bg-[var(--night)]/60 flex items-center justify-center text-[var(--lavender)]">
                      <f.icon size={20} strokeWidth={1.75} />
                    </div>
                    <span className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--slate)]">
                      {f.fig}
                    </span>
                  </div>
                  <h3 className="font-display text-xl mb-3">{f.title}</h3>
                  <p className="text-[var(--slate)] leading-relaxed text-[15px]">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="mt-14 flex justify-center"
            >
              <Magnetic>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2.5 bg-[var(--indigo)] text-white font-semibold text-base px-8 py-3.5 rounded-full hover:bg-[#7376F5] transition-colors shadow-[0_0_36px_rgba(99,102,241,0.35)]"
                >
                  Commencer maintenant <ArrowUpRight size={17} />
                </Link>
              </Magnetic>
            </motion.div>
          </div>
        </section>

        <FinalCta
          title={
            <>
              Votre corps change,{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                mesurez-le.
              </span>
            </>
          }
        />
      </main>
      <BigFooter />
    </div>
  );
};
