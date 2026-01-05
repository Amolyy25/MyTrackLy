import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../composants/Navbar";
import Footer from "../composants/Footer";

type PlanType = "personnel" | "eleve" | "coach";

interface Plan {
  id: PlanType;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  gradient: string;
}

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    const timeoutId = setTimeout(() => {
      Object.values(sectionsRef.current).forEach((section) => {
        if (section) observer.observe(section);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionsRef.current[id] = el;
  };

  const plans: Plan[] = [
    {
      id: "personnel",
      name: "Personnel",
      price: 5,
      description: "Parfait pour suivre votre progression personnelle",
      features: [
        "Suivi personnel complet de vos séances",
        "Statistiques et progression détaillées",
        "Mensurations et historique",
        "Habitudes et objectifs personnels",
        "Historique complet de vos séances",
        "Support par email",
      ],
      color: "indigo",
      gradient: "from-indigo-600 to-indigo-700",
    },
    {
      id: "eleve",
      name: "Élève",
      price: 0, // Pas de prix, géré par le coach
      description: "Idéal pour être accompagné par un coach",
      features: [
        "Toutes les fonctionnalités du plan Personnel",
        "Coach assigné pour vous accompagner",
        "Réservation de séances avec votre coach",
        "Discussion et messagerie avec le coach",
        "Accès aux programmes créés par votre coach",
        "Suivi personnalisé par votre coach",
        "Support prioritaire",
      ],
      popular: false,
      color: "purple",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      id: "coach",
      name: "Coach",
      price: 50,
      description: "Solution complète pour gérer vos élèves",
      features: [
        "Toutes les fonctionnalités du plan Personnel",
        "Gestion illimitée de vos élèves",
        "Visualisation complète des données de vos élèves",
        "Création de séances pour vos élèves",
        "Messagerie avec tous vos élèves",
        "Programmes d'entraînement personnalisés",
        "Rappels et notifications par email",
        "Statistiques globales de vos élèves",
        "Support prioritaire 24/7",
      ],
      color: "indigo",
      gradient: "from-indigo-600 via-purple-600 to-indigo-700",
    },
  ];

  const handleChoosePlan = (planId: PlanType) => {
    if (planId === "eleve") {
      // Pour le plan élève, rediriger vers l'inscription avec code coach
      navigate("/register?plan=eleve");
    } else {
      // Pour les autres plans, rediriger vers la page de paiement
      navigate(`/payment?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        ref={setSectionRef("hero")}
        className="relative pt-32 pb-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`text-center transition-all duration-1000 delay-200 ${
              isVisible["hero"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
              Choisissez le plan adapté à vos besoins
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-gray-900">Des plans</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                adaptés à chacun
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Que vous soyez un sportif autonome, un élève accompagné ou un
              coach professionnel, nous avons le plan qu'il vous faut.
            </p>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section
        id="plans"
        ref={setSectionRef("plans")}
        className="relative py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`transition-all duration-500 delay-${index * 100} ${
                  isVisible["plans"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
                }`}
              >
                <div className="relative">
                  {plan.popular && (
                    <>
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg z-10">
                        Recommandé
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl blur-xl opacity-50"></div>
                    </>
                  )}
                  <div
                    className={`relative bg-white border-2 rounded-2xl p-8 shadow-xl h-full flex flex-col ${
                      plan.popular
                        ? "border-purple-600"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
                        plan.popular ? "text-purple-600" : "text-gray-600"
                      }`}
                    >
                      {plan.name}
                    </div>
                    <div className="mb-6">
                      {plan.id === "eleve" ? (
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            Géré par votre coach
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Votre coach paie pour votre accès
                          </p>
                        </div>
                      ) : (
                        <>
                          <span className="text-5xl font-bold text-gray-900">
                            {plan.price}€
                          </span>
                          <span className="text-gray-600">/mois</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 mb-8">{plan.description}</p>
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                              plan.popular
                                ? "text-purple-600"
                                : "text-indigo-600"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleChoosePlan(plan.id)}
                      className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {plan.id === "eleve" ? "S'inscrire" : "Choisir ce plan"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        ref={setSectionRef("faq")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["faq"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur nos plans
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Puis-je changer de plan plus tard ?",
                answer:
                  "Oui, vous pouvez changer de plan à tout moment depuis votre tableau de bord. Les changements prennent effet immédiatement.",
              },
              {
                question: "Le plan Élève nécessite-t-il un coach ?",
                answer:
                  "Oui, pour vous inscrire au plan Élève, vous devez avoir un code d'invitation d'un coach ou être invité directement par un coach.",
              },
              {
                question: "Y a-t-il un essai gratuit ?",
                answer:
                  "Oui, tous nos plans incluent un essai gratuit de 14 jours. Aucune carte bancaire n'est requise pour commencer.",
              },
              {
                question: "Puis-je annuler à tout moment ?",
                answer:
                  "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Aucun frais d'annulation n'est appliqué.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-sm transition-all duration-500 delay-${
                  index * 100
                } ${
                  isVisible["faq"]
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-20"
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={setSectionRef("cta")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible["cta"] ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Choisissez le plan qui vous convient et commencez votre essai
              gratuit de 14 jours dès aujourd'hui.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group bg-white hover:bg-gray-50 text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Voir les plans
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
            <div className="text-white/80 text-sm mt-8">
              ✓ Essai gratuit de 14 jours · Sans carte bancaire · Assistance
              incluse
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Plans;
