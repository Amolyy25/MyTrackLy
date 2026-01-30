import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ChevronRight,
  TrendingUp,
  BarChart3,
  Brain,
  Smartphone,
  CheckCircle2,
  Calendar,
  Zap,
  Users,
  Target,
  Plus,
  Dumbbell,
  Activity,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Navbar, primaryButtonClass, secondaryButtonClass } from "../../landing/Navbar";
import { Footer as FooterComponent } from "../../landing/Footer";

type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
};

type PricingPlan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  highlight?: boolean;
};

const LandingPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden selection:bg-indigo-500/30`}>
      <Navbar />

      <main>
        {/* Hero Section */}
        <HeroSection theme={theme} />

        {/* Features Grid */}
        <FeaturesSection theme={theme} />

        {/* Science/Benefits Section */}
        <ScienceSection theme={theme} />

        {/* Coaching Section */}
        <CoachingSection theme={theme} />

        {/* Pricing Section */}
        <PricingSection theme={theme} />
      </main>

      <FooterComponent />
    </div>
  );
};

// --- SECTIONS ---

const HeroSection = ({ theme }: { theme: string }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const yText = useTransform(scrollY, [0, 300], [0, 50]);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]);
  const scalePreview = useTransform(scrollY, [0, 1000], [1, 1.1]);

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 md:pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950/0 to-slate-950/0 opacity-60 dark:opacity-40" />
      <div className={`absolute inset-0 -z-20 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`} />
      
      {/* Grid Pattern */}
       <div className={`absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] pointer-events-none opacity-[0.03] ${theme === 'dark' ? 'bg-[url("https://grainy-gradients.vercel.app/noise.svg")]' : ''}`}
            style={{
                backgroundImage: `linear-gradient(${theme === 'dark' ? '#334155' : '#cbd5e1'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#334155' : '#cbd5e1'} 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
       />

      <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
           style={{ y: yText, opacity: opacityText }}
           className="flex flex-col items-center"
        >
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-500 dark:text-indigo-400 text-sm font-bold tracking-wide mb-10 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              MYTRACKLY 2.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              Dominez <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-600">
                votre potentiel.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`text-lg md:text-3xl max-w-3xl mx-auto mb-12 font-medium leading-normal ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
            >
              L'algorithme qui transforme vos efforts en résultats mesurables. 
              <span className="opacity-50 block md:inline"> Plus de guesswork. Juste de la science.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto items-center justify-center mb-20"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Commencer Gratuitement <ChevronRight size={20} />
              </Link>
              <Link
                to="/features/pricing"
                className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg border transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${theme === 'dark' ? 'border-slate-800 text-white hover:bg-slate-800' : 'border-slate-200 text-slate-900 hover:bg-slate-100'}`}
              >
                Voir la démo
              </Link>
            </motion.div>
        </motion.div>

        {/* Dashboard Preview / Parallax Element */}
        <motion.div
          style={{ y: y1, scale: scalePreview }}
          className="relative w-full max-w-6xl mx-auto rounded-2xl border border-slate-200/20 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/10 overflow-hidden bg-white dark:bg-slate-950 backdrop-blur-sm group select-none pointer-events-none"
        >
             <DashboardMockup theme={theme} />
             {/* Glass Reflection overlay */}
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

const DashboardMockup = ({ theme }: { theme: string }) => {
    const isDark = theme === 'dark';
    
    return (
        <div className={`w-full h-full flex flex-col font-sans ${isDark ? 'bg-slate-950' : 'bg-[#F8F9FC]'}`}>
            {/* Top Navigation Mockup */}
            <div className={`h-14 border-b flex items-center justify-between px-4 md:px-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="MyTrackLy Logo" className="w-8 h-8" />
                    <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>MyTrackLy</span>
                    <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider ml-2">Élève</span>
                </div>
                <div className="hidden md:flex items-center gap-6">
                     {["Accueil", "Séances", "Réservations", "Mensurations"].map((item, i) => (
                         <div key={item} className={`text-sm font-medium ${i === 0 ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
                             {item}
                         </div>
                     ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>T</div>
                    <span className={`hidden md:inline text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Thomas Pesquet</span>
                </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex flex-col md:block text-center md:text-left">
                     <div className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vendredi 30 Janvier 2026</div>
                     <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Bon après-midi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Thomas Pesquet</span>
                     </h2>
                     <p className={`text-base md:text-lg mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Continuez sur cette lancée, votre régularité paie !</p>
                     
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-6 mx-auto md:mx-0">
                        <TrendingUp size={14} /> 7 séances ce mois
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-sm">
                            <Plus size={18} /> Nouvelle séance
                        </button>
                        <button className={`px-6 py-3 rounded-xl font-bold border flex items-center justify-center gap-2 text-sm ${isDark ? 'border-slate-800 text-white bg-slate-900' : 'border-slate-200 bg-white text-slate-900'}`}>
                             Voir l'historique
                        </button>
                     </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatBox 
                        title="SÉANCES" 
                        value="7" 
                        sub="Ce mois-ci" 
                        theme={theme} 
                        rightElement={<div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600"><Activity size={20}/></div>}
                    />
                    <StatBox 
                        title="VOLUME TOTAL" 
                        value="3.0T" 
                        sub="Total soulevé" 
                        theme={theme} 
                        rightElement={<div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600"><BarChart3 size={20}/></div>}
                    />
                    <StatBox 
                        title="STREAK ACTUEL" 
                        value="3" 
                        unit="jours"
                        sub="Série actuelle" 
                        theme={theme} 
                        rightElement={<div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600"><Zap size={20}/></div>}
                        footer={
                            <div className="flex gap-1.5 mt-3">
                                {[true, true, true, false, false, false, false].map((active, i) => (
                                    <div key={i} className={`h-2.5 flex-1 rounded-full ${active ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                ))}
                            </div>
                        }
                    />
                    <StatBox 
                        title="OBJECTIF MENSUEL" 
                        value="60%" 
                        sub="Volume: 5 Tonnes" 
                        theme={theme} 
                        rightElement={<div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><Target size={20}/></div>}
                        footer={
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }} />
                            </div>
                        }
                    />
                </div>

                {/* Bottom Chart Mock */}
                <div className={`flex-1 rounded-2xl border p-6 flex flex-col justify-between overflow-hidden relative ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                     <div className="flex justify-between items-start relative z-10">
                        <div>
                            <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Statistiques détaillées</h3>
                            <p className="text-xs text-slate-500">Nombre de séances par semaine</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg border text-xs font-medium cursor-pointer flex items-center gap-1 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                            Séances par semaine <ChevronDown size={14} />
                        </div>
                     </div>
                     
                     {/* Corrected Chart Container to strictly contain the SVG */}
                     <div className="absolute bottom-0 left-0 right-0 h-40 w-full">
                         <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                              <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                                </linearGradient>
                              </defs>
                             <path d="M0,200 L0,150 Q250,50 500,100 T1000,80 L1000,200 Z" fill="url(#chartGradient)" />
                         </svg>
                     </div>
                </div>
            </div>
        </div>
    )
}

const StatBox = ({ title, value, unit, sub, theme, rightElement, footer, opacity = 1 }: any) => (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all hover:-translate-y-1 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} shadow-sm`} style={{ opacity }}>
        <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">{title}</span>
            {rightElement}
        </div>
        <div>
            <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{value}</span>
                {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{sub}</p>
            {footer}
        </div>
    </div>
)

const FeaturesSection = ({ theme }: { theme: string }) => {
  const features: Feature[] = [
    {
      icon: TrendingUp,
      title: "Volume Automatique",
      description: "Focus sur la perf. On s'occupe de calculer ton tonnage et tes stats.",
      color: "text-indigo-500",
    },
    {
      icon: BarChart3,
      title: "Suivi des PRs",
      description: "Tes records, tes graphiques d'évolution, tes 1RM. Tout est là.",
      color: "text-purple-500",
    },
    {
      icon: Zap,
      title: "Muscle Map",
      description: "Visualisation 3D des groupes musculaires travaillés. Équilibre ton physique.",
      color: "text-amber-500",
    },
    {
      icon: Brain,
      title: "Insights IA",
      description: "Des conseils personnalisés basés sur tes données pour exploser tes plateaux.",
      color: "text-emerald-500",
    },
    {
      icon: Calendar,
      title: "Planification",
      description: "L'outil le plus fluide pour créer tes semaines d'entraînement.",
      color: "text-blue-500",
    },
    {
      icon: Smartphone,
      title: "100% Mobile",
      description: "Pensé pour l'utilisation à une main, entre deux séries.",
      color: "text-rose-500",
    },
  ];

  return (
    <section id="features" className={`py-32 relative ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-20">
           <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
             Technologie <span className="text-indigo-500">Avancée</span>
           </h2>
           <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
             Exploite toutes les datas de tes entraînements.
           </p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} theme={theme} index={idx} />
            ))}
         </div>
       </div>
    </section>
  );
};

const FeatureCard = ({ feature, theme, index }: { feature: Feature, theme: string, index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={`p-8 rounded-2xl border transition-all duration-300 group ${
         theme === 'dark' 
           ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900' 
           : 'bg-slate-50 border-slate-200 hover:border-indigo-500/50 hover:bg-white shadow-sm hover:shadow-xl'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300 ${feature.color.replace('text-', 'bg-').replace('500', '500/10')}`}>
        <feature.icon className={`w-6 h-6 ${feature.color}`} />
      </div>
      <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {feature.title}
      </h3>
      <p className={`leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
        {feature.description}
      </p>
    </motion.div>
  );
};

const CoachingSection = ({ theme }: { theme: string }) => {
  return (
    <section id="coaching" className={`py-32 overflow-hidden ${theme === 'dark' ? 'bg-slate-900 relative' : 'bg-slate-50 relative'}`}>
       <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
         <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
               <Users size={16} />
               Espace Coach
            </div>
            <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Coaching 3.0
            </h2>
            <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Digitalise ton activité de coaching. Gagne du temps, scale ton business.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "Création de programmes en quelques clics",
                "Bibliothèque de 500+ exercices",
                "Sync Google Calendar & Réservations",
                "Paiements automatisés par Stripe",
                "CRM Clients complet"
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{item}</span>
                </motion.li>
              ))}
            </ul>

            <Link
              to="/features/coaching"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-lg shadow-purple-600/25"
            >
              Je suis Coach
            </Link>
         </div>

         <div className="relative">
             <div className={`relative z-10 rounded-2xl p-6 border shadow-2xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Agenda Collaboratif</h3>
                       <p className="text-sm text-slate-500">Mardi 24 Janvier</p>
                    </div>
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                       <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                   {[
                     { time: "09:00", name: "Séance Épaules - Thomas", type: "Coaching 1:1" },
                     { time: "11:30", name: "Bilan Mensuel - Sarah", type: "Visio" },
                     { time: "14:00", name: "Séance Jambes - Alex", type: "Coaching 1:1" },
                   ].map((slot, i) => (
                      <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border-l-4 border-purple-500 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                          <span className="text-sm font-bold text-slate-500">{slot.time}</span>
                          <div>
                             <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{slot.name}</p>
                             <p className="text-xs text-purple-600">{slot.type}</p>
                          </div>
                      </div>
                   ))}
                 </div>
             </div>
             <div className="absolute -top-10 -right-10 w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl z-0" />
         </div>
       </div>
    </section>
  );
};

const PricingSection = ({ theme }: { theme: string }) => {
  const plans: PricingPlan[] = [
    {
      name: "Personnel",
      price: "5€",
      period: "/mois",
      description: "L'essentiel pour progresser seul.",
      features: [
        "Carnet d'entraînement illimité",
        "Calcul du volume & PRs",
        "Suivi des mensurations",
        "Sans engagement"
      ],
      cta: "Essai gratuit 14j",
      highlight: false
    },
    {
      name: "Coach Pro",
      price: "50€",
      period: "/mois",
      description: "Pour les coachs qui veulent scaler.",
      features: [
        "Tout du plan Personnel",
        "Jusqu'à 50 élèves",
        "Programmes illimités",
        "Sync Calendrier & Paiements",
        "Support 24/7"
      ],
      cta: "Essai gratuit 14j",
      popular: true,
      highlight: true
    },
    {
      name: "Élève (Coaching)",
      price: "0€",
      description: "Inclus avec ton coaching.",
      features: [
        "Accès complet",
        "Programmes du coach",
        "Messagerie privée",
        "Suivi partagé"
      ],
      cta: "S'inscrire",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className={`py-32 relative ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'}`}>
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
           <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
             Tarifs <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Transparents</span>
           </h2>
           <p className={`text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
             Pas de frais cachés. Annulation en 1 clic.
           </p>
         </div>

         <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <PricingCard key={idx} plan={plan} theme={theme} />
            ))}
         </div>
       </div>
    </section>
  );
};

const PricingCard = ({ plan, theme }: { plan: PricingPlan, theme: string }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative rounded-3xl p-8 flex flex-col transition-all ${
        plan.highlight 
          ? `border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}` 
          : `border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
          Best Seller
        </div>
      )}

      <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
        {plan.period && <span className="text-slate-500">{plan.period}</span>}
      </div>
      <p className="text-sm text-slate-500 mb-8 max-w-[80%]">{plan.description}</p>

      <div className="space-y-4 mb-8 flex-grow">
        {plan.features.map((feat, i) => (
          <div key={i} className="flex items-start gap-3">
             <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
             <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{feat}</span>
          </div>
        ))}
      </div>

      <Link
        to="/register"
        className={`w-full py-3 rounded-xl font-bold text-center transition-all ${
          plan.highlight
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'
            : `border-2 ${theme === 'dark' ? 'border-slate-800 text-white hover:bg-slate-800' : 'border-slate-200 text-slate-900 hover:bg-slate-100'}`
        }`}
      >
        {plan.cta}
      </Link>
    </motion.div>
  );
};

const ScienceSection = ({ theme }: { theme: string }) => {
  return (
    <section className={`py-32 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-24"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-sm font-bold mb-6">
                    <Brain size={16} /> Neurosciences & Performance
                </div>
                <h2 className={`text-5xl md:text-7xl font-black tracking-tighter mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Plus qu'une app.<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Un hack biologique.</span>
                </h2>
                <p className={`text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    MyTrackLy ne se contente pas de stocker des chiffres. Elle est conçue pour exploiter les mécanismes psychologiques de la motivation humaine.
                </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-12 mb-16">
                <ScienceCard 
                    icon={Zap}
                    title="Circuit de la Dopamine"
                    desc="Valider une série déclenche une micro-récompense immédiate dans votre cerveau. Ce feedback positif crée une boucle d'habitude indestructible."
                    color="text-amber-500"
                    theme={theme}
                    delay={0}
                />
                <ScienceCard 
                    icon={TrendingUp}
                    title="Surcharge Progressive"
                    desc="L'hypertrophie requiert un stress mécanique croissant. Sans suivi précis, vous stagnez. Avec des données, vous forcez l'adaptation biologique."
                    color="text-indigo-500"
                    theme={theme}
                    delay={0.2}
                />
                <ScienceCard 
                    icon={Brain}
                    title="Charge Mentale Zéro"
                    desc="L'effort cognitif doit être dédié à l'exécution du mouvement, pas au calcul. L'externalisation de la mémoire permet une connexion Muscle-Cerveau maximale."
                    color="text-rose-500"
                    theme={theme}
                    delay={0.4}
                />
            </div>

            <div className="text-center">
                 <Link 
                    to="/features/science"
                    className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold border-2 transition-all hover:scale-105 ${theme === 'dark' ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-500/20 text-emerald-700 hover:bg-emerald-50'}`}
                 >
                    <Brain className="w-5 h-5" /> En savoir plus sur la science <ArrowRight className="w-4 h-4 ml-1" />
                 </Link>
            </div>
        </div>
    </section>
  )
}

const ScienceCard = ({ icon: Icon, title, desc, color, theme, delay }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            className="flex flex-col gap-6"
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900 shadow-2xl shadow-black/50' : 'bg-white shadow-xl shadow-slate-200'}`}>
                <Icon size={32} className={color} />
            </div>
            <div>
                <h3 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {desc}
                </p>
            </div>
        </motion.div>
    )
}

export default LandingPage;