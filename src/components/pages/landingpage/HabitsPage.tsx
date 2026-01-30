import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Navbar, primaryButtonClass } from "../../landing/Navbar";
import { Footer } from "../../landing/Footer";
import { Target, CheckCircle2, Flame, CalendarRange, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const HabitsPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden selection:bg-emerald-500/30`}>
      <Navbar />
      
      <main className="pt-20">
         {/* Hero */}
         <section className="relative py-20 lg:py-32 overflow-hidden">
             <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-slate-950/0 to-slate-950/0 opacity-40" />
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-6"
                 >
                    <Target size={16} /> Habitudes & Discipline
                 </motion.div>
                 
                 <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    La consistance est la <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500">clé du succès</span>.
                 </h1>
                 
                 <p className={`text-xl max-w-2xl mx-auto mb-10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Construisez une discipline de fer avec notre tracker d'habitudes intégré. Sommeil, Nutrition, Hydratation, tout compte.
                 </p>
                 
                 <div className="relative mx-auto max-w-3xl">
                     <div className="p-6 rounded-2xl bg-slate-900/50 border border-emerald-500/20 shadow-2xl backdrop-blur-sm">
                         {/* Mockup of Habit Tracker */}
                         <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 rounded bg-emerald-500/20 text-emerald-500"><Target size={20}/></div>
                                 <div className="text-left">
                                     <div className="font-bold text-white">Boire 3L d'eau</div>
                                     <div className="text-xs text-slate-400">Objectif quotidien</div>
                                 </div>
                             </div>
                             <div className="text-emerald-500 font-bold">5/7 jours</div>
                         </div>
                         <div className="flex gap-2 justify-between">
                             {[1,1,1,1,0,1,0].map((s, i) => (
                                 <div key={i} className={`h-10 flex-1 rounded-md flex items-center justify-center ${s ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-slate-600'}`}>
                                     <CheckCircle2 size={16} />
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
         </section>

         {/* Detailed Features */}
         <section className={`py-20 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
                <FeatureDetail 
                   icon={Flame}
                   title="Suivi de Streaks"
                   desc="Maintenez la flamme allumée. Visualisez vos séries de jours réussis pour rester motivé."
                   theme={theme}
                />
                <FeatureDetail 
                   icon={CalendarRange}
                   title="Heatmap GitHub-style"
                   desc="Une vue globale de votre année. Remplissez chaque case verte pour une année productive."
                   theme={theme}
                />
                <FeatureDetail 
                   icon={CheckCircle2}
                   title="Routines Flexibles"
                   desc="Configurez des habitudes quotidiennes, hebdomadaires ou mensuelles selon vos besoins."
                   theme={theme}
                />
            </div>
         </section>
         
         {/* CTA */}
         <section className="py-20 text-center">
             <div className="max-w-3xl mx-auto px-4">
                 <h2 className="text-3xl font-bold mb-6">Installez de bonnes habitudes.</h2>
                 <Link to="/register" className={primaryButtonClass.replace('from-indigo-600 via-purple-600 to-indigo-600', 'from-emerald-600 via-green-600 to-emerald-600')}>
                     Créer ma routine <ArrowRight size={20} className="inline ml-2"/>
                 </Link>
             </div>
         </section>
      </main>

      <Footer />
    </div>
  );
}

const FeatureDetail = ({icon: Icon, title, desc, theme}: any) => (
    <div className="flex flex-col gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
    </div>
)
