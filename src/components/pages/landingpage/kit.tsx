import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

/* ============================================================
   KIT PARTAGÉ — identité "Le Carnet Millimétré"
   Utilisé par la landing et toutes les pages features.
   Nuit #070B14 / Encre #0D1322 / Indigo #6366F1
   Lavande #A5B4FC / Brume #E2E8F0 / Papier #EEF2FF
   Display : Bricolage Grotesque — Accents : Instrument Serif it.
   Annotations : Geist Mono — Body : Instrument Sans
   ============================================================ */

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------ styles globaux */

export const GlobalStyle = () => (
  <style>{`
    .crn-root {
      --night: #070B14;
      --ink: #0D1322;
      --indigo: #6366F1;
      --lavender: #A5B4FC;
      --mist: #E2E8F0;
      --slate: #64748B;
      --hairline: rgba(165, 180, 252, 0.16);
      --hairline-weak: rgba(165, 180, 252, 0.07);
      --paper: #EEF2FF;
      --ink-text: #1E1B4B;
      background: var(--night);
      color: var(--mist);
      font-family: 'Instrument Sans', sans-serif;
    }
    .crn-root ::selection { background: var(--indigo); color: white; }
    .font-display {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-weight: 800;
      letter-spacing: -0.03em;
    }
    .font-serif-it {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      font-weight: 400;
      letter-spacing: -0.01em;
    }
    .font-anno {
      font-family: 'Geist Mono', monospace;
      font-feature-settings: 'tnum' 1;
    }
    .crn-grid {
      background-image:
        linear-gradient(var(--hairline-weak) 1px, transparent 1px),
        linear-gradient(90deg, var(--hairline-weak) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .crn-grid-paper {
      background-color: var(--paper);
      background-image:
        linear-gradient(rgba(99, 102, 241, 0.09) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99, 102, 241, 0.09) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    .crn-spot {
      background: radial-gradient(
        560px circle at var(--mx, 50%) var(--my, 30%),
        rgba(99, 102, 241, 0.14),
        transparent 65%
      );
    }
    .crn-outline-word {
      color: transparent;
      -webkit-text-stroke: 1px rgba(165, 180, 252, 0.28);
    }
    @keyframes crn-draw {
      from { stroke-dashoffset: 140; }
      to { stroke-dashoffset: 0; }
    }
    .fig-card .draw { stroke-dasharray: 140; stroke-dashoffset: 0; }
    .fig-card:hover .draw { animation: crn-draw 1.1s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes crn-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }
    .crn-float { animation: crn-float 5s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .crn-float { animation: none; }
      .fig-card:hover .draw { animation: none; }
    }
  `}</style>
);

/* ------------------------------------------------ coins cotés (+ aux angles) */

export const CornerTicks = ({ color = "var(--lavender)" }: { color?: string }) => (
  <>
    {[
      "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
      "top-0 right-0 translate-x-1/2 -translate-y-1/2",
      "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
      "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    ].map((pos) => (
      <span key={pos} className={`absolute ${pos} pointer-events-none`} aria-hidden>
        <svg width="13" height="13" viewBox="0 0 13 13">
          <line x1="6.5" y1="0" x2="6.5" y2="13" stroke={color} strokeWidth="1" opacity="0.6" />
          <line x1="0" y1="6.5" x2="13" y2="6.5" stroke={color} strokeWidth="1" opacity="0.6" />
        </svg>
      </span>
    ))}
  </>
);

/* ------------------------------------------------ bouton magnétique */

export const Magnetic = ({
  children,
  strength = 0.3,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
};

/* ------------------------------------------------ reveal de ligne
   mount=true : anime dès le montage (obligatoire au-dessus de la
   ligne de flottaison — whileInView peut ne jamais se déclencher) */

export const LineReveal = ({
  children,
  delay = 0,
  className = "",
  mount = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  mount?: boolean;
}) => (
  <span className={`block overflow-hidden ${className}`}>
    <motion.span
      className="block"
      initial={{ y: "115%" }}
      {...(mount
        ? { animate: { y: "0%" } }
        : { whileInView: { y: "0%" }, viewport: { once: true } })}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

/* ------------------------------------------------ count-up */

export const CountUp = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
};

/* ------------------------------------------------ en-tête de chapitre */

export const ChapterHeader = ({
  numeral,
  label,
  title,
  light = false,
}: {
  numeral: string;
  label: string;
  title: React.ReactNode;
  light?: boolean;
}) => (
  <div className="mb-14 md:mb-20 text-center">
    <div className="flex items-center justify-center gap-4 mb-7">
      <span
        className={`h-px w-10 ${light ? "bg-[var(--ink-text)]/25" : "bg-[var(--hairline)]"}`}
      />
      <span
        className={`font-anno text-[11px] tracking-[0.35em] uppercase ${
          light ? "text-[var(--indigo)]" : "text-[var(--lavender)]"
        }`}
      >
        Chapitre {numeral} — {label}
      </span>
      <span
        className={`h-px w-10 ${light ? "bg-[var(--ink-text)]/25" : "bg-[var(--hairline)]"}`}
      />
    </div>
    <h2 className="font-display leading-[1.02] text-[clamp(2.2rem,5.5vw,4.2rem)]">{title}</h2>
  </div>
);

/* ------------------------------------------------ hero de page feature */

export const PageHero = ({
  planche,
  title,
  subtitle,
  cta,
}: {
  planche: string;
  title: React.ReactNode;
  subtitle: string;
  cta?: { label: string; to: string };
}) => (
  <section className="relative pt-32 md:pt-44 pb-16 md:pb-24 overflow-hidden crn-grid">
    <div
      className="absolute left-1/2 top-[62%] -translate-x-1/2 w-[800px] h-[380px] rounded-[100%] bg-[var(--indigo)] opacity-[0.12] blur-[120px] pointer-events-none"
      aria-hidden
    />
    <div className="relative max-w-5xl mx-auto px-5 md:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        className="inline-flex items-center gap-3 font-anno text-[11px] tracking-[0.32em] uppercase text-[var(--lavender)] border border-[var(--hairline)] rounded-full px-5 py-2 mb-9 bg-[var(--ink)]/60 backdrop-blur"
      >
        <span className="text-[var(--indigo)]">✳</span>
        {planche}
      </motion.div>

      <h1 className="font-display leading-[1.02] text-[clamp(2.5rem,6.5vw,5.4rem)] mb-7">
        <LineReveal mount delay={0.15}>
          {title}
        </LineReveal>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        className="text-lg md:text-xl text-[var(--slate)] max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>

      {cta && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          className="mt-10 flex justify-center"
        >
          <Magnetic>
            <Link
              to={cta.to}
              className="flex items-center justify-center gap-2.5 bg-[var(--indigo)] text-white font-semibold text-base md:text-lg px-9 py-4 rounded-full hover:bg-[#7376F5] transition-colors shadow-[0_0_44px_rgba(99,102,241,0.45)]"
            >
              {cta.label} <ArrowUpRight size={18} />
            </Link>
          </Magnetic>
        </motion.div>
      )}
    </div>
  </section>
);

/* ------------------------------------------------ nav */

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goAnchor = (to: string) => {
    const id = to.split("#")[1];
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = to;
    }
  };

  const links = [
    { label: "Le Système", to: "/#features", anchor: true },
    { label: "La Méthode", to: "/features/science" },
    { label: "Coachs", to: "/features/coaching" },
    { label: "Tarifs", to: "/#pricing", anchor: true },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[110] border-b transition-all duration-300 ${
          scrolled
            ? "bg-[#070B14]/88 backdrop-blur-xl border-[var(--hairline)]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 md:h-[4.5rem] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="font-display text-xl tracking-tight">MyTrackLy</span>
            <span className="text-[var(--indigo)] text-lg leading-none -translate-y-0.5">✳</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {links.map((l) =>
              l.anchor ? (
                <button
                  key={l.label}
                  onClick={() => goAnchor(l.to)}
                  className="font-anno text-[11px] uppercase tracking-[0.22em] text-[var(--slate)] hover:text-[var(--lavender)] transition-colors"
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  className="font-anno text-[11px] uppercase tracking-[0.22em] text-[var(--slate)] hover:text-[var(--lavender)] transition-colors"
                >
                  {l.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/login"
              className="font-anno text-[11px] uppercase tracking-[0.22em] text-[var(--mist)] hover:text-[var(--lavender)] transition-colors"
            >
              Connexion
            </Link>
            <Magnetic strength={0.22}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[var(--indigo)] text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#7376F5] transition-colors shadow-[0_0_28px_rgba(99,102,241,0.4)]"
              >
                Commencer <ArrowUpRight size={15} />
              </Link>
            </Magnetic>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 -mr-2 text-[var(--mist)]"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[115] bg-[var(--night)] crn-grid flex flex-col"
          >
            <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--hairline)]">
              <span className="font-display text-xl">
                MyTrackLy<span className="text-[var(--indigo)]">✳</span>
              </span>
              <button onClick={() => setOpen(false)} className="p-2 -mr-2" aria-label="Fermer">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-7 gap-1">
              {[
                { label: "Le Système", to: "/#features", anchor: true },
                { label: "La Méthode", to: "/features/science" },
                { label: "Coachs", to: "/features/coaching" },
                { label: "Tarifs", to: "/#pricing", anchor: true },
                { label: "Connexion", to: "/login" },
              ].map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, ease: EASE, duration: 0.5 }}
                >
                  {l.anchor ? (
                    <button
                      onClick={() => {
                        setOpen(false);
                        setTimeout(() => goAnchor(l.to), 80);
                      }}
                      className="font-display text-4xl py-3 text-left hover:text-[var(--lavender)] transition-colors"
                    >
                      {l.label}
                    </button>
                  ) : (
                    <Link
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="font-display text-4xl py-3 block hover:text-[var(--lavender)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>
            <div className="p-6 border-t border-[var(--hairline)]">
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 bg-[var(--indigo)] text-white font-semibold text-lg py-4 rounded-full"
              >
                Commencer gratuitement <ArrowUpRight size={19} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ------------------------------------------------ bandeau CTA final de page feature */

export const FinalCta = ({
  title,
  sub,
}: {
  title?: React.ReactNode;
  sub?: string;
}) => (
  <section className="py-24 md:py-32 border-t border-[var(--hairline)] crn-grid relative overflow-hidden">
    <div
      className="absolute left-1/2 bottom-[-200px] -translate-x-1/2 w-[800px] h-[400px] rounded-[100%] bg-[var(--indigo)] opacity-[0.12] blur-[120px] pointer-events-none"
      aria-hidden
    />
    <div className="relative max-w-4xl mx-auto px-5 md:px-8 text-center">
      <h2 className="font-display leading-[1.05] text-[clamp(2.2rem,5vw,3.8rem)] mb-6">
        {title ?? (
          <>
            Prêt à ouvrir{" "}
            <span className="font-serif-it font-normal text-[var(--lavender)]">
              votre carnet ?
            </span>
          </>
        )}
      </h2>
      <p className="text-lg text-[var(--slate)] mb-10 max-w-xl mx-auto">
        {sub ?? "Essai gratuit de 14 jours. Sans carte bancaire, sans engagement."}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Magnetic>
          <Link
            to="/register"
            className="flex items-center justify-center gap-2.5 bg-[var(--indigo)] text-white font-semibold text-base md:text-lg px-9 py-4 rounded-full hover:bg-[#7376F5] transition-colors shadow-[0_0_44px_rgba(99,102,241,0.45)]"
          >
            Commencer gratuitement <ArrowUpRight size={18} />
          </Link>
        </Magnetic>
        <Magnetic>
          <Link
            to="/features/pricing"
            className="flex items-center justify-center gap-2.5 border border-[var(--hairline)] text-[var(--mist)] font-semibold text-base md:text-lg px-9 py-4 rounded-full hover:border-[var(--lavender)] hover:text-[var(--lavender)] transition-colors bg-[var(--ink)]/40"
          >
            Voir les tarifs
          </Link>
        </Magnetic>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------ footer */

export const BigFooter = () => (
  <footer className="border-t border-[var(--hairline)] relative overflow-hidden">
    <div
      className="absolute left-1/2 bottom-[-260px] -translate-x-1/2 w-[1000px] h-[480px] rounded-[100%] bg-[var(--indigo)] opacity-[0.09] blur-[130px] pointer-events-none"
      aria-hidden
    />

    <div className="max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-24 relative">
      <div className="grid md:grid-cols-12 gap-10 pb-16 md:pb-20">
        <div className="md:col-span-5">
          <div className="font-display text-2xl mb-4">
            MyTrackLy<span className="text-[var(--indigo)]">✳</span>
          </div>
          <p className="text-[var(--slate)] max-w-sm leading-relaxed">
            Le carnet d'entraînement numérique qui transforme l'effort en données, et les données
            en progression.
          </p>
        </div>

        {[
          {
            title: "Produit",
            links: [
              { label: "Suivi de séances", to: "/features/tracking" },
              { label: "Mensurations", to: "/features/measurements" },
              { label: "Habitudes", to: "/features/habits" },
              { label: "La Méthode", to: "/features/science" },
            ],
          },
          {
            title: "Coachs",
            links: [
              { label: "Espace Coach", to: "/features/coaching" },
              { label: "Tarifs", to: "/features/pricing" },
            ],
          },
          {
            title: "Compte",
            links: [
              { label: "Connexion", to: "/login" },
              { label: "Inscription", to: "/register" },
            ],
          },
        ].map((col) => (
          <div key={col.title} className="md:col-span-2">
            <div className="font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--lavender)] mb-5">
              {col.title}
            </div>
            <ul className="flex flex-col gap-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-[var(--slate)] hover:text-[var(--mist)] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* wordmark géant */}
      <div className="select-none pointer-events-none text-center leading-none" aria-hidden>
        <span className="font-display crn-outline-word text-[clamp(4rem,14vw,13rem)] tracking-tight">
          MYTRACKLY
        </span>
      </div>
    </div>

    <div className="border-t border-[var(--hairline)] relative">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-anno text-[10px] uppercase tracking-[0.22em] text-[var(--slate)]">
          © 2026 MyTrackLy — Tous droits réservés
        </span>
        <span className="font-anno text-[10px] uppercase tracking-[0.22em] text-[var(--slate)]">
          Édition 2026 <span className="text-[var(--indigo)]">✳</span> Fait avec rigueur
        </span>
      </div>
    </div>
  </footer>
);
