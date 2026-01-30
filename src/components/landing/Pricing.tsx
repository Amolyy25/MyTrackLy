import React from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import {
  Check,
  X,
  Zap,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Shield,
  Star,
  ArrowRight,
} from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: "personnel" | "coach" | "eleve";
  name: string;
  price: string;
  period: string;
  description: string;
  color: string;
  gradient: string;
  featured?: boolean;
  features: PlanFeature[];
}

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const plans: Plan[] = [
    {
      id: "personnel",
      name: "Personnel",
      price: "5€",
      period: "/mois",
      description: "Pour les sportifs autonomes qui veulent suivre leurs progrès",
      color: "slate",
      gradient: "from-slate-500 to-slate-600",
      features: [
        { text: "Suivi complet de vos séances", included: true },
        { text: "Statistiques et progression détaillées", included: true },
        { text: "Mensurations et historique", included: true },
        { text: "Habitudes et objectifs personnels", included: true },
        { text: "Historique illimité", included: true },
        { text: "Support par email", included: true },
        { text: "Gestion d'élèves", included: false },
        { text: "Réservations avec sync Google Calendar", included: false },
        { text: "Messagerie avec les clients", included: false },
      ],
    },
    {
      id: "coach",
      name: "Coach",
      price: "50€",
      period: "/mois",
      description: "Pour les coachs professionnels qui accompagnent des clients",
      color: "indigo",
      gradient: "from-indigo-500 to-purple-500",
      featured: true,
      features: [
        { text: "Toutes les fonctionnalités Personnel", included: true },
        { text: "Gestion jusqu'à 50+ élèves", included: true },
        { text: "Création de séances pour vos élèves", included: true },
        { text: "Messagerie intégrée", included: true },
        { text: "Réservations avec Google Calendar", included: true },
        { text: "Programmes personnalisés", included: true },
        { text: "Rappels et notifications par email", included: true },
        { text: "Rapports PDF professionnels", included: true },
        { text: "Support prioritaire 24/7", included: true },
      ],
    },
    {
      id: "eleve",
      name: "Élève",
      price: "0€",
      period: "/mois",
      description: "Votre coach paie pour votre accès, vous profitez de tout",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      features: [
        { text: "Toutes les fonctionnalités Personnel", included: true },
        { text: "Coach assigné pour vous accompagner", included: true },
        { text: "Réservation de séances avec votre coach", included: true },
        { text: "Discussion et messagerie", included: true },
        { text: "Accès aux programmes de votre coach", included: true },
        { text: "Suivi personnalisé", included: true },
        { text: "Gestion d'autres élèves", included: false },
        { text: "Support prioritaire 24/7", included: false },
      ],
    },
  ];

  const trustBadges = [
    { icon: Shield, text: "Paiement sécurisé" },
    { icon: Check, text: "14 jours d'essai gratuit" },
    { icon: Zap, text: "Annulation à tout moment" },
    { icon: Star, text: "Support 24/7" },
  ];

  const handlePlanClick = (planId: "personnel" | "coach" | "eleve") => {
    if (planId === "eleve") {
      navigate("/register?plan=eleve");
    } else {
      navigate(`/payment?plan=${planId}`);
    }
  };

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[200px]" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-sm text-indigo-300 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Tarifs transparents
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Choisissez votre{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              plan d'accompagnement
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            14 jours d'essai gratuit · Sans engagement · Annulation à tout moment
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative ${plan.featured ? "lg:-translate-y-4" : ""}`}
            >
              {/* Featured Badge */}
              {plan.featured && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg shadow-indigo-500/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Recommandé
                  </div>
                </motion.div>
              )}

              {/* Glow Effect */}
              {plan.featured && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 0.3 } : {}}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="absolute -inset-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 rounded-3xl blur-2xl"
                />
              )}

              {/* Card */}
              <div
                className={`relative h-full bg-slate-900/80 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 ${
                  plan.featured
                    ? "border-indigo-500/50 shadow-2xl shadow-indigo-500/20"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.2 + idx * 0.1, type: "spring" }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg ${
                      plan.color === "indigo"
                        ? "shadow-indigo-500/30"
                        : plan.color === "emerald"
                        ? "shadow-emerald-500/30"
                        : "shadow-slate-500/30"
                    }`}
                  >
                    {plan.id === "personnel" && <Zap className="w-8 h-8 text-white" />}
                    {plan.id === "coach" && <Users className="w-8 h-8 text-white" />}
                    {plan.id === "eleve" && <Star className="w-8 h-8 text-white" />}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-white/50">{plan.period}</span>
                  </div>
                  <p className="text-white/50 text-sm">{plan.description}</p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <motion.div
                      key={fIdx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4 + idx * 0.1 + fIdx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-white/30" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-white/80" : "text-white/30"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  onClick={() => handlePlanClick(plan.id)}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 group ${
                    plan.featured
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                      : "bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 hover:border-white/20"
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.id === "eleve" ? "S'inscrire" : "Commencer l'essai gratuit"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-16"
        >
          {trustBadges.map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 + idx * 0.1 }}
              className="flex items-center gap-2 text-white/60 text-sm"
            >
              <badge.icon className="w-4 h-4" />
              <span>{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <p className="text-white/50 mb-6">Vous avez des questions ?</p>
          <motion.button
            onClick={() => navigate("/faq")}
            className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-2 group"
            whileHover={{ x: 4 }}
          >
            Consultez notre FAQ
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;