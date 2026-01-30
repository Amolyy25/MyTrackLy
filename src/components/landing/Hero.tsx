import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  Play,
  Sparkles,
  Dumbbell,
  Users,
  TrendingUp,
  Zap,
  BarChart3,
  Calendar,
  Activity,
} from "lucide-react";

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useSpring(useTransform(scrollY, [0, 500], [0, 200]));
  const y2 = useSpring(useTransform(scrollY, [0, 500], [0, -150]));
  const opacity = useSpring(useTransform(scrollY, [0, 300], [1, 0]));
  const scale = useSpring(useTransform(scrollY, [0, 300], [1, 0.95]));

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const floatingElements = [
    { icon: Dumbbell, x: "10%", y: "15%", delay: 0 },
    { icon: BarChart3, x: "85%", y: "20%", delay: 0.5 },
    { icon: Calendar, x: "75%", y: "70%", delay: 1 },
    { icon: Activity, x: "15%", y: "75%", delay: 1.5 },
  ];

  const stats = [
    { value: "15K+", label: "Utilisateurs actifs" },
    { value: "500K+", label: "Séances enregistrées" },
    { value: "4.9/5", label: "Note moyenne" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Aurora Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950" />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[180px]"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ y: y1 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/25 rounded-full blur-[140px]"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ y: y2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating Icons */}
      {floatingElements.map((el, idx) => (
        <motion.div
          key={idx}
          className="absolute w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center"
          style={{
            left: el.x,
            top: el.y,
            y: idx % 2 === 0 ? y1 : y2,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            delay: el.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <el.icon className="w-8 h-8 text-indigo-400" />
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12"
        style={{ scale }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-8"
            >
              <motion.div
                className="w-2 h-2 bg-emerald-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm text-white/70">
                <span className="text-white font-medium">14 jours d'essai gratuit</span> · Sans engagement
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
            >
              <span className="block text-white mb-2">Transformez votre</span>
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                pratique sportive
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/60 mb-10 leading-relaxed max-w-lg"
            >
              La plateforme hybride{" "}
              <span className="text-white font-medium">Personnel + Coach</span>{" "}
              pour suivre vos séances, mesurer vos progrès et gérer vos clients
              avec professionnalisme.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <motion.button
                className="group relative bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl shadow-indigo-500/30 overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/register")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-white/20 to-indigo-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 hover:border-white/30 hover:bg-white/5 transition-all text-white/90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                Voir la démo
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-6"
            >
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>RGPD compliant</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Configuration en 2 min</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>Support 24/7</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - App Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            <motion.div
              className="relative"
              style={{ y: y1 }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-violet-500/30 rounded-3xl blur-3xl" />

              {/* Main Card - Glassmorphism Dashboard */}
              <motion.div
                className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">MyTrackLy</div>
                      <div className="text-xs text-white/50">Dashboard</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Live</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { value: "127", label: "Séances", change: "+8", color: "indigo" },
                    { value: "+12%", label: "Progression", change: "+2%", color: "purple" },
                    { value: "85%", label: "Objectifs", change: "+5%", color: "emerald" },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-3 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xl font-bold text-white mb-0.5">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        {stat.change}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart Visualization */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white/90">Volume Hebdo</span>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-end justify-between h-24 gap-2">
                    {[35, 55, 45, 75, 60, 85, 70, 90, 65, 80, 55, 70].map((height, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.7 + idx * 0.05, duration: 0.5 }}
                        className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-all cursor-pointer"
                        style={{ minHeight: "4px" }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {["J", "F", "M", "A", "M", "J"].map((month, idx) => (
                      <span key={idx} className="text-[10px] text-white/40">
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl rotate-12 blur-xl"
                animate={{
                  rotate: [12, 18, 12],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-violet-500/30 to-indigo-500/30 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Stats Cards Floating */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -left-16 top-1/2 -translate-y-1/2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl"
              style={{ y: y2 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">+47%</div>
                  <div className="text-xs text-white/50">Ce mois</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="absolute -right-12 bottom-20 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl"
              style={{ y: y1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">42</div>
                  <div className="text-xs text-white/50">Élèves actifs</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 pt-8 border-t border-white/10"
        >
          <div className="grid grid-cols-3 gap-8 max-w-2xl">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <motion.div
                  className="text-3xl sm:text-4xl font-bold text-white mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 rounded-full bg-white/40"
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;