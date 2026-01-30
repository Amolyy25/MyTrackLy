import React, { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { Navbar, primaryButtonClass } from "../../landing/Navbar";
import { Footer } from "../../landing/Footer";
import { Activity, Zap, TrendingUp, Calendar, ArrowRight, X, Dumbbell, Clock, MessageSquare, Plus, Trash2, ChevronUp, ChevronDown, Hash, Weight, Timer, Library, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// --- Demo Components (Simplified & Stylized) ---

export const TrackingPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden selection:bg-indigo-500/30`}>
      <Navbar />
      
      <main className="pt-20">
         {/* Hero */}
         <section className="relative py-20 lg:py-32 overflow-hidden">
             <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-slate-950/0 to-slate-950/0 opacity-40" />
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 text-sm font-medium mb-6"
                 >
                    <Activity size={16} /> Suivi de Séances
                 </motion.div>
                 
                 <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Ne laissez aucun record <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">au hasard</span>.
                 </h1>
                 
                 <p className={`text-xl max-w-2xl mx-auto mb-10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    L'interface de saisie la plus rapide du marché. Conçue pour être utilisée entre deux séries, sans friction.
                    <br/><span className="text-sm italic opacity-70">(Essayez l'interface interactive ci-dessous 👇)</span>
                 </p>
                 
                 <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-slate-900/50 aspect-video group">
                     <img 
                        src="/Pasted Graphic.jpg.jpeg" 
                        alt="Interface de l'application" 
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
                 </div>
                 
                 <div className="mt-20 text-left relative mx-auto max-w-4xl">
                     <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl opacity-50 -z-10 rounded-[3rem]" />
                     <DemoSessionTracker theme={theme} />
                 </div>
             </div>
         </section>

         {/* Detailed Features */}
         <section className={`py-20 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
                <FeatureDetail 
                   icon={Zap}
                   title="Saisie Instantanée"
                   desc="Remplissez vos reps et poids en quelques taps. Le système se souvient de vos dernières perfs."
                   theme={theme}
                />
                <FeatureDetail 
                   icon={TrendingUp}
                   title="Volume & Intensité"
                   desc="Calcul automatique du tonnage total et de l'intensité relative de chaque séance."
                   theme={theme}
                />
                <FeatureDetail 
                   icon={Calendar}
                   title="Historique Complet"
                   desc="Retrouvez n'importe quelle séance passée en un clin d'œil grâce aux filtres avancés."
                   theme={theme}
                />
            </div>
         </section>
         
         {/* CTA */}
         <section className="py-20 text-center">
             <div className="max-w-3xl mx-auto px-4">
                 <h2 className="text-3xl font-bold mb-6">Prêt à tracker sérieusement ?</h2>
                 <Link to="/register" className={primaryButtonClass.replace('from-indigo-600 via-purple-600 to-indigo-600', 'from-indigo-600 via-indigo-500 to-indigo-600')}>
                     Commencer l'essai gratuit <ArrowRight size={20} className="inline ml-2"/>
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
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
    </div>
)

// --- Demo Interactive Component ---

const DemoSessionTracker = ({ theme }: { theme: string }) => {
    // Basic types for local state (mocking the real data structure)
    type RepsType = "uniform" | "variable";
    type Exercise = {
        id: number;
        name: string;
        sets: number;
        repsType: RepsType;
        repsUniform: number;
        repsPerSet: number[]; // Array of reps per set
        weight: number;
        rest: number;
        expanded: boolean;
    };

    // Initial state with some dummy data suitable for a demo
    const [exercises, setExercises] = useState<Exercise[]>([
        { id: 1, name: "Développé Couché", sets: 3, repsType: "uniform", repsUniform: 10, repsPerSet: [10, 10, 10], weight: 80, rest: 90, expanded: true },
        { id: 2, name: "Squat", sets: 4, repsType: "uniform", repsUniform: 8, repsPerSet: [8, 8, 8, 8], weight: 100, rest: 120, expanded: false }
    ]);
    const [showSelector, setShowSelector] = useState(false);
    const [customExerciseName, setCustomExerciseName] = useState("");
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Helpers to manage state
    const updateExercise = (id: number, field: keyof Exercise, value: any) => {
        setExercises(exercises.map(ex => {
            if (ex.id !== id) return ex;
            
            // Logic specific to changing Sets
            if (field === "sets") {
                const newSets = parseInt(value) || 1;
                let newRepsPerSet = [...ex.repsPerSet];
                if (newSets > ex.repsPerSet.length) {
                    // Add sets, copy last known rep count or use uniform
                    const setsToAdd = newSets - ex.repsPerSet.length;
                    const filler = ex.repsType === "uniform" ? ex.repsUniform : (ex.repsPerSet[ex.repsPerSet.length - 1] || 10);
                    newRepsPerSet = [...newRepsPerSet, ...Array(setsToAdd).fill(filler)];
                } else {
                    // Truncate sets
                    newRepsPerSet = newRepsPerSet.slice(0, newSets);
                }
                return { ...ex, sets: newSets, repsPerSet: newRepsPerSet };
            }

            // Logic for RepsType toggle
            if (field === "repsType") {
                if (value === "uniform") {
                    // Switching to uniform: reset array to match uniform value
                    return { ...ex, repsType: value, repsPerSet: Array(ex.sets).fill(ex.repsUniform) };
                } else {
                    // Switching to variable: initialize array with uniform value
                    return { ...ex, repsType: value, repsPerSet: Array(ex.sets).fill(ex.repsUniform) };
                }
            }

            return { ...ex, [field]: value };
        }));
    };

    const updateRepsPerSet = (id: number, setIndex: number, value: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id !== id) return ex;
            const newRepsPerSet = [...ex.repsPerSet];
            newRepsPerSet[setIndex] = parseInt(value) || 0;
            return { ...ex, repsPerSet: newRepsPerSet };
        }));
    };

    const addExercise = (name: string) => {
        setExercises([...exercises, { 
            id: Date.now(), 
            name, 
            sets: 3, 
            repsType: "uniform",
            repsUniform: 10,
            repsPerSet: [10, 10, 10], 
            weight: 60, 
            rest: 90, 
            expanded: true 
        }]);
        setShowSelector(false);
        setCustomExerciseName("");
        setShowCustomForm(false);
    }

    const removeExercise = (id: number) => {
        setExercises(exercises.filter(e => e.id !== id));
    }

    const toggleExpand = (id: number) => {
        setExercises(exercises.map(e => e.id === id ? { ...e, expanded: !e.expanded } : e));
    }

    const calculateTotalVolume = () => {
        return exercises.reduce((acc, ex) => {
            const reps = ex.repsType === "uniform" 
                ? ex.sets * ex.repsUniform 
                : ex.repsPerSet.reduce((a, b) => a + b, 0);
            return acc + (reps * ex.weight);
        }, 0);
    }

    // Render Success View
    if (isSaved) {
        return (
            <div className={`p-8 md:p-12 text-center rounded-2xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-xl'}`}>
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                >
                    <CheckCircle2 size={40} className="text-white" />
                </motion.div>
                <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Séance Enregistrée ! 🔥</h2>
                <p className={`text-lg max-w-lg mx-auto mb-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    Bravo ! Vous avez soulevé un total de <span className="font-bold text-indigo-500">{calculateTotalVolume().toLocaleString()} kg</span> aujourd'hui.
                    La régularité est la clé de la réussite. Continuez comme ça !
                </p>
                <div className="flex justify-center gap-4">
                     <button onClick={() => setIsSaved(false)} className={`px-6 py-3 rounded-xl font-bold border transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        Modifier
                     </button>
                     <Link to="/register" className={primaryButtonClass}>
                        Créer mon compte
                     </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`p-6 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
             <div className="flex items-center justify-between mb-6">
                 <div>
                     <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Dumbbell size={20}/></div>
                        Nouvelle séance (Démo)
                     </h2>
                     <p className="text-sm text-slate-500 ml-11">Aujourd'hui, {new Date().toLocaleDateString('fr-FR')}</p>
                 </div>
                 <div title="Annuler (Démo)" className="p-2 bg-red-500/10 text-red-500 rounded-lg cursor-not-allowed opacity-50"><X size={20}/></div>
             </div>

             <div className="space-y-4">
                 {exercises.map((ex, idx) => (
                     <div key={ex.id} className={`rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                         <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(ex.id)}>
                             <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-sm">{idx + 1}</div>
                                 <div>
                                     <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{ex.name}</h3>
                                     <p className="text-xs text-slate-500">
                                         {ex.sets} séries • {ex.repsType === 'uniform' ? ex.repsUniform : 'Variable'} reps • {ex.weight} kg
                                     </p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded transition-colors" onClick={(e) => { e.stopPropagation(); removeExercise(ex.id) }}><Trash2 size={16}/></button>
                                {ex.expanded ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
                             </div>
                         </div>
                         
                         <AnimatePresence>
                             {ex.expanded && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-4"
                                >
                                    {/* Main Inputs */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Poids (kg)</label>
                                            <div className="relative group">
                                                <input 
                                                    type="number" 
                                                    value={ex.weight} 
                                                    onChange={(e) => updateExercise(ex.id, "weight", e.target.value)}
                                                    className={`w-full px-3 py-2.5 rounded-xl border-0 ring-1 ring-inset transition-all text-lg font-semibold ${theme === 'dark' ? 'bg-slate-800 ring-slate-700 text-white focus:ring-indigo-500' : 'bg-slate-50 ring-slate-200 text-slate-900 focus:ring-indigo-500'}`} 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Séries</label>
                                            <div className="relative group">
                                                <input 
                                                    type="number" 
                                                    value={ex.sets} 
                                                    onChange={(e) => updateExercise(ex.id, "sets", e.target.value)}
                                                    className={`w-full px-3 py-2.5 rounded-xl border-0 ring-1 ring-inset transition-all text-lg font-semibold ${theme === 'dark' ? 'bg-slate-800 ring-slate-700 text-white focus:ring-indigo-500' : 'bg-slate-50 ring-slate-200 text-slate-900 focus:ring-indigo-500'}`} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reps Configuration */}
                                    <div className={`p-1 rounded-xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
                                        <div className="flex p-1 gap-1 mb-2">
                                            <button 
                                                onClick={() => updateExercise(ex.id, "repsType", "uniform")}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${ex.repsType === 'uniform' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                            >
                                                Uniforme
                                            </button>
                                            <button 
                                                onClick={() => updateExercise(ex.id, "repsType", "variable")}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${ex.repsType === 'variable' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                            >
                                                Variable
                                            </button>
                                        </div>

                                        <div className="px-1 pb-1">
                                             <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 pl-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Répétitions</label>
                                             {ex.repsType === 'uniform' ? (
                                                 <input 
                                                    type="number" 
                                                    value={ex.repsUniform} 
                                                    onChange={(e) => updateExercise(ex.id, "repsUniform", e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-lg text-center font-bold tracking-tight border-0 ring-1 ring-inset ${theme === 'dark' ? 'bg-slate-800 ring-slate-700 text-white focus:ring-indigo-500' : 'bg-white ring-slate-200 text-slate-900 focus:ring-indigo-500'}`}
                                                 />
                                             ) : (
                                                <div className="grid grid-cols-6 gap-2">
                                                    {ex.repsPerSet.map((reps, i) => (
                                                        <div key={i}>
                                                            <input 
                                                                type="number"
                                                                value={reps}
                                                                onChange={(e) => updateRepsPerSet(ex.id, i, e.target.value)}
                                                                className={`w-full px-1 py-2 text-center text-sm font-bold rounded-lg border-0 ring-1 ring-inset ${theme === 'dark' ? 'bg-slate-800 ring-slate-700 text-white focus:ring-indigo-500' : 'bg-white ring-slate-200 text-slate-900 focus:ring-indigo-500'}`}
                                                            />
                                                            <div className="text-[9px] text-center mt-1 text-slate-400">S{i+1}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                             )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                         <Clock size={16} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                                         <label className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Repos :</label>
                                         <div className="flex flex-1 items-center gap-2">
                                            <input 
                                                type="number" 
                                                value={ex.rest} 
                                                onChange={(e) => updateExercise(ex.id, "rest", e.target.value)}
                                                className={`w-20 px-2 py-1 text-sm font-bold rounded-lg border-0 ring-1 ring-inset ${theme === 'dark' ? 'bg-slate-800 ring-slate-700 text-white' : 'bg-white ring-slate-200 text-slate-900'}`}
                                            />
                                            <span className="text-xs text-slate-500">secondes</span>
                                         </div>
                                    </div>

                                </motion.div>
                             )}
                         </AnimatePresence>
                     </div>
                 ))}
             </div>

             {/* Add Button */}
             {!showSelector ? (
                <button 
                    onClick={() => setShowSelector(true)}
                    className={`mt-4 w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-slate-900' : 'border-slate-200 text-slate-500 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
                >
                    <Plus size={20} /> Ajouter un exercice
                </button>
             ) : (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-xl border shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                     <div className="flex justify-between items-center mb-4">
                         <div className="flex gap-2">
                             <button onClick={() => setShowCustomForm(false)} className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${!showCustomForm ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Bibliothèque</button>
                             <button onClick={() => setShowCustomForm(true)} className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${showCustomForm ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Personnalisé</button>
                         </div>
                         <button onClick={() => { setShowSelector(false); setShowCustomForm(false); }}><X size={20} className="text-slate-400"/></button>
                     </div>
                     
                     {showCustomForm ? (
                         <div className="flex gap-2">
                             <input 
                                type="text" 
                                placeholder="Nom de votre exercice..." 
                                value={customExerciseName}
                                onChange={(e) => setCustomExerciseName(e.target.value)}
                                className={`flex-1 p-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && customExerciseName && addExercise(customExerciseName)}
                             />
                             <button 
                                disabled={!customExerciseName}
                                onClick={() => addExercise(customExerciseName)}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 Ajouter
                             </button>
                         </div>
                     ) : (
                        <div className="grid gap-2">
                            {["Tractions", "Soulevé de Terre", "Rowing Barre", "Dips", "Curl Biceps"].map(name => (
                                <button key={name} onClick={() => addExercise(name)} className={`p-3 text-left rounded-lg transition-colors flex justify-between items-center group ${theme === 'dark' ? 'hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-400' : 'hover:bg-indigo-50 text-slate-600 hover:text-indigo-600'}`}>
                                    {name}
                                    <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                     )}
                 </motion.div>
             )}

             {/* Bottom Summary & Save */}
             <div className="mt-8 flex gap-4">
                 <div className={`flex-1 p-4 rounded-xl flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                     <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Volume</span>
                     <span className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{calculateTotalVolume().toLocaleString()} kg</span>
                 </div>
                 <button 
                    onClick={() => setIsSaved(true)}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                 >
                     Enregistrer la séance
                 </button>
             </div>
        </div>
    )
}
