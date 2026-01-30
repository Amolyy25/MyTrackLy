import React from "react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  color?: "indigo" | "purple" | "violet" | "emerald";
}

const colorConfig = {
  indigo: {
    from: "from-indigo-500",
    to: "to-indigo-600",
    glow: "shadow-indigo-500/30",
    bg: "bg-indigo-500/10",
    border: "hover:border-indigo-500/30",
  },
  purple: {
    from: "from-purple-500",
    to: "to-purple-600",
    glow: "shadow-purple-500/30",
    bg: "bg-purple-500/10",
    border: "hover:border-purple-500/30",
  },
  violet: {
    from: "from-violet-500",
    to: "to-violet-600",
    glow: "shadow-violet-500/30",
    bg: "bg-violet-500/10",
    border: "hover:border-violet-500/30",
  },
  emerald: {
    from: "from-emerald-500",
    to: "to-emerald-600",
    glow: "shadow-emerald-500/30",
    bg: "bg-emerald-500/10",
    border: "hover:border-emerald-500/30",
  },
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay = 0,
  color = "indigo",
}) => {
  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <motion.div
        className={`absolute -inset-1 bg-gradient-to-r ${config.from} ${config.to} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
      />

      {/* Card */}
      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-white/20">
        {/* Icon */}
        <motion.div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.from} ${config.to} flex items-center justify-center mb-6 shadow-lg ${config.glow} group-hover:scale-110 transition-transform duration-300`}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
        >
          {React.isValidElement(icon)
            ? icon
            : typeof icon === "function" ||
              (typeof icon === "object" && icon !== null && "$$typeof" in (icon as object))
              ? React.createElement(icon as unknown as React.ComponentType<{ className?: string }>, {
                  className: "w-7 h-7 text-white",
                })
              : icon}
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors">
          {title}
        </h3>
        <p className="text-white/60 leading-relaxed">{description}</p>

        {/* Hover Indicator */}
        <motion.div
          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${config.from} ${config.to}`}
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default FeatureCard;