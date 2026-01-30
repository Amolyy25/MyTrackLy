import React from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

interface StatProps {
  value: string;
  label: string;
  description?: string;
  delay?: number;
}

const Stat: React.FC<StatProps> = ({ value, label, description, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
        className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent mb-3"
      >
        {value}
      </motion.div>
      <div className="text-lg sm:text-xl text-white/80 font-medium mb-1">
        {label}
      </div>
      {description && (
        <div className="text-sm text-white/40">{description}</div>
      )}
    </motion.div>
  );
};

const SocialProof: React.FC = () => {
  const stats: StatProps[] = [
    {
      value: "15K+",
      label: "Utilisateurs Actifs",
      description: "Partout dans le monde",
      delay: 0,
    },
    {
      value: "500K+",
      label: "Séances Enregistrées",
      description: "Et chaque jour de plus",
      delay: 0.1,
    },
    {
      value: "4.9",
      label: "Note Moyenne",
      description: "Basée sur 2000+ avis",
      delay: 0.2,
    },
    {
      value: "50+",
      label: "Pays",
      description: "Couverture internationale",
      delay: 0.3,
    },
  ];

  const testimonials = [
    {
      name: "Sophie Laurent",
      role: "Coach sportive professionnelle",
      content:
        "MyTrackLy m'a permis de doubler le nombre de clients que je peux suivre efficacement. L'interface est intuitive et les rapports automatiques font gagner un temps précieux.",
      initials: "SL",
    },
    {
      name: "Marc Dubois",
      role: "Athlète amateur passionné",
      content:
        "Enfin une application qui me permet de voir concrètement ma progression. Les graphiques sont clairs et la saisie des séances est ultra rapide, même à la salle.",
      initials: "MD",
    },
    {
      name: "Emma Martin",
      role: "Coach en ligne",
      content:
        "Parfait pour le coaching à distance. Je peux suivre mes clients où qu'ils soient et la synchronisation Google Calendar change vraiment la vie pour l'organisation.",
      initials: "EM",
    },
    {
      name: "Thomas Bernard",
      role: "Préparateur physique",
      content:
        "L'analyse des données est impressionnante. Je peux maintenant prendre des décisions basées sur des chiffres concrets plutôt que sur le feeling.",
      initials: "TB",
    },
    {
      name: "Julie Petit",
      role: "Pratiquante régulière",
      content:
        "J'aime pouvoir voir mon évolution sur plusieurs mois. Ça me motive à continuer quand je vois les progrès que j'ai faits depuis le début.",
      initials: "JP",
    },
    {
      name: "Alexandre Chen",
      role: "Coach CrossFit",
      content:
        "La gestion des habitudes est un vrai plus. Mes clients construisent des routines durables et je peux suivre leur adhérence en temps réel.",
      initials: "AC",
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-slate-950" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px]" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="mb-32">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-sm text-indigo-300 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              La confiance de la communauté
            </motion.span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Des résultats{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                qui parlent d'eux-mêmes
              </span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Des milliers d'athlètes et de coachs nous font confiance au quotidien
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
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
            Témoignages
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Ce qu'en disent nos utilisateurs
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Découvrez comment MyTrackLy transforme la pratique sportive au quotidien
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Card */}
              <div className="relative h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 group-hover:border-white/20">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 + i * 0.05, type: "spring" }}
                      className="w-5 h-5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>

                {/* Content */}
                <p className="text-white/70 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-white/50">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trusted By Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-white/10"
        >
          <p className="text-center text-white/40 text-sm uppercase tracking-wider mb-8">
            Utilisé par des coachs et structures professionnelles
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
            {["Fitness Pro", "Elite Coaching", "Performance Plus", "Athlete Hub", "Trainer Pro"].map(
              (brand, idx) => (
                <motion.div
                  key={brand}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 0.6, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-xl sm:text-2xl font-bold text-white/50 hover:text-white/70 transition-colors cursor-default"
                >
                  {brand}
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;