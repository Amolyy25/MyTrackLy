import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Activity,
  Target,
  Menu,
  X,
  ChevronDown,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";

interface MegaMenuItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  path?: string;
}

const menuCategories: { category: string; items: MegaMenuItem[] }[] = [
  {
    category: "Tracking",
    items: [
      {
        icon: <Dumbbell className="w-5 h-5" />,
        title: "Suivi de Séances",
        description: "Enregistrez chaque entraînement avec précision",
      },
      {
        icon: <Activity className="w-5 h-5" />,
        title: "Mensurations",
        description: "Suivez votre évolution corporelle",
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        title: "Progression",
        description: "Visualisez vos améliorations",
      },
    ],
  },
  {
    category: "Coaching",
    items: [
      {
        icon: <Users className="w-5 h-5" />,
        title: "Gestion d'Élèves",
        description: "Gérez jusqu'à 50+ clients",
      },
      {
        icon: <Calendar className="w-5 h-5" />,
        title: "Réservations",
        description: "Sync Google Calendar inclus",
      },
      {
        icon: <Sparkles className="w-5 h-5" />,
        title: "Programmes",
        description: "Créez des plans personnalisés",
      },
    ],
  },
  {
    category: "Insights",
    items: [
      {
        icon: <BarChart3 className="w-5 h-5" />,
        title: "Statistiques",
        description: "Analyses avancées",
      },
      {
        icon: <Target className="w-5 h-5" />,
        title: "Objectifs",
        description: "Définissez et atteignez vos buts",
      },
      {
        icon: <Zap className="w-5 h-5" />,
        title: "Habitudes",
        description: "Construisez des routines durables",
      },
    ],
  },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Animated Background Gradient Mesh */}
      <div className="fixed top-0 left-0 right-0 h-[400px] -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent" />
        <motion.div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -top-24 left-1/3 w-[300px] h-[300px] bg-violet-500/20 rounded-full blur-[80px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Sticky Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-md"
                  animate={{
                    opacity: isScrolled ? 0.3 : 0.6,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                MyTrackLy
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {/* Features with Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <motion.button
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors px-3 py-2"
                  whileHover={{ y: -1 }}
                >
                  Fonctionnalités
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isMegaMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                {/* Mega Menu */}
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px]"
                    >
                      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-indigo-500/20">
                        <div className="grid grid-cols-3 gap-4">
                          {menuCategories.map((category, catIdx) => (
                            <div key={catIdx}>
                              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                                {category.category}
                              </h4>
                              <div className="space-y-2">
                                {category.items.map((item, itemIdx) => (
                                  <motion.button
                                    key={itemIdx}
                                    className="w-full flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left group"
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                      setIsMegaMenuOpen(false);
                                      if (item.path) navigate(item.path);
                                    }}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors flex-shrink-0">
                                      {item.icon}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-white/90">
                                        {item.title}
                                      </p>
                                      <p className="text-xs text-white/50 mt-0.5">
                                        {item.description}
                                      </p>
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other Links */}
              <motion.button
                className="text-white/80 hover:text-white transition-colors px-3 py-2"
                whileHover={{ y: -1 }}
                onClick={() => navigate("/plans")}
              >
                Tarifs
              </motion.button>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <motion.button
                className="text-white/80 hover:text-white transition-colors px-4 py-2 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/login")}
              >
                <LogIn className="w-4 h-4" />
                Connexion
              </motion.button>
              <motion.button
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/register")}
              >
                <UserPlus className="w-4 h-4" />
                S'inscrire
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {menuCategories.map((category, catIdx) => (
                  <div key={catIdx}>
                    <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 px-3">
                      {category.category}
                    </h4>
                    {category.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all text-left"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (item.path) navigate(item.path);
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/90">
                            {item.title}
                          </p>
                          <p className="text-xs text-white/50">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
                <div className="border-t border-white/10 pt-4 mt-6">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white/80 hover:bg-white/5 transition-all mb-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/plans");
                    }}
                  >
                    Tarifs
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white/80 hover:bg-white/5 transition-all mb-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </button>
                  <button
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/register");
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    S'inscrire
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;