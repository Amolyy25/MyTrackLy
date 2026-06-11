import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/* ============================================================
   Layout partagé pages auth — identité "Carnet millimétré"
   (même langage visuel que la landing : nuit, encre, indigo,
   grille millimétrée, annotations mono, serif italique)
   ============================================================ */

export const AuthStyle = () => (
  <style>{`
    .auth-root {
      --night: #070B14;
      --ink: #0D1322;
      --indigo: #6366F1;
      --lavender: #A5B4FC;
      --mist: #E2E8F0;
      --slate: #64748B;
      --hairline: rgba(165, 180, 252, 0.16);
      --hairline-weak: rgba(165, 180, 252, 0.07);
      background: var(--night);
      color: var(--mist);
      font-family: 'Instrument Sans', sans-serif;
    }
    .auth-root ::selection { background: var(--indigo); color: white; }
    .auth-root .font-display {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-weight: 800;
      letter-spacing: -0.03em;
    }
    .auth-root .font-serif-it {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      font-weight: 400;
    }
    .auth-root .font-anno {
      font-family: 'Geist Mono', monospace;
      font-feature-settings: 'tnum' 1;
    }
    .auth-grid {
      background-image:
        linear-gradient(var(--hairline-weak) 1px, transparent 1px),
        linear-gradient(90deg, var(--hairline-weak) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .auth-root select option { background: #0D1322; color: #E2E8F0; }
    @keyframes auth-float {
      0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
      50% { transform: translateY(-7px) rotate(var(--rot, 0deg)); }
    }
    .auth-float { animation: auth-float 5s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .auth-float { animation: none; }
    }
  `}</style>
);

export const labelClass =
  "block font-anno text-[10px] uppercase tracking-[0.25em] text-[var(--lavender)] mb-2.5";

export const inputClass = (error?: boolean, valid?: boolean) =>
  `w-full px-4 py-3.5 rounded-xl border bg-[var(--night)] text-[var(--mist)] placeholder:text-[#475569] focus:outline-none focus:ring-2 transition-colors ${
    error
      ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/25"
      : valid
      ? "border-emerald-400/60 focus:border-emerald-400 focus:ring-emerald-400/25"
      : "border-[var(--hairline)] focus:border-[var(--indigo)] focus:ring-[var(--indigo)]/30"
  }`;

export const errorTextClass = "mt-1.5 text-sm text-red-400";

export const submitClass =
  "w-full flex items-center justify-center gap-2 bg-[var(--indigo)] hover:bg-[#7376F5] text-white font-semibold py-4 px-4 rounded-full transition-colors shadow-[0_0_36px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:cursor-not-allowed";

const CornerTicks = () => (
  <>
    {[
      "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
      "top-0 right-0 translate-x-1/2 -translate-y-1/2",
      "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
      "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    ].map((pos) => (
      <span key={pos} className={`absolute ${pos} pointer-events-none`} aria-hidden>
        <svg width="13" height="13" viewBox="0 0 13 13">
          <line x1="6.5" y1="0" x2="6.5" y2="13" stroke="var(--lavender)" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1="6.5" x2="13" y2="6.5" stroke="var(--lavender)" strokeWidth="1" opacity="0.6" />
        </svg>
      </span>
    ))}
  </>
);

const Wordmark = () => (
  <Link to="/" className="inline-flex items-center gap-1">
    <span className="font-display text-xl tracking-tight">MyTrackLy</span>
    <span className="text-[var(--indigo)] text-lg leading-none -translate-y-0.5">✳</span>
  </Link>
);

export const AuthLayout = ({
  planche,
  title,
  subtitle,
  children,
}: {
  planche: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="auth-root min-h-screen lg:grid lg:grid-cols-5 antialiased">
    <AuthStyle />

    {/* panneau gauche — la page du carnet */}
    <div className="hidden lg:flex lg:col-span-2 relative flex-col justify-between p-12 auth-grid border-r border-[var(--hairline)] overflow-hidden">
      <div
        className="absolute left-1/2 bottom-[-180px] -translate-x-1/2 w-[640px] h-[380px] rounded-[100%] bg-[var(--indigo)] opacity-[0.13] blur-[110px] pointer-events-none"
        aria-hidden
      />

      <Wordmark />

      <div className="relative">
        <p className="font-serif-it text-[2.6rem] leading-[1.15] text-[var(--mist)] max-w-md mb-7">
          « Ce qui se mesure{" "}
          <span className="text-[var(--lavender)]">s'améliore. »</span>
        </p>
        <p className="text-[var(--slate)] leading-relaxed max-w-sm">
          Chaque séance enregistrée écrit une ligne de votre progression. Tonnage, records,
          régularité — tout est consigné.
        </p>

        <div
          className="relative inline-block mt-12 auth-float"
          style={{ "--rot": "-2deg" } as React.CSSProperties}
        >
          <div className="relative border border-[var(--hairline)] rounded-xl bg-[var(--ink)]/80 backdrop-blur px-5 py-4">
            <CornerTicks />
            <div className="font-anno text-[9px] tracking-[0.25em] text-[var(--slate)] mb-1.5">
              VOLUME / SEMAINE
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl leading-none">3.0T</span>
              <span className="font-anno text-[10px] text-[var(--lavender)]">▲ +12%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="font-anno text-[10px] tracking-[0.3em] uppercase text-[var(--slate)] relative">
        {planche} · Édition 2026
      </div>
    </div>

    {/* panneau droit — formulaire */}
    <div className="lg:col-span-3 flex flex-col min-h-screen">
      <div className="flex items-center justify-between px-5 md:px-10 h-16 lg:h-20 border-b border-[var(--hairline)]">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-anno text-[10px] uppercase tracking-[0.22em] text-[var(--slate)] hover:text-[var(--lavender)] transition-colors ml-auto"
        >
          <ArrowLeft size={13} /> Retour à l'accueil
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 md:px-10 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="font-anno text-[10px] tracking-[0.3em] uppercase text-[var(--lavender)] mb-4">
              {planche}
            </div>
            <h1 className="font-display text-3xl md:text-4xl mb-3">{title}</h1>
            <p className="text-[var(--slate)]">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
