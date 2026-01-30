import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Activity,
  Ruler,
  Target,
  Users,
  ArrowRight,
  Zap
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

// Improved Button Styles
export const primaryButtonClass = "group relative px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[position:100%_0] text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden";
export const secondaryButtonClass = (theme: string) => `px-6 py-3 rounded-xl border-2 font-bold transition-all hover:-translate-y-1 ${theme === 'dark' ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`;

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<null | string>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
      setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
    <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? theme === 'dark' 
              ? "bg-slate-950/80 border-slate-800/50 backdrop-blur-md" 
              : "bg-white/80 border-slate-200/50 backdrop-blur-md"
            : "bg-transparent border-transparent"
        }`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.svg" alt="MyTrackLy Logo" className="w-10 h-10 transition-transform group-hover:scale-110" />
              <span className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                MyTrackLy
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <div 
                onMouseEnter={() => setActiveDropdown("features")}
                className="relative h-20 flex items-center cursor-pointer"
              >
                <Link to="/#features" className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${activeDropdown === 'features' ? 'text-indigo-500' : 'opacity-70 hover:opacity-100 dark:text-white text-slate-900'}`}>Fonctionnalités</span>
                    <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'features' ? 'rotate-180 text-indigo-500' : 'opacity-70 dark:text-white text-slate-900'}`} />
                </Link>
              </div>

              <Link to="/features/coaching" className={`text-sm font-medium opacity-70 hover:opacity-100 hover:text-indigo-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Coachs</Link>
              <Link to="/features/pricing" className={`text-sm font-medium opacity-70 hover:opacity-100 hover:text-indigo-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Tarifs</Link>
              
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' 
                    ? "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800" 
                    : "bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-slate-200"
                }`}
              >
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className={`text-sm font-semibold transition-colors ${
                    theme === 'dark' ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-indigo-600"
                  }`}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className={primaryButtonClass.replace('px-6 py-3', 'px-5 py-2.5 text-sm')}
                >
                   <span className="relative z-10 flex items-center gap-2">
                     Essai gratuit
                   </span>
                </Link>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className={`flex items-center gap-4 lg:hidden relative z-50`}>
              <button 
                onClick={toggleTheme} 
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? "text-slate-400" : "text-slate-600"}`}
              >
                 {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {activeDropdown === "features" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setActiveDropdown("features")}
              onMouseLeave={() => setActiveDropdown(null)}
              className={`absolute top-20 left-0 w-full border-b backdrop-blur-xl shadow-2xl ${
                theme === 'dark' 
                  ? "bg-slate-950/95 border-slate-800" 
                  : "bg-white/95 border-slate-200"
              }`}
            >
              <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-4 gap-8">
                 <div className="col-span-1">
                    <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>MyTrackLy Features</h3>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Explorez toutes les capacités de votre nouvel assistant d'entraînement.</p>
                    <Link to="/register" className="text-indigo-500 text-sm font-semibold hover:text-indigo-400 flex items-center gap-1 group/link">
                       Commencer <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                 </div>
                 <div className="col-span-3 grid grid-cols-2 gap-4">
                    <MenuLink to="/features/tracking" icon={Activity} title="Suivi de Séances" desc="Enregistrez vos perfs & progression." theme={theme} />
                    <MenuLink to="/features/measurements" icon={Ruler} title="Mensurations & Poids" desc="Suivez l'évolution de votre physique." theme={theme} />
                    <MenuLink to="/features/habits" icon={Target} title="Habitudes & Objectifs" desc="Construisez une routine solide." theme={theme} />
                    <MenuLink to="/features/coaching" icon={Users} title="Pour les Coachs" desc="Gérez vos élèves et votre business." theme={theme} />
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.nav>
    
    {/* Mobile Drawer */}
    <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm p-6 shadow-2xl lg:hidden overflow-y-auto ${
                theme === 'dark' ? "bg-slate-950 border-l border-slate-800" : "bg-white border-l border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
                    <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Menu</span>
                 </div>
                 <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? "text-slate-400 hover:bg-slate-900 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Fonctionnalités</p>
                    <div className="space-y-4 pl-2">
                         <MobileNavLink onClick={() => setMobileMenuOpen(false)} to="/features/tracking" label="Suivi de Séances" icon={Activity} theme={theme} />
                         <MobileNavLink onClick={() => setMobileMenuOpen(false)} to="/features/measurements" label="Mensurations" icon={Ruler} theme={theme} />
                         <MobileNavLink onClick={() => setMobileMenuOpen(false)} to="/features/habits" label="Habitudes" icon={Target} theme={theme} />
                    </div>
                </div>

                <MobileNavLink onClick={() => setMobileMenuOpen(false)} to="/features/coaching" label="Espace Coach" icon={Users} theme={theme} />
                <MobileNavLink onClick={() => setMobileMenuOpen(false)} to="/features/pricing" label="Tarifs" icon={Zap} theme={theme} />
                
                <div className="mt-8 space-y-4">
                    <Link to="/login" className={`block text-center py-3 rounded-xl border font-bold ${theme === 'dark' ? "border-slate-800 text-white" : "border-slate-200 text-slate-900"}`}>
                        Se connecter
                    </Link>
                    <Link 
                        to="/register" 
                        className="block text-center py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20"
                    >
                        Commencer maintenant
                    </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const MenuLink = ({ to, icon: Icon, title, desc, theme }: any) => (
  <Link to={to} className={`flex items-start gap-4 p-3 rounded-xl group transition-colors ${theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-slate-50'}`}>
     <div className={`mt-1 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-900 text-indigo-400 group-hover:bg-indigo-500/20' : 'bg-slate-100 text-indigo-600 group-hover:bg-indigo-100'}`}>
        <Icon size={20} />
     </div>
     <div>
        <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</div>
        <div className={`text-sm ${theme === 'dark' ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-500'}`}>{desc}</div>
     </div>
  </Link>
);

const MobileNavLink = ({ to, label, onClick, icon: Icon, theme }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 text-lg font-medium transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-indigo-600'}`}
  >
    {Icon && <Icon size={20} />}
    {label}
  </Link>
);
