import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Brain,
  Zap,
  TrendingUp,
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Repeat,
  ExternalLink
} from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Navbar, primaryButtonClass, secondaryButtonClass } from "../../landing/Navbar";
import { Footer } from "../../landing/Footer";

// --- Components ---

const SciencePage = () => {
    const { theme } = useTheme();
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden selection:bg-teal-500/30`}>
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 origin-left z-50"
                style={{ scaleX }}
            />

            <Navbar />

            <main className="pt-24">
                <HeroSection theme={theme} />
                <DopamineLoopSection theme={theme} />
                <SmallWinsSection theme={theme} />
                <FeaturesNeuroSection theme={theme} />
                <EvidenceSection theme={theme} />
                <SourcesSection theme={theme} />
                <CTASection theme={theme} />
            </main>

            <Footer />
        </div>
    );
};

const HeroSection = ({ theme }: { theme: string }) => {
    return (
        <section className="relative py-20 lg:py-32 overflow-hidden px-6">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-sm font-bold mb-8"
                >
                    <Brain size={16} />
                    <span>Neurosciences & Performance</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className={`text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                >
                    Le "Hack" Dopaminergique <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
                        de Votre Progression
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`text-xl md:text-2xl leading-relaxed mb-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
                >
                     La science révèle que chaque répétition enregistrée déclenche une réaction chimique. Ce n'est pas juste des données. C'est du carburant pour votre cerveau.
                </motion.p>
            </div>
        </section>
    );
};

const DopamineLoopSection = ({ theme }: { theme: string }) => {
    const [hoveredBox, setHoveredBox] = React.useState<number | null>(null);
    
    const steps = [
        { num: 1, title: "Signal", desc: "Vous ouvrez MyTrackLy avant l'effort.", icon: Zap, color: "amber" },
        { num: 2, title: "Action", desc: "Vous validez vos séries.", icon: Activity, color: "rose" },
        { num: 3, title: "Récompense", desc: "Feedback visuel immédiat & dopamine.", icon: Sparkles, color: "amber" },
        { num: 4, title: "Mémorisation", desc: "Votre cerveau renforce l'habitude.", icon: Repeat, color: "rose" },
    ];

    const boxes = [
        { id: 0, label: "Anticipation", icon: Zap, color: "teal", bgClass: "bg-teal-500/10 hover:bg-teal-500/20", textClass: "text-teal-500", borderClass: "border-teal-500/30" },
        { id: 1, label: "Encodage", icon: Brain, color: "indigo", bgClass: "bg-indigo-500/10 hover:bg-indigo-500/20", textClass: "text-indigo-500", borderClass: "border-indigo-500/30" },
        { id: 2, label: "Action", icon: Activity, color: "rose", bgClass: "bg-rose-500/10 hover:bg-rose-500/20", textClass: "text-rose-500", borderClass: "border-rose-500/30" },
        { id: 3, label: "Plaisir", icon: Sparkles, color: "amber", bgClass: "bg-amber-500/10 hover:bg-amber-500/20", textClass: "text-amber-500", borderClass: "border-amber-500/30" },
    ];

    return (
        <section className={`py-24 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
            <div className="max-w-6xl mx-auto px-6">
                 <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            Le Circuit de la Récompense
                        </h2>
                        <p className={`text-lg mb-8 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            La dopamine n'est pas seulement l'hormone du plaisir, c'est celle de la <strong>motivation</strong>.
                            <br/><br/>
                            Quand vous utilisez MyTrackLy, vous créez une boucle neurobiologique puissante.
                            Votre cerveau apprend à associer l'effort physique à une satisfaction immédiate grâce au feedback visuel.
                        </p>
                        
                        <div className="space-y-4">
                            {steps.map((step, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'} text-${step.color}-500`}>
                                        <step.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{step.title}</h4>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                         {/* Interactive Brain/Loop Visual */}
                         <div className={`aspect-square rounded-[2.5rem] p-6 border-2 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 to-slate-900 border-slate-800' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'} relative overflow-hidden shadow-2xl`}>
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent" />
                             <div className="grid grid-cols-2 gap-3 h-full relative z-10">
                                 {boxes.map((box, idx) => {
                                     const Icon = box.icon;
                                     const isHovered = hoveredBox === box.id;
                                     return (
                                         <motion.div
                                             key={box.id}
                                             onHoverStart={() => setHoveredBox(box.id)}
                                             onHoverEnd={() => setHoveredBox(null)}
                                             whileHover={{ scale: 1.05, y: -5 }}
                                             className={`${box.bgClass} rounded-2xl w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer border-2 transition-all duration-300 ${isHovered ? box.borderClass : 'border-transparent'} ${idx === 1 ? 'mt-6' : idx === 2 ? '-mt-6' : ''}`}
                                         >
                                              <motion.div
                                                  animate={{ 
                                                      scale: isHovered ? 1.2 : 1,
                                                      rotate: isHovered ? 5 : 0
                                                  }}
                                                  transition={{ type: "spring", stiffness: 300 }}
                                              >
                                                  <Icon className={`${box.textClass} w-12 h-12 mb-3`} />
                                              </motion.div>
                                              <span className={`font-bold text-sm ${box.textClass}`}>{box.label}</span>
                                         </motion.div>
                                     );
                                 })}
                             </div>
                         </div>
                    </div>
                 </div>
            </div>
        </section>
    );
}

const SmallWinsSection = ({ theme }: { theme: string }) => {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center mb-16">
                 <h2 className={`text-3xl md:text-5xl font-black mb-6 leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Le Pouvoir des <span className="text-teal-500">Small Wins</span>.
                 </h2>
                 <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Votre cerveau est plus sensible à la fréquence des récompenses qu'à leur taille. MyTrackLy transforme chaque série en victoire.
                 </p>
            </div>

            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                {[
                    { title: "Validation Visuelle", desc: "Cocher une case libère une micro-dose de dopamine immédiate." },
                    { title: "Sentiment de Maîtrise", desc: "Voir votre volume augmenter prouve votre compétence à vous-même." },
                    { title: "Aversion à la Perte", desc: "La 'Flamme' de série (Streak) exploite notre refus psychologique de briser la chaîne." }
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className={`p-8 rounded-3xl border text-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                    >
                         <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                         <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

const FeaturesNeuroSection = ({ theme }: { theme: string }) => {
    return (
        <section className={`py-24 ${theme === 'dark' ? 'bg-indigo-950/20' : 'bg-indigo-50'}`}>
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        {/* Placeholder for dashboard screenshot showing stats */}
                         <div className={`aspect-video w-full flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                             <BarChart3 className="text-indigo-500 w-32 h-32 opacity-20" />
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                             <p className="text-white font-medium">Un feedback visuel constant amplifie la motivation intrinsèque.</p>
                         </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                     <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        Amplificateur Neurobiologique
                     </h2>
                     <ul className="space-y-6">
                        {[
                            { feature: "Enregistrement de Séances", benefit: "Boucle de renforcement positive. L'action devient la récompense." },
                            { feature: "Courbes de Progression", benefit: "Estime de soi quantifiée. +75% de sentiment de compétence." },
                            { feature: "Habitudes & Streaks", benefit: "Automatisation du comportement via le Striatum (moins d'effort mental)." },
                            { feature: "Mode Focus", benefit: "Réduction de la charge cognitive. Zéro distraction." }
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500 shrink-0">
                                    <CheckCircle2 size={14} />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.feature}</h4>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.benefit}</p>
                                </div>
                            </li>
                        ))}
                     </ul>
                </div>
            </div>
        </section>
    )
}

const EvidenceSection = ({ theme }: { theme: string }) => {
    return (
        <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-500/20 bg-slate-500/10 text-slate-500 text-sm font-bold mb-8">
                    <Lock size={16} />
                    <span>Preuves Scientifiques</span>
                </div>
                <h2 className={`text-3xl font-bold mb-12 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Ce n'est pas de la magie, c'est de la biologie.
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Réduction de l'Anxiété</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Le tracking visuel active le système parasympathique en redonnant un sentiment de contrôle ("Je maîtrise mes résultats").</p>
                    </div>
                    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Efficacité Énergétique</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Après 66 jours, une habitude consomme 60% moins d'énergie mentale grâce au basculement vers les ganglions de la base.</p>
                    </div>
                     <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Estime de Soi</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>6 études sur 8 montrent une amélioration directe de la perception de soi liée à la visualisation des données personnelles.</p>
                    </div>
                     <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Motivation Intrinsèque</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>L'autodétermination est renforcée par la compétence visible. Vous ne vous entraînez plus pour les autres, mais pour voir VOS chiffres monter.</p>
                    </div>
                </div>

                <p className="mt-8 text-xs text-slate-500 text-center">
                    Sources: NIH Systematic Reviews (2021), Université de Genève (2025), Théorie de l'Autodétermination (Deci & Ryan).
                </p>
            </div>
        </section>
    )
}

const SourcesSection = ({ theme }: { theme: string }) => {
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

    return (
        <section className={`py-24 ${theme === 'dark' ? 'bg-slate-900/30' : 'bg-slate-100'}`}>
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 text-sm font-bold mb-6">
                        <Lock size={16} />
                        <span>Références Scientifiques</span>
                    </div>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        📚 Sources & Recherches
                    </h2>
                    <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Toutes les affirmations de cette page sont fondées sur des recherches scientifiques rigoureuses et des publications peer-reviewed.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {sources.map((source, i) => (
                        <motion.a
                            key={i}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -3 }}
                            className={`group p-5 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50'}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h4 className={`font-bold mb-2 group-hover:text-indigo-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        {source.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className={`px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                            {source.institution}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                                            {source.year}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {source.type}
                                        </span>
                                    </div>
                                </div>
                                <ExternalLink className={`w-5 h-5 shrink-0 opacity-50 group-hover:opacity-100 group-hover:text-indigo-500 transition-all ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                            </div>
                        </motion.a>
                    ))}
                </div>

                <div className={`mt-12 p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <p className={`text-sm text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <strong>Note méthodologique :</strong> Cette page synthétise des recherches en neurosciences, psychologie comportementale, et sciences du sport. 
                        Les affirmations quantitatives (ex: "75% d'amélioration") proviennent d'études citées. MyTrackLy est un outil de fitness, pas un dispositif médical.
                    </p>
                </div>
            </div>
        </section>
    );
}

const CTASection = ({ theme }: { theme: string }) => {
    return (
        <section className={`py-32 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-900 text-white'}`}>
             <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-indigo-900/40" />
             <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
                 <h2 className="text-4xl md:text-6xl font-black mb-8">
                    Hacker Votre Cerveau.<br/>Transformer Votre Corps.
                 </h2>
                 <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                     Rejoignez les athlètes qui utilisent la science de la dopamine pour rendre leur succès inévitable.
                 </p>
                 <Link 
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full bg-white text-slate-900 hover:bg-teal-50 hover:scale-105 transition-all shadow-xl shadow-white/10"
                >
                    Commencer l'Essai Gratuit 14 jours <ArrowRight className="ml-2" />
                </Link>
                <p className="mt-4 text-sm text-slate-400">Pas de carte requise. Annulation instantanée.</p>
             </div>
        </section>
    )
}

export default SciencePage;
