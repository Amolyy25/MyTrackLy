import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Navbar, primaryButtonClass } from "../../landing/Navbar";
import { Footer } from "../../landing/Footer";
import { Ruler, LineChart as LineChartIcon, Camera, Target, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const data = [
  { name: 'Jan', weight: 82.5, bodyFat: 18 },
  { name: 'Fév', weight: 81.8, bodyFat: 17.5 },
  { name: 'Mar', weight: 81.2, bodyFat: 17 },
  { name: 'Avr', weight: 80.5, bodyFat: 16.2 },
  { name: 'Mai', weight: 79.8, bodyFat: 15.5 },
  { name: 'Juin', weight: 79.0, bodyFat: 14.8 },
  { name: 'Juil', weight: 78.5, bodyFat: 14.2 },
];

export const MeasurementsPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden selection:bg-purple-500/30`}>
      <Navbar />
      
      <main className="pt-20">
         {/* Hero */}
         <section className="relative py-20 lg:py-32 overflow-hidden">
             <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-slate-950/0 to-slate-950/0 opacity-40" />
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-500 text-sm font-medium mb-6"
                 >
                    <Ruler size={16} /> Mensurations & Métriques
                 </motion.div>
                 
                 <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Visualisez votre <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">transformation</span>.
                 </h1>
                 
                 <p className={`text-xl max-w-2xl mx-auto mb-10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Au delà du poids sur la balance. Suivez l'évolution de chaque groupe musculaire avec précision.
                 </p>
                 
                 <div className="relative mx-auto max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
                     {/* Interactive Chart Demo */}
                     <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`p-6 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}
                     >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Évolution du Poids</h3>
                                <p className="text-sm text-slate-500">-4.0 kg sur 6 mois</p>
                            </div>
                            <div className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm font-bold">-4.8%</div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        domain={['dataMin - 1', 'dataMax + 1']} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                            borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                                            borderRadius: '8px',
                                            color: theme === 'dark' ? '#fff' : '#000'
                                        }}
                                        itemStyle={{ color: '#8b5cf6' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="weight" 
                                        stroke="#8b5cf6" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorWeight)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                     </motion.div>

                     {/* Stats Cards Demo */}
                     <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 gap-4"
                     >
                        <MetricCard theme={theme} label="Tour de Taille" value="78 cm" change="-2.5 cm" positive={true} />
                        <MetricCard theme={theme} label="Tour de Bras" value="42 cm" change="+1.2 cm" positive={true} />
                        <MetricCard theme={theme} label="Body Fat" value="14.2%" change="-3.8%" positive={true} />
                        <MetricCard theme={theme} label="Poids" value="78.5 kg" change="-4.0 kg" positive={true} />
                     </motion.div>
                 </div>
             </div>
         </section>

         {/* Detailed Features */}
         <section className={`py-20 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
                <FeatureDetail 
                   icon={LineChartIcon}
                   title="Graphiques Intuitifs"
                   desc="Voyez d'un coup d'œil vos tendances de poids et de mensurations sur la durée."
                   theme={theme}
                />
                <FeatureDetail 
                   icon={Camera}
                   title="Photos Avant/Après"
                   desc="Stockez vos photos de progrès de manière sécurisée et comparez votre évolution."
                   theme={theme}
                />
                <FeatureDetail 
                   icon={Target}
                   title="Objectifs Intelligents"
                   desc="Définissez des cibles de poids ou de taille et suivez votre chemin vers l'objectif."
                   theme={theme}
                />
            </div>
         </section>
         
         {/* CTA */}
         <section className="py-20 text-center">
             <div className="max-w-3xl mx-auto px-4">
                 <h2 className="text-3xl font-bold mb-6">Votre corps change, mesurez-le.</h2>
                 <Link to="/register" className={primaryButtonClass.replace('from-indigo-600 via-purple-600 to-indigo-600', 'from-purple-600 via-pink-600 to-purple-600')}>
                     Commencer maintenant <ArrowRight size={20} className="inline ml-2" />
                 </Link>
             </div>
         </section>
      </main>

      <Footer />
    </div>
  );
}

const MetricCard = ({ theme, label, value, change, positive }: any) => (
    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-lg'}`}>
        <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <div className="flex items-end justify-between">
            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{value}</span>
            <span className={`text-sm font-bold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>{change}</span>
        </div>
    </div>
);

const FeatureDetail = ({icon: Icon, title, desc, theme}: any) => (
    <div className="flex flex-col gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
    </div>
)
