import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Activity,
  Sparkles,
  Repeat,
  Brain,
  ExternalLink,
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
  EASE,
} from "./kit";

/* ============================================================
   PAGE — La Méthode (Science)
   Identité "Le Carnet Millimétré"
   ============================================================ */

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
} as const;

/* ------------------------------------------------ Chapitre I — Le circuit */

const loopSteps = [
  {
    num: "01",
    title: "Signal",
    desc: "Vous ouvrez MyTrackLy avant l'effort.",
    icon: Zap,
  },
  {
    num: "02",
    title: "Action",
    desc: "Vous validez vos séries.",
    icon: Activity,
  },
  {
    num: "03",
    title: "Récompense",
    desc: "Feedback visuel immédiat & dopamine.",
    icon: Sparkles,
  },
  {
    num: "04",
    title: "Mémorisation",
    desc: "Votre cerveau renforce l'habitude.",
    icon: Repeat,
  },
];

const loopPhases = [
  { label: "Anticipation", icon: Zap },
  { label: "Encodage", icon: Brain },
  { label: "Action", icon: Activity },
  { label: "Plaisir", icon: Sparkles },
];

const DopamineLoopSection = () => (
  <section className="border-t border-[var(--hairline)] py-24 md:py-36">
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <ChapterHeader
        numeral="I"
        label="Neurobiologie"
        title={
          <>
            Le circuit de la{" "}
            <span className="font-serif-it font-normal text-[var(--lavender)]">
              récompense.
            </span>
          </>
        }
      />

      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <motion.div {...fadeUp} transition={{ duration: 0.8, ease: EASE }}>
          <p className="text-lg text-[var(--slate)] leading-relaxed mb-4">
            La dopamine n'est pas seulement l'hormone du plaisir, c'est celle de la{" "}
            <strong className="text-[var(--mist)]">motivation</strong>.
          </p>
          <p className="text-lg text-[var(--slate)] leading-relaxed mb-10">
            Quand vous utilisez MyTrackLy, vous créez une boucle neurobiologique puissante.
            Votre cerveau apprend à associer l'effort physique à une satisfaction immédiate
            grâce au feedback visuel.
          </p>

          <div className="space-y-4">
            {loopSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-[var(--hairline)] bg-[var(--ink)]/50 hover:border-[rgba(99,102,241,0.5)] transition-colors"
              >
                <span className="font-anno text-[11px] tracking-[0.2em] text-[var(--lavender)] mt-1.5 shrink-0">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-full border border-[var(--hairline)] flex items-center justify-center shrink-0 text-[var(--indigo)]">
                  <step.icon size={18} />
                </div>
                <div>
                  <h4 className="font-display text-base text-[var(--mist)]">{step.title}</h4>
                  <p className="text-sm text-[var(--slate)]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="relative"
        >
          <div className="relative aspect-square rounded-2xl border border-[var(--hairline)] bg-[var(--ink)]/50 crn-grid p-6 overflow-hidden">
            <CornerTicks />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full bg-[var(--indigo)] opacity-[0.09] blur-[120px] pointer-events-none"
              aria-hidden
            />
            <span className="absolute top-4 left-5 font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--lavender)]">
              Fig. 01 — Boucle dopaminergique
            </span>
            <div className="grid grid-cols-2 gap-3 h-full relative pt-8">
              {loopPhases.map((phase, idx) => (
                <motion.div
                  key={phase.label}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={`relative rounded-2xl border border-[var(--hairline)] bg-[var(--night)]/60 flex flex-col items-center justify-center p-4 text-center hover:border-[rgba(99,102,241,0.5)] transition-colors ${
                    idx === 1 ? "mt-5" : idx === 2 ? "-mt-5" : ""
                  }`}
                >
                  <phase.icon className="w-10 h-10 mb-3 text-[var(--indigo)]" strokeWidth={1.5} />
                  <span className="font-anno text-[10px] uppercase tracking-[0.2em] text-[var(--lavender)]">
                    {phase.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------ Chapitre II — Small wins */

const smallWins = [
  {
    num: "A",
    title: "Validation Visuelle",
    desc: "Cocher une case libère une micro-dose de dopamine immédiate.",
  },
  {
    num: "B",
    title: "Sentiment de Maîtrise",
    desc: "Voir votre volume augmenter prouve votre compétence à vous-même.",
  },
  {
    num: "C",
    title: "Aversion à la Perte",
    desc: "La « Flamme » de série (Streak) exploite notre refus psychologique de briser la chaîne.",
  },
];

const SmallWinsSection = () => (
  <section className="border-t border-[var(--hairline)] py-24 md:py-36 relative overflow-hidden">
    <div
      className="absolute right-[-200px] top-[-120px] w-[520px] h-[520px] rounded-full bg-[var(--indigo)] opacity-[0.07] blur-[120px] pointer-events-none"
      aria-hidden
    />
    <div className="relative max-w-6xl mx-auto px-5 md:px-8">
      <ChapterHeader
        numeral="II"
        label="Psychologie"
        title={
          <>
            Le pouvoir des{" "}
            <span className="font-serif-it font-normal text-[var(--lavender)]">
              small wins.
            </span>
          </>
        }
      />

      <motion.p
        {...fadeUp}
        transition={{ duration: 0.8, ease: EASE }}
        className="text-lg md:text-xl text-[var(--slate)] max-w-2xl mx-auto text-center mb-14 md:mb-20 leading-relaxed"
      >
        Votre cerveau est plus sensible à la fréquence des récompenses qu'à leur taille.
        MyTrackLy transforme chaque série en victoire.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-6">
        {smallWins.map((item, i) => (
          <motion.div
            key={item.num}
            {...fadeUp}
            transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
            className="relative border-t-2 border-[var(--indigo)] pt-6 px-6 pb-8 border-x border-b border-x-[var(--hairline)] border-b-[var(--hairline)] rounded-b-2xl bg-[var(--ink)]/50 hover:-translate-y-1 transition-transform duration-300"
          >
            <span className="font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--lavender)] block mb-5">
              Principe {item.num}
            </span>
            <h3 className="font-display text-xl mb-3 text-[var(--mist)]">{item.title}</h3>
            <p className="text-[var(--slate)] leading-relaxed text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* relevés chiffrés */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        className="relative mt-16 border border-[var(--hairline)] rounded-2xl bg-[var(--ink)]/50 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--hairline)]"
      >
        <CornerTicks />
        {[
          { value: <CountUp to={75} suffix="%" />, prefix: "+", label: "Sentiment de compétence" },
          { value: <CountUp to={66} />, prefix: "", label: "Jours pour ancrer une habitude" },
          { value: <CountUp to={60} suffix="%" />, prefix: "−", label: "Énergie mentale consommée" },
          { value: "6/8", prefix: "", label: "Études : estime de soi améliorée" },
        ].map((stat) => (
          <div key={stat.label} className="p-6 md:p-8 text-center">
            <div className="font-display text-3xl md:text-4xl text-[var(--mist)] mb-2">
              {stat.prefix}
              {stat.value}
            </div>
            <div className="font-anno text-[10px] uppercase tracking-[0.2em] text-[var(--slate)]">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

/* ------------------------------------------------ Chapitre III — Amplificateur */

const amplifiers = [
  {
    num: "A",
    feature: "Enregistrement de Séances",
    benefit: "Boucle de renforcement positive. L'action devient la récompense.",
  },
  {
    num: "B",
    feature: "Courbes de Progression",
    benefit: "Estime de soi quantifiée. +75% de sentiment de compétence.",
  },
  {
    num: "C",
    feature: "Habitudes & Streaks",
    benefit: "Automatisation du comportement via le Striatum (moins d'effort mental).",
  },
  {
    num: "D",
    feature: "Mode Focus",
    benefit: "Réduction de la charge cognitive. Zéro distraction.",
  },
];

const FeaturesNeuroSection = () => (
  <section className="border-t border-[var(--hairline)] py-24 md:py-36">
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <ChapterHeader
        numeral="III"
        label="Application"
        title={
          <>
            Amplificateur{" "}
            <span className="font-serif-it font-normal text-[var(--lavender)]">
              neurobiologique.
            </span>
          </>
        }
      />

      <motion.p
        {...fadeUp}
        transition={{ duration: 0.8, ease: EASE }}
        className="text-lg text-[var(--slate)] max-w-2xl mx-auto text-center mb-14 md:mb-20 leading-relaxed"
      >
        Un feedback visuel constant amplifie la motivation intrinsèque.
      </motion.p>

      <div className="grid sm:grid-cols-2 gap-6">
        {amplifiers.map((item, i) => (
          <motion.div
            key={item.num}
            {...fadeUp}
            transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            className="border-t-2 border-[var(--indigo)] pt-6"
          >
            <span className="font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--lavender)] block mb-4">
              Levier {item.num}
            </span>
            <h3 className="font-display text-xl mb-2 text-[var(--mist)]">{item.feature}</h3>
            <p className="text-[var(--slate)] leading-relaxed text-sm">{item.benefit}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------ Chapitre IV — Preuves */

const evidences = [
  {
    title: "Réduction de l'Anxiété",
    desc: "Le tracking visuel active le système parasympathique en redonnant un sentiment de contrôle (« Je maîtrise mes résultats »).",
  },
  {
    title: "Efficacité Énergétique",
    desc: "Après 66 jours, une habitude consomme 60% moins d'énergie mentale grâce au basculement vers les ganglions de la base.",
  },
  {
    title: "Estime de Soi",
    desc: "6 études sur 8 montrent une amélioration directe de la perception de soi liée à la visualisation des données personnelles.",
  },
  {
    title: "Motivation Intrinsèque",
    desc: "L'autodétermination est renforcée par la compétence visible. Vous ne vous entraînez plus pour les autres, mais pour voir VOS chiffres monter.",
  },
];

const EvidenceSection = () => (
  <section className="border-t border-[var(--hairline)] py-24 md:py-36">
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <ChapterHeader
        numeral="IV"
        label="Preuves scientifiques"
        title={
          <>
            Ce n'est pas de la magie,{" "}
            <span className="font-serif-it font-normal text-[var(--lavender)]">
              c'est de la biologie.
            </span>
          </>
        }
      />

      <div className="grid md:grid-cols-2 gap-6">
        {evidences.map((item, i) => (
          <motion.div
            key={item.title}
            {...fadeUp}
            transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)]/50 p-7 hover:border-[rgba(99,102,241,0.5)] hover:-translate-y-1 transition-all duration-300"
          >
            <CornerTicks />
            <h3 className="font-display text-lg mb-3 text-[var(--mist)]">{item.title}</h3>
            <p className="text-sm text-[var(--slate)] leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        {...fadeUp}
        transition={{ duration: 0.8, ease: EASE }}
        className="mt-10 font-anno text-[10px] uppercase tracking-[0.2em] text-[var(--slate)] text-center leading-relaxed"
      >
        Sources : NIH Systematic Reviews (2021), Université de Genève (2025), Théorie de
        l'Autodétermination (Deci & Ryan).
      </motion.p>
    </div>
  </section>
);

/* ------------------------------------------------ Chapitre V — Sources (planche papier) */

const sources = [
  { title: "Le circuit de la récompense", url: "https://planet-vie.ens.fr/thematiques/animaux/systeme-nerveux-et-systeme-hormonal/le-circuit-de-la-recompense", institution: "ENS Planet-Vie", year: "2021", type: "Article éducatif" },
  { title: "Une étude récente révèle un nouveau mode d'apprentissage du cerveau", url: "https://www.frcneurodon.org/informer-sur-la-recherche/actus/une-etude-recente-revele-un-nouveau-mode-dapprentissage-du-cerveau/", institution: "FRC Neurodon", year: "2025", type: "Actualité recherche" },
  { title: "Seeking motivation and reward: Roles of dopamine", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8961455/", institution: "NIH PMC", year: "2022", type: "Article peer-reviewed" },
  { title: "Éclairer la voie de la récompense du cerveau", url: "https://issues.fr/eclairer-la-voie-de-la-recompense-du-cerveau-nouvelles-decouvertes-des-neurosciences/", institution: "Issues.fr", year: "2025", type: "Article synthèse" },
  { title: "Dopamine et motivation : une avancée scientifique", url: "https://www.isir.upmc.fr/actualites/dopamine-et-motivation-une-avancee-scientifique-sur-les-mecanismes-cerebraux-de-laction/", institution: "ISIR UPMC", year: "2024", type: "Actualité recherche" },
  { title: "Le circuit de la récompense, la dopamine et nos addictions", url: "https://www.semaineducerveau.fr/manifestation/le-circuit-de-la-recompense-la-dopamine-et-nos-addictions/", institution: "Semaine du Cerveau", year: "2025", type: "Article événement" },
  { title: "Self-tracking for Mental Wellness", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5600512/", institution: "NIH PMC", year: "2017", type: "Étude scientifique (297 étudiants)" },
  { title: "Habitudes : Comment le cerveau écrit notre quotidien", url: "https://www.neuroetpsycho.com/cerveau-et-habitudes-quotidien/", institution: "Neuro et Psycho", year: "2025", type: "Article scientifique" },
  { title: "Théorie de l'auto-détermination, motivation et bien-être", url: "https://www.lapsychologiepositive.fr/theorie-de-lauto-determination-motivation-et-bien-etre/", institution: "La Psychologie Positive", year: "2024", type: "Article explicatif" },
  { title: "How Self-tracking and the Quantified Self Promote Health", url: "https://pubmed.ncbi.nlm.nih.gov/34546176/", institution: "NIH PubMed", year: "2021", type: "Systematic Review (67 études)" },
  { title: "La science des habitudes saines", url: "https://askthescientists.com/fr/habits/", institution: "Ask the Scientists", year: "2020", type: "Article synthèse" },
  { title: "Théorie de l'autodétermination", url: "https://fr.wikipedia.org/wiki/Théorie_de_l'autodétermination", institution: "Wikipedia", year: "2013", type: "Article référence" },
  { title: "L'impact d'une activité physique adaptée sur l'estime de soi", url: "https://pepite-depot.univ-lille.fr/LIBRE/Mem_Staps/2024/ULIL_SMAS_2024_093.pdf", institution: "Mémoire STAPS Lille", year: "2024", type: "Mémoire académique" },
  { title: "JO 2024 : comment la pratique sportive préserve notre santé mentale", url: "https://www.femina.fr/article/jo-2024-comment-la-pratique-sportive-preserve-notre-sante-mentale", institution: "Femina", year: "2024", type: "Article bien-être" },
  { title: "En 10 ans, les Français ont doublé le temps consacré au sport", url: "https://www.ipsos.com/fr-fr/en-10-ans-les-francais-ont-quasiment-double-le-temps-quils-consacrent-au-sport", institution: "Ipsos", year: "2026", type: "Étude statistique" },
];

const SourcesSection = () => (
  <section className="crn-grid-paper text-[var(--ink-text)] py-24 md:py-36">
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <ChapterHeader
        numeral="V"
        label="Bibliographie"
        light
        title={
          <>
            Sources &{" "}
            <span className="font-serif-it font-normal text-[var(--indigo)]">recherches.</span>
          </>
        }
      />

      <motion.p
        {...fadeUp}
        transition={{ duration: 0.8, ease: EASE }}
        className="text-lg max-w-2xl mx-auto text-center mb-14 md:mb-20 leading-relaxed opacity-80"
      >
        Toutes les affirmations de cette page sont fondées sur des recherches scientifiques
        rigoureuses et des publications peer-reviewed.
      </motion.p>

      <div className="grid md:grid-cols-2 gap-4">
        {sources.map((source, i) => (
          <motion.a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: (i % 2) * 0.06, ease: EASE }}
            className="group relative p-5 rounded-2xl border border-[rgba(30,27,75,0.14)] bg-white/70 hover:border-[var(--indigo)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--indigo)] block mb-2">
                  Réf. {String(i + 1).padStart(2, "0")} — {source.year}
                </span>
                <h4 className="font-display text-base mb-3 group-hover:text-[var(--indigo)] transition-colors">
                  {source.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="font-anno text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full border border-[rgba(30,27,75,0.14)]">
                    {source.institution}
                  </span>
                  <span className="font-anno text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full border border-[rgba(99,102,241,0.4)] text-[var(--indigo)]">
                    {source.type}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-[var(--indigo)] transition-all" />
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div
        {...fadeUp}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mt-12 p-7 rounded-2xl border border-[rgba(30,27,75,0.14)] bg-white/70"
      >
        <CornerTicks color="var(--indigo)" />
        <p className="text-sm text-center leading-relaxed opacity-80">
          <strong>Note méthodologique :</strong> Cette page synthétise des recherches en
          neurosciences, psychologie comportementale, et sciences du sport. Les affirmations
          quantitatives (ex : « 75% d'amélioration ») proviennent d'études citées. MyTrackLy
          est un outil de fitness, pas un dispositif médical.
        </p>
      </motion.div>
    </div>
  </section>
);

/* ------------------------------------------------ Page */

const SciencePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="crn-root min-h-screen overflow-x-hidden antialiased">
      <GlobalStyle />
      <Nav />
      <main>
        <PageHero
          planche="Planche — La Méthode"
          title={
            <>
              Le « hack » dopaminergique de{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                votre progression.
              </span>
            </>
          }
          subtitle="La science révèle que chaque répétition enregistrée déclenche une réaction chimique. Ce n'est pas juste des données. C'est du carburant pour votre cerveau."
          cta={{ label: "Commencer gratuitement", to: "/register" }}
        />

        <DopamineLoopSection />
        <SmallWinsSection />
        <FeaturesNeuroSection />
        <EvidenceSection />
        <SourcesSection />

        <FinalCta
          title={
            <>
              Hacker votre cerveau.{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                Transformer votre corps.
              </span>
            </>
          }
          sub="Rejoignez les athlètes qui utilisent la science de la dopamine pour rendre leur succès inévitable."
        />
      </main>
      <BigFooter />
    </div>
  );
};

export default SciencePage;
