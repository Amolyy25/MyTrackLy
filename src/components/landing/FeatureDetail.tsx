import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureDetailProps {
  icon: LucideIcon | React.ReactNode;
  title: string;
  subtitle: string;
  description: string[];
  benefits: string[];
  reversed?: boolean;
  color?: "indigo" | "purple" | "violet" | "emerald";
  image?: React.ReactNode;
}

const colorConfig = {
  indigo: {
    from: "from-indigo-500",
    to: "to-indigo-600",
    glow: "shadow-indigo-500/30",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
  },
  purple: {
    from: "from-purple-500",
    to: "to-purple-600",
    glow: "shadow-purple-500/30",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
  },
  violet: {
    from: "from-violet-500",
    to: "to-violet-600",
    glow: "shadow-violet-500/30",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
  },
  emerald: {
    from: "from-emerald-500",
    to: "to-emerald-600",
    glow: "shadow-emerald-500/30",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
};

const FeatureDetail: React.FC<FeatureDetailProps> = ({
  icon,
  title,
  subtitle,
  description,
  benefits,
  reversed = false,
  color = "indigo",
  image,
}) => {
  const config = colorConfig[color];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-slate-950" />
      <div
        className={`absolute ${
          reversed ? "right-0" : "left-0"
        } top-1/2 -translate-y-1/2 w-[600px] h-[600px] ${config.bg} rounded-full blur-[200px] opacity-30`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${reversed ? "lg:flex-row-reverse" : ""}`}>
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: reversed ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className={reversed ? "order-2 lg:order-2" : "order-1"}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.from} ${config.to} flex items-center justify-center mb-6 shadow-lg ${config.glow}`}
            >
              {React.isValidElement(icon)
                ? icon
                : typeof icon === "function" ||
                  (typeof icon === "object" && icon !== null && "$$typeof" in (icon as object))
                  ? React.createElement(icon as unknown as React.ComponentType<{ className?: string }>, {
                      className: "w-8 h-8 text-white",
                    })
                  : icon}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <span className={`inline-block px-3 py-1 rounded-full ${config.bg} ${config.border} text-xs font-semibold ${config.text} uppercase tracking-wider mb-4`}>
                Fonctionnalité
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {title}
              </h2>
              <p className="text-xl text-white/50 mb-8">{subtitle}</p>
            </motion.div>

            {/* Description */}
            <div className="space-y-4 mb-8">
              {description.map((text, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="text-white/70 leading-relaxed"
                >
                  {text}
                </motion.p>
              ))}
            </div>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-6 h-6 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: reversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`relative ${reversed ? "order-1 lg:order-1" : "order-2"}`}
          >
            {/* Glow Effect */}
            <motion.div
              className={`absolute -inset-4 bg-gradient-to-br ${config.from} ${config.to} rounded-3xl blur-3xl opacity-20`}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Default Visual */}
            {image || (
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                {/* Mock Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.from} ${config.to} flex items-center justify-center`}>
                      {React.isValidElement(icon)
                        ? icon
                        : typeof icon === "function" ||
                          (typeof icon === "object" && icon !== null && "$$typeof" in (icon as object))
                          ? React.createElement(icon as unknown as React.ComponentType<{ className?: string }>, {
                              className: "w-5 h-5 text-white",
                            })
                          : icon}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">MyTrackLy</div>
                      <div className="text-xs text-white/50">Feature Preview</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                    <div className="w-3 h-3 rounded-full bg-green-400/50" />
                  </div>
                </div>

                {/* Mock Content */}
                <div className="space-y-4">
                  <div className="h-32 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/5 rounded-xl border border-white/10" />
                    <div className="h-24 bg-white/5 rounded-xl border border-white/10" />
                  </div>
                  <div className="h-16 bg-white/5 rounded-xl border border-white/10" />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureDetail;