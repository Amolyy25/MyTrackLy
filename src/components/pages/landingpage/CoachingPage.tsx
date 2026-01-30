import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Navbar, primaryButtonClass, secondaryButtonClass } from "../../landing/Navbar";
import { Footer } from "../../landing/Footer";
import { Users, Calendar, MessageSquare, CreditCard, ArrowRight, Activity, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const CoachingPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden selection:bg-blue-500/30`}>
      <Navbar />
      
      <main className="pt-20">
         {/* Hero */}
         <section className="relative py-20 lg:py-32 overflow-hidden">
             <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-slate-950/0 to-slate-950/0 opacity-40" />
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-sm font-medium mb-6"
                 >
                    <Users size={16} /> Espace Coach
                 </motion.div>
                 
                 <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Gérez et scalez votre <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">business de coaching</span>.
                 </h1>
                 
                 <p className={`text-xl max-w-2xl mx-auto mb-10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Centralisez vos élèves, programmes, paiements et votre calendrier. L'outil professionnel tout-en-un pour les coachs modernes.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register?role=coach" className={primaryButtonClass.replace('from-indigo-600 via-purple-600 to-indigo-600', 'from-blue-600 via-cyan-600 to-blue-600')}>
                        Essai Coach Gratuit (14j)
                    </Link>
                    <Link to="/features/pricing" className={secondaryButtonClass(theme)}>
                        Voir les tarifs
                    </Link>
                 </div>
             </div>
         </section>

         {/* Detailed Features */}
         <section className={`py-20 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 space-y-24">
                {/* Feature 1: Student Management */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6">
                            <Users size={24} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Gestion de Parc Élèves</h2>
                        <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            Accédez à une liste exhaustive de tous vos élèves. Consultez leurs profils, leurs dernières séances et leurs mensurations en un clic.
                        </p>
                        <ul className="space-y-3">
                            <FeatureListItem theme={theme}>Assignation de programmes personnalisés</FeatureListItem>
                            <FeatureListItem theme={theme}>Feedback correctionnel sur les séances</FeatureListItem>
                            <FeatureListItem theme={theme}>Suivi de l'évolution du poids et des photos</FeatureListItem>
                        </ul>
                    </div>
                    <div className={`p-8 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} shadow-xl`}>
                         {/* Mock UI Student List */}
                         <div className="space-y-4">
                             <div className="flex justify-between items-center mb-4">
                                 <h4 className="font-bold">Mes Élèves (12)</h4>
                                 <div className="text-sm text-blue-500 cursor-pointer">Voir tout</div>
                             </div>
                             {[1, 2, 3].map((i) => (
                                 <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
                                     <div className="flex-1">
                                         <div className="font-semibold text-sm">Thomas {String.fromCharCode(64+i)}.</div>
                                         <div className="text-xs text-slate-500">Dernière séance: Hier</div>
                                     </div>
                                     <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold">Actif</div>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>

                {/* Feature 2: Calendar & Planning */}
                <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
                    <div className="md:order-2">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-6">
                            <Calendar size={24} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Planning & Synchronisation</h2>
                        <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            Organisez vos semaines de coaching sans friction. Synchronisation bidirectionnelle avec Google Calendar pour éviter les doublons.
                        </p>
                        <ul className="space-y-3">
                            <FeatureListItem theme={theme}>Définition de vos disponibilités hebdomadaires</FeatureListItem>
                            <FeatureListItem theme={theme}>Système de réservation pour les élèves</FeatureListItem>
                            <FeatureListItem theme={theme}>Notifications automatiques (Email)</FeatureListItem>
                        </ul>
                    </div>
                     <div className={` md:order-1 p-8 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} shadow-xl relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Calendar size={120} />
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className={`p-4 rounded-xl border-l-4 border-purple-500 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">09:00 - 10:00</span>
                                    <span className="text-purple-500 font-medium">Coaching 1:1</span>
                                </div>
                                <div className="text-slate-500 text-sm">Séance Pecs avec Alex</div>
                            </div>
                            <div className={`p-4 rounded-xl border-l-4 border-blue-500 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold">11:30 - 12:00</span>
                                    <span className="text-blue-500 font-medium">Bilan Visio</span>
                                </div>
                                <div className="text-slate-500 text-sm">Point mensuel avec Sarah</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 3: Finance */}
                 <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-6">
                            <CreditCard size={24} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Paiements & Facturation</h2>
                        <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            Sécurisez vos revenus. Générez des liens de paiement (via Stripe) et suivez vos rentrées d'argent directement depuis le dashboard.
                        </p>
                         <ul className="space-y-3">
                            <FeatureListItem theme={theme}>Gestion des plans d'abonnement élèves</FeatureListItem>
                            <FeatureListItem theme={theme}>Suivi du Chiffre d'Affaires</FeatureListItem>
                            <FeatureListItem theme={theme}>Relances automatiques (Bientôt)</FeatureListItem>
                        </ul>
                    </div>
                     <div className={`p-8 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} shadow-xl flex items-center justify-center`}>
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">Revenus ce mois</h3>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-400 mb-2">2 450€</div>
                            <div className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-sm font-bold">
                                <Activity size={14} /> +12% vs M-1
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </section>
      </main>

      <Footer />
    </div>
  );
}

const FeatureListItem = ({ children, theme }: any) => (
    <li className="flex items-center gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />
        </div>
        <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{children}</span>
    </li>
);
