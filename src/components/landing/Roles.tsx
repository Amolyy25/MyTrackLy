import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Users, TrendingUp, Zap, Check, X } from "lucide-react";

const Roles: React.FC = () => {
  const [activeRole, setActiveRole] = useState<"athlete" | "coach">("athlete");

  const roles = {
    athlete: {
      title: "Pour le Sportif",
      subtitle: "Suivez vos performances et atteignez vos objectifs",
      features: [
        { icon: Dumbbell, text: "Suivi complet de vos séances" },
        { icon: TrendingUp, text: "Graphiques de progression détaillés" },
        { icon: Zap, text: "Objectifs personnalisés avec rappels" },
        { icon: Check, text: "Historique illimité de vos données" },
        { icon: Check, text: "Mensurations et photos avant/après" },
        { icon: Check, text: "Accès mobile à tout moment" },
      ],
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-500/10",
    },
    coach: {
      title: "Pour le Coach",
      subtitle: "Gérez vos clients et développez votre activité",
      features: [
        { icon: Users, text: "Gestion jusqu'à 50+ élèves" },
        { icon: Dumbbell, text: "Créez des séances pour vos clients" },
        { icon: TrendingUp, text: "Statistiques globales et individuelles" },
        { icon: Check, text: "Réservations avec sync Google Calendar" },
        { icon: Check, text: "Messagerie intégrée avec les élèves" },
        { icon: Check, text: "Rapports PDF professionnels en 1 clic" },
      ],
      color: "from-purple-500 to-fuchsia-500",
      bgColor: "bg-purple-500/10",
    },
  };

  const currentRole = roles[activeRole];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-slate-950" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Une solution pour tous
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Conçu pour{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              chaque profil
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Que vous soyez sportif ou coach professionnel, MyTrackLy s'adapte à
            vos besoins
          </p>
        </motion.div>

        {/* Role Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
            <motion.button
              onClick={() => setActiveRole("athlete")}
              className={`relative px-6 py-3 rounded-xl font-medium transition-all ${
                activeRole === "athlete"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {activeRole === "athlete" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Sportif
              </span>
            </motion.button>
            <motion.button
              onClick={() => setActiveRole("coach")}
              className={`relative px-6 py-3 rounded-xl font-medium transition-all ${
                activeRole === "coach"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {activeRole === "coach" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Coach
              </span>
            </motion.button>
          </div>
        </div>

        {/* Role Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Features List */}
          <motion.div layout className="order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, x: activeRole === "athlete" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeRole === "athlete" ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl font-bold text-white mb-2">
                  {currentRole.title}
                </h3>
                <p className="text-lg text-white/50 mb-8">{currentRole.subtitle}</p>

                <div className="space-y-4">
                  {currentRole.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10"
                    >
                      <div className={`w-10 h-10 rounded-lg ${currentRole.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <span className="text-white/80 pt-1">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right - Visual Preview */}
          <motion.div layout className="order-1 lg:order-2 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                {/* Glow Background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${currentRole.color} rounded-3xl blur-3xl opacity-20`}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Main Card */}
                <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentRole.color} flex items-center justify-center`}
                      >
                        {activeRole === "athlete" ? (
                          <Dumbbell className="w-6 h-6 text-white" />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">MyTrackLy</div>
                        <div className="text-sm text-white/50">
                          {activeRole === "athlete"
                            ? "Vue Sportif"
                            : "Vue Coach"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                  </div>

                  {/* Card Content */}
                  {activeRole === "athlete" ? (
                    <div className="space-y-4">
                      {/* Progress Ring */}
                      <div className="flex items-center justify-center py-4">
                        <div className="relative">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="8"
                              fill="none"
                            />
                            <motion.circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="url(#gradient1)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              whileInView={{ pathLength: 0.85 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                            <defs>
                              <linearGradient
                                id="gradient1"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#a855f7" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white">85%</span>
                            <span className="text-xs text-white/50">Objectif</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-white">127</div>
                          <div className="text-xs text-white/50">Séances</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                          <div className="text-xl font-bold text-white">+12%</div>
                          <div className="text-xs text-white/50">Force</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Student List */}
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">
                                Élève {i}
                              </div>
                              <div className="text-xs text-white/50">
                                Dernière séance: {3 - i}j
                              </div>
                            </div>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                i === 1
                                  ? "bg-emerald-400"
                                  : i === 2
                                  ? "bg-yellow-400"
                                  : "bg-slate-400"
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-white">42</div>
                          <div className="text-[10px] text-white/50">Total</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-emerald-400">
                            38
                          </div>
                          <div className="text-[10px] text-white/50">Actifs</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-sm font-bold text-white">8</div>
                          <div className="text-[10px] text-white/50">Nouveaux</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Roles;