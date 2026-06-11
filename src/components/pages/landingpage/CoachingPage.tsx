import { useEffect, type ReactNode } from "react";
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
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  Activity,
  ArrowUpRight,
} from "lucide-react";

/* ------------------------------------------------ item de liste */

const FeatureListItem = ({
  children,
  paper = false,
}: {
  children: ReactNode;
  paper?: boolean;
}) => (
  <li className="flex items-start gap-3">
    <CheckCircle2
      size={18}
      className={`flex-shrink-0 mt-0.5 ${
        paper ? "text-[var(--indigo)]" : "text-[var(--lavender)]"
      }`}
    />
    <span className={paper ? "text-[var(--ink-text)]/80" : "text-[var(--mist)]"}>
      {children}
    </span>
  </li>
);

/* ------------------------------------------------ page */

export const CoachingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="crn-root min-h-screen overflow-x-hidden antialiased">
      <GlobalStyle />
      <Nav />
      <main>
        {/* ============================= Hero ============================= */}
        <PageHero
          planche="Planche — Espace Coach"
          title={
            <>
              Gérez et scalez votre{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                business de coaching.
              </span>
            </>
          }
          subtitle="Centralisez vos élèves, programmes, paiements et votre calendrier. L'outil professionnel tout-en-un pour les coachs modernes."
          cta={{ label: "Essai Coach Gratuit (14j)", to: "/register?role=coach" }}
        />

        {/* =============== Chapitre I — Parc élèves =============== */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36 relative overflow-hidden">
          <div
            className="absolute -left-40 top-1/3 w-[520px] h-[420px] rounded-full bg-[var(--indigo)] opacity-[0.07] blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-6xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="I"
              label="Parc élèves"
              title={
                <>
                  Gestion de{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    Parc Élèves.
                  </span>
                </>
              }
            />

            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="inline-flex items-center gap-3 font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--lavender)] mb-6">
                  <Users size={14} className="text-[var(--indigo)]" />
                  Fig. 01 — Vue d'ensemble
                </div>
                <p className="text-lg text-[var(--slate)] leading-relaxed mb-8">
                  Accédez à une liste exhaustive de tous vos élèves. Consultez
                  leurs profils, leurs dernières séances et leurs mensurations
                  en un clic.
                </p>
                <ul className="space-y-4">
                  <FeatureListItem>
                    Assignation de programmes personnalisés
                  </FeatureListItem>
                  <FeatureListItem>
                    Feedback correctionnel sur les séances
                  </FeatureListItem>
                  <FeatureListItem>
                    Suivi de l'évolution du poids et des photos
                  </FeatureListItem>
                </ul>
              </motion.div>

              {/* Planche — liste des élèves */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              >
                <div className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)]/50 p-6 md:p-8 hover:border-[var(--indigo)]/50 transition-colors">
                  <CornerTicks />
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--hairline)]">
                    <span className="font-anno text-[11px] uppercase tracking-[0.22em] text-[var(--mist)]">
                      Mes Élèves (12)
                    </span>
                    <span className="font-anno text-[10px] uppercase tracking-[0.2em] text-[var(--indigo)] cursor-pointer hover:text-[var(--lavender)] transition-colors">
                      Voir tout →
                    </span>
                  </div>
                  <div className="space-y-3">
                    {["A", "B", "C"].map((letter, i) => (
                      <div
                        key={letter}
                        className="flex items-center gap-4 p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--night)]/60"
                      >
                        <div className="w-10 h-10 rounded-full border border-[var(--indigo)]/50 bg-[var(--indigo)]/15 flex items-center justify-center font-anno text-[11px] text-[var(--lavender)]">
                          {`0${i + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[var(--mist)]">
                            Thomas {letter}.
                          </div>
                          <div className="font-anno text-[10px] uppercase tracking-[0.16em] text-[var(--slate)] mt-0.5">
                            Dernière séance : Hier
                          </div>
                        </div>
                        <span className="font-anno text-[9px] uppercase tracking-[0.2em] text-[var(--lavender)] border border-[var(--indigo)]/40 bg-[var(--indigo)]/10 px-2.5 py-1 rounded-full">
                          Actif
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--slate)] text-center mt-5">
                  Planche 01 — Liste des élèves
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =============== Chapitre II — Agenda (section papier) =============== */}
        <section className="crn-grid-paper text-[var(--ink-text)] border-t border-[var(--hairline)] py-24 md:py-36">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <ChapterHeader
              light
              numeral="II"
              label="Agenda"
              title={
                <>
                  Planning &{" "}
                  <span className="font-serif-it font-normal text-[var(--indigo)]">
                    Synchronisation.
                  </span>
                </>
              }
            />

            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Planche — agenda */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE }}
                className="md:order-1 order-2"
              >
                <div className="relative bg-white border border-[var(--indigo)]/20 rounded-2xl p-6 md:p-8 shadow-[0_18px_50px_rgba(30,27,75,0.10)]">
                  <CornerTicks color="var(--indigo)" />
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--indigo)]/15">
                    <span className="font-anno text-[11px] uppercase tracking-[0.22em] text-[var(--ink-text)]">
                      Semaine 24 — Juin
                    </span>
                    <Calendar size={16} className="text-[var(--indigo)]" />
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-[var(--indigo)]/20 border-l-4 border-l-[var(--indigo)] bg-[var(--paper)]">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-anno text-[11px] tracking-[0.1em] text-[var(--ink-text)] font-semibold">
                          09:00 — 10:00
                        </span>
                        <span className="font-anno text-[9px] uppercase tracking-[0.2em] text-[var(--indigo)]">
                          Coaching 1:1
                        </span>
                      </div>
                      <div className="text-sm text-[var(--ink-text)]/70">
                        Séance Pecs avec Alex
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-[var(--indigo)]/20 border-l-4 border-l-[var(--indigo)] bg-[var(--paper)]">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-anno text-[11px] tracking-[0.1em] text-[var(--ink-text)] font-semibold">
                          11:30 — 12:00
                        </span>
                        <span className="font-anno text-[9px] uppercase tracking-[0.2em] text-[var(--indigo)]">
                          Bilan Visio
                        </span>
                      </div>
                      <div className="text-sm text-[var(--ink-text)]/70">
                        Point mensuel avec Sarah
                      </div>
                    </div>
                  </div>
                </div>
                <div className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--ink-text)]/55 text-center mt-5">
                  Planche 02 — Vue agenda coach
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
                className="md:order-2 order-1"
              >
                <div className="inline-flex items-center gap-3 font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--indigo)] mb-6">
                  <Calendar size={14} />
                  Fig. 02 — Organisation
                </div>
                <p className="text-lg text-[var(--ink-text)]/70 leading-relaxed mb-8">
                  Organisez vos semaines de coaching sans friction.
                  Synchronisation bidirectionnelle avec Google Calendar pour
                  éviter les doublons.
                </p>
                <ul className="space-y-4">
                  <FeatureListItem paper>
                    Définition de vos disponibilités hebdomadaires
                  </FeatureListItem>
                  <FeatureListItem paper>
                    Système de réservation pour les élèves
                  </FeatureListItem>
                  <FeatureListItem paper>
                    Notifications automatiques (Email)
                  </FeatureListItem>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =============== Chapitre III — Finances =============== */}
        <section className="border-t border-[var(--hairline)] py-24 md:py-36 relative overflow-hidden">
          <div
            className="absolute -right-40 top-1/2 w-[520px] h-[420px] rounded-full bg-[var(--indigo)] opacity-[0.07] blur-[120px] pointer-events-none"
            aria-hidden
          />
          <div className="relative max-w-6xl mx-auto px-5 md:px-8">
            <ChapterHeader
              numeral="III"
              label="Finances"
              title={
                <>
                  Paiements &{" "}
                  <span className="font-serif-it font-normal text-[var(--lavender)]">
                    Facturation.
                  </span>
                </>
              }
            />

            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="inline-flex items-center gap-3 font-anno text-[10px] uppercase tracking-[0.28em] text-[var(--lavender)] mb-6">
                  <CreditCard size={14} className="text-[var(--indigo)]" />
                  Fig. 03 — Revenus
                </div>
                <p className="text-lg text-[var(--slate)] leading-relaxed mb-8">
                  Sécurisez vos revenus. Générez des liens de paiement (via
                  Stripe) et suivez vos rentrées d'argent directement depuis le
                  dashboard.
                </p>
                <ul className="space-y-4 mb-10">
                  <FeatureListItem>
                    Gestion des plans d'abonnement élèves
                  </FeatureListItem>
                  <FeatureListItem>Suivi du Chiffre d'Affaires</FeatureListItem>
                  <FeatureListItem>
                    Relances automatiques (Bientôt)
                  </FeatureListItem>
                </ul>
                <Magnetic strength={0.2} className="inline-block">
                  <Link
                    to="/features/pricing"
                    className="inline-flex items-center gap-2 border border-[var(--hairline)] text-[var(--mist)] font-semibold text-sm px-7 py-3 rounded-full hover:border-[var(--lavender)] hover:text-[var(--lavender)] transition-colors bg-[var(--ink)]/40"
                  >
                    Voir les tarifs <ArrowUpRight size={15} />
                  </Link>
                </Magnetic>
              </motion.div>

              {/* Planche — revenus */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              >
                <div className="relative border border-[var(--hairline)] rounded-2xl bg-[var(--ink)]/50 p-8 md:p-12 text-center hover:border-[var(--indigo)]/50 transition-colors">
                  <CornerTicks />
                  <div className="font-anno text-[11px] uppercase tracking-[0.28em] text-[var(--lavender)] mb-6">
                    Revenus ce mois
                  </div>
                  <div className="font-display text-6xl md:text-7xl text-[var(--mist)] mb-6">
                    <CountUp to={2450} />
                    <span className="text-[var(--lavender)]">€</span>
                  </div>
                  <div className="inline-flex items-center gap-2 font-anno text-[10px] uppercase tracking-[0.2em] text-[var(--lavender)] border border-[var(--indigo)]/40 bg-[var(--indigo)]/10 px-3.5 py-1.5 rounded-full">
                    <Activity size={13} className="text-[var(--indigo)]" />
                    +<CountUp to={12} suffix="%" /> vs M-1
                  </div>
                </div>
                <div className="font-anno text-[10px] uppercase tracking-[0.24em] text-[var(--slate)] text-center mt-5">
                  Planche 03 — Tableau de bord financier
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================= CTA final ============================= */}
        <FinalCta
          title={
            <>
              Faites passer votre coaching{" "}
              <span className="font-serif-it font-normal text-[var(--lavender)]">
                au niveau supérieur.
              </span>
            </>
          }
          sub="Essai gratuit de 14 jours. Sans carte bancaire, sans engagement."
        />
      </main>
      <BigFooter />
    </div>
  );
};
