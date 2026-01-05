import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../composants/Navbar";
import Footer from "../../composants/Footer";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [scrollY, setScrollY] = useState(0);
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleCTAClick = () => {
    navigate("/plans");
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Design Premium */}
      <section
        id="hero"
        ref={setSectionRef("hero")}
        className="relative min-h-screen flex items-center overflow-hidden pt-20"
      >
        {/* Fond élégant */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>

        {/* Formes subtiles */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contenu gauche */}
            <div
              className={`transition-all duration-1000 delay-200 ${
                isVisible["hero"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
            >
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                Solution professionnelle de coaching
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block text-gray-900">Transformez votre</span>
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  pratique sportive
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Une plateforme intuitive et complète pour suivre vos
                performances, atteindre vos objectifs et accompagner vos clients
                avec professionnalisme.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={handleCTAClick}
                  className="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                >
                  Commencer gratuitement
                </button>
                <button
                  onClick={handleCTAClick}
                  className="border-2 border-gray-300 hover:border-indigo-600 text-gray-700 hover:text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-gray-50"
                >
                  Voir la démo
                </button>
              </div>

              {/* Stats élégantes */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                {[
                  { number: "15K+", label: "Utilisateurs actifs" },
                  { number: "500K+", label: "Séances enregistrées" },
                  { number: "4.8/5", label: "Note moyenne" },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contenu droit - Dashboard Premium */}
            <div
              className={`relative transition-all duration-1000 delay-400 ${
                isVisible["hero"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-100 rounded-3xl blur-3xl opacity-50"></div>

                {/* Dashboard Card */}
                <div className="relative bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="h-3 w-28 bg-gray-800 rounded mb-1"></div>
                        <div className="h-2 w-20 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-3 border border-indigo-100">
                      <div className="text-xs text-indigo-600 font-medium mb-1">
                        Séances
                      </div>
                      <div className="text-2xl font-bold text-indigo-700">
                        127
                      </div>
                      <div className="text-[10px] text-indigo-500 mt-1">
                        +8 ce mois
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-3 border border-purple-100">
                      <div className="text-xs text-purple-600 font-medium mb-1">
                        Progression
                      </div>
                      <div className="text-2xl font-bold text-purple-700">
                        +12%
                      </div>
                      <div className="text-[10px] text-purple-500 mt-1">
                        vs mois dernier
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-100">
                      <div className="text-xs text-emerald-600 font-medium mb-1">
                        Objectifs
                      </div>
                      <div className="text-2xl font-bold text-emerald-700">
                        85%
                      </div>
                      <div className="text-[10px] text-emerald-500 mt-1">
                        atteints
                      </div>
                    </div>
                  </div>

                  {/* Graph Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-2.5 w-24 bg-gray-200 rounded"></div>
                      <div className="flex space-x-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded"></div>
                        <div className="w-6 h-6 bg-purple-100 rounded"></div>
                      </div>
                    </div>
                    {/* Graph bars */}
                    <div className="flex items-end justify-between h-24 space-x-1.5">
                      {[65, 72, 58, 80, 75, 88, 92].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-purple-500 mb-1 transition-all hover:opacity-80"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-[9px] text-gray-400 font-medium">
                            {["L", "M", "M", "J", "V", "S", "D"][i]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div className="space-y-2">
                    <div className="h-2.5 w-20 bg-gray-200 rounded mb-3"></div>
                    {[
                      {
                        icon: "🏋️",
                        text: "Squat - 120kg",
                        time: "Il y a 2h",
                        colorClass: "bg-indigo-500",
                      },
                      {
                        icon: "💪",
                        text: "Développé couché - 90kg",
                        time: "Il y a 5h",
                        colorClass: "bg-purple-500",
                      },
                      {
                        icon: "🏃",
                        text: "Course - 5km",
                        time: "Hier",
                        colorClass: "bg-emerald-500",
                      },
                    ].map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-lg">{activity.icon}</div>
                        <div className="flex-1">
                          <div
                            className="h-2.5 bg-gray-800 rounded mb-1"
                            style={{ width: `${70 + i * 10}%` }}
                          ></div>
                          <div
                            className="h-2 bg-gray-300 rounded"
                            style={{ width: "40%" }}
                          ></div>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${activity.colorClass}`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-indigo-200/60 to-purple-200/60 rounded-2xl transform rotate-12 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-200/60 to-indigo-200/60 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités - Design Premium */}
      <section
        id="features"
        ref={setSectionRef("features")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["features"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
              Fonctionnalités
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une suite d'outils complète pensée pour les coachs et les athlètes
              exigeants
            </p>
          </div>

          {/* Grid de features élégant */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
                title: "Suivi de performances",
                description:
                  "Enregistrez et analysez chaque séance avec précision. Visualisez votre progression en temps réel.",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                ),
                title: "Analyses avancées",
                description:
                  "Des graphiques clairs et des statistiques pertinentes pour prendre les bonnes décisions.",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Objectifs personnalisés",
                description:
                  "Définissez vos objectifs et suivez votre progression étape par étape avec clarté.",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                title: "Gestion de clients",
                description:
                  "Accompagnez plusieurs clients avec des programmes individualisés et un suivi professionnel.",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: "Application mobile",
                description:
                  "Emportez votre carnet partout avec vous. Interface fluide et mode hors ligne disponible.",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                title: "Rapports détaillés",
                description:
                  "Générez des rapports professionnels pour partager avec vos clients ou votre coach.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group transition-all duration-500 ${
                  isVisible["features"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Avantages - Design Premium */}
      <section
        id="benefits"
        ref={setSectionRef("benefits")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["benefits"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
              Avantages
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi nos utilisateurs nous font confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une solution pensée pour simplifier votre quotidien et amplifier
              vos résultats
            </p>
          </div>

          {/* Grid Avant/Après élégant */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* SANS */}
            <div
              className={`transition-all duration-1000 ${
                isVisible["benefits"]
                  ? "opacity-100 -translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
            >
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700">
                    Méthodes traditionnelles
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    "Carnets papier difficiles à organiser",
                    "Progression difficile à visualiser",
                    "Gestion chronophage des données",
                    "Communication limitée avec les clients",
                    "Rapports manuels fastidieux",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="text-gray-400 text-lg mt-0.5">•</div>
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AVEC */}
            <div
              className={`transition-all duration-1000 delay-200 ${
                isVisible["benefits"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative bg-white border-2 border-indigo-200 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
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
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Avec MyTrackLy
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Interface intuitive et organisée",
                      "Visualisation claire de vos progrès",
                      "Centralisation automatique des données",
                      "Partage facilité avec vos clients",
                      "Rapports générés automatiquement",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="text-indigo-600 text-lg mt-0.5">✓</div>
                        <span className="text-gray-700 font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats élégantes */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-400 ${
              isVisible["benefits"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            {[
              {
                value: "5h",
                label: "gagnées/semaine",
                description: "en moyenne",
              },
              {
                value: "3x",
                label: "plus efficace",
                description: "qu'un carnet papier",
              },
              {
                value: "92%",
                label: "de satisfaction",
                description: "clients",
              },
              { value: "24/7", label: "support", description: "disponible" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="text-4xl font-bold text-indigo-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Témoignages - Design Premium */}
      <section
        id="testimonials"
        ref={setSectionRef("testimonials")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["testimonials"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
              Témoignages
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Ce qu'en disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez comment MyTrackLy aide coachs et athlètes au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sophie Laurent",
                role: "Coach sportive",
                initials: "SL",
                content:
                  "Cette application a vraiment changé ma façon de travailler. Je peux maintenant suivre l'évolution de mes clients de manière précise et leur donner des conseils personnalisés basés sur des données concrètes.",
              },
              {
                name: "Marc Dubois",
                role: "Athlète amateur",
                initials: "MD",
                content:
                  "Enfin un outil qui me permet de voir ma progression clairement. Les graphiques sont lisibles et l'application est facile à utiliser, même à la salle de sport.",
              },
              {
                name: "Emma Martin",
                role: "Coach nutrition",
                initials: "EM",
                content:
                  "Mes clients apprécient particulièrement les rapports détaillés que je peux leur envoyer. Cela renforce la confiance et montre la valeur de mon accompagnement.",
              },
              {
                name: "Thomas Bernard",
                role: "Préparateur physique",
                initials: "TB",
                content:
                  "L'interface est intuitive et professionnelle. J'ai pu intégrer l'outil rapidement dans ma pratique sans avoir besoin de formation complexe.",
              },
              {
                name: "Julie Petit",
                role: "Pratiquante régulière",
                initials: "JP",
                content:
                  "Je suis mes objectifs semaine après semaine. L'application m'aide à rester motivée et à voir le chemin parcouru. C'est vraiment encourageant.",
              },
              {
                name: "Alexandre Chen",
                role: "Coach en ligne",
                initials: "AC",
                content:
                  "Parfait pour le coaching à distance. Je peux suivre mes clients où qu'ils soient et ils apprécient cette flexibilité et ce suivi professionnel.",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  isVisible["testimonials"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full hover:shadow-xl hover:border-indigo-200 transition-all">
                  {/* Étoiles */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Contenu */}
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Profil */}
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Pricing - Design Premium */}
      <section
        id="pricing"
        ref={setSectionRef("pricing")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["pricing"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
              Tarifs
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Un tarif adapté à vos besoins
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Essai gratuit de 14 jours · Sans engagement · Annulation à tout
              moment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Individuel */}
            <div
              className={`transition-all duration-500 ${
                isVisible["pricing"]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
              }`}
            >
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:shadow-lg transition-all">
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Individuel
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">9€</span>
                  <span className="text-gray-600">/mois</span>
                </div>
                <p className="text-gray-600 mb-8">
                  Pour les sportifs qui veulent suivre leurs progrès
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Suivi personnel illimité",
                    "Tous les exercices",
                    "Graphiques de progression",
                    "Support par email",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-indigo-600"
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
                  onClick={handleCTAClick}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-xl font-semibold transition-all"
                >
                  Commencer
                </button>
              </div>
            </div>

            {/* Plan Coach - Populaire */}
            <div
              className={`transition-all duration-500 delay-100 ${
                isVisible["pricing"]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
              }`}
            >
              <div className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg z-10">
                  Recommandé
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative bg-white border-2 border-indigo-600 rounded-2xl p-8 shadow-xl">
                  <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                    Coach
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">
                      29€
                    </span>
                    <span className="text-gray-600">/mois</span>
                  </div>
                  <p className="text-gray-600 mb-8">
                    Pour les coachs qui accompagnent leurs clients
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      "Clients illimités",
                      "Rapports personnalisés",
                      "Analyses avancées",
                      "Support prioritaire",
                      "Personnalisation complète",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-indigo-600"
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
                        <span className="text-gray-700 font-medium">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleCTAClick}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Commencer l'essai gratuit
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Professionnel */}
            <div
              className={`transition-all duration-500 delay-200 ${
                isVisible["pricing"]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
              } md:col-span-2 lg:col-span-1`}
            >
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full hover:shadow-lg transition-all">
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Professionnel
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">79€</span>
                  <span className="text-gray-600">/mois</span>
                </div>
                <p className="text-gray-600 mb-8">
                  Pour les structures et équipes sportives
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Tout du plan Coach",
                    "Plusieurs coachs",
                    "API et intégrations",
                    "Support dédié",
                    "Formation personnalisée",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-indigo-600"
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
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-xl font-semibold transition-all">
                  Nous contacter
                </button>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div
            className={`mt-12 flex flex-wrap justify-center items-center gap-8 transition-all duration-1000 ${
              isVisible["pricing"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {[
              { icon: "🔒", text: "Paiement sécurisé" },
              { icon: "✓", text: "14 jours d'essai gratuit" },
              { icon: "↻", text: "Annulation à tout moment" },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-gray-600 text-sm"
              >
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Logos Clients - Social Proof */}
      <section
        id="clients"
        ref={setSectionRef("clients")}
        className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible["clients"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-8">
              Ils nous font confiance
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60 hover:opacity-100 transition-opacity">
              {[
                "Fitness Pro",
                "Sport Academy",
                "Elite Coaching",
                "Performance Plus",
                "Athlete Hub",
                "Trainer Pro",
              ].map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm">
                      {client.split(" ")[0][0]}
                      {client.split(" ")[1]?.[0]}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {client}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Cas d'Usage - Use Cases */}
      <section
        id="use-cases"
        ref={setSectionRef("use-cases")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["use-cases"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
              Cas d'usage
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Adapté à tous les profils
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez comment MyTrackLy s'adapte à vos besoins spécifiques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Coach personnel",
                description:
                  "Gérez plusieurs clients simultanément avec des programmes personnalisés et un suivi détaillé.",
                icon: "👨‍🏫",
                features: [
                  "Tableaux de bord individuels",
                  "Rapports automatiques",
                  "Communication facilitée",
                ],
              },
              {
                title: "Athlète amateur",
                description:
                  "Suivez vos performances, atteignez vos objectifs et visualisez votre progression.",
                icon: "🏃",
                features: [
                  "Suivi personnel complet",
                  "Graphiques de progression",
                  "Rappels et objectifs",
                ],
              },
              {
                title: "Salle de sport",
                description:
                  "Proposez un service premium à vos membres avec un suivi professionnel.",
                icon: "🏋️",
                features: [
                  "Multi-coachs",
                  "Branding personnalisé",
                  "Rapports clients",
                ],
              },
              {
                title: "Coach en ligne",
                description:
                  "Accompagnez vos clients à distance avec des outils de suivi professionnels.",
                icon: "💻",
                features: [
                  "Suivi à distance",
                  "Vidéos intégrées",
                  "Messagerie intégrée",
                ],
              },
              {
                title: "Équipe sportive",
                description:
                  "Coordonnez l'entraînement de votre équipe avec des statistiques collectives.",
                icon: "👥",
                features: [
                  "Gestion d'équipe",
                  "Statistiques comparatives",
                  "Planification groupée",
                ],
              },
              {
                title: "Préparateur physique",
                description:
                  "Optimisez les performances avec des analyses avancées et des rapports détaillés.",
                icon: "📊",
                features: [
                  "Analyses approfondies",
                  "Rapports médicaux",
                  "Historique complet",
                ],
              },
            ].map((useCase, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl hover:border-indigo-200 transition-all ${
                  isVisible["use-cases"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {useCase.description}
                </p>
                <ul className="space-y-2">
                  {useCase.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <svg
                        className="w-4 h-4 text-indigo-600"
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
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section FAQ - Répondre aux objections */}
      <section
        id="faq"
        ref={setSectionRef("faq")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["faq"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
              Questions fréquentes
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Tout ce que vous devez savoir
            </h2>
            <p className="text-xl text-gray-600">
              Des réponses claires à vos questions les plus courantes
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Puis-je essayer MyTrackLy gratuitement ?",
                answer:
                  "Oui, nous offrons un essai gratuit de 14 jours sans carte bancaire. Vous avez accès à toutes les fonctionnalités pendant cette période pour tester la plateforme en conditions réelles.",
              },
              {
                question: "Mes données sont-elles sécurisées ?",
                answer:
                  "Absolument. Nous utilisons un chiffrement de niveau entreprise et respectons le RGPD. Vos données sont stockées de manière sécurisée et nous effectuons des sauvegardes régulières.",
              },
              {
                question: "Puis-je annuler mon abonnement à tout moment ?",
                answer:
                  "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre compte. Aucun engagement, aucune pénalité. Vous gardez l'accès jusqu'à la fin de votre période de facturation.",
              },
              {
                question: "MyTrackLy fonctionne-t-il sur mobile ?",
                answer:
                  "Oui, MyTrackLy est entièrement responsive et fonctionne parfaitement sur smartphone et tablette. Une application mobile native est également disponible sur iOS et Android.",
              },
              {
                question: "Puis-je importer mes données existantes ?",
                answer:
                  "Oui, nous proposons des outils d'import pour les données Excel, CSV et d'autres formats. Notre équipe peut également vous aider à migrer vos données si nécessaire.",
              },
              {
                question: "Quel support est disponible ?",
                answer:
                  "Nous offrons un support par email pour tous les plans, et un support prioritaire 24/7 pour les plans Coach et Professionnel. Nous répondons généralement sous 24h.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className={`bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-indigo-200 transition-all ${
                  isVisible["faq"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Comparaison - Pourquoi nous choisir */}
      <section
        id="comparison"
        ref={setSectionRef("comparison")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["comparison"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
              Pourquoi MyTrackLy
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              La différence qui compte
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez ce qui nous distingue des autres solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Interface intuitive",
                description:
                  "Une interface pensée pour être utilisée au quotidien, sans formation nécessaire.",
                icon: "✨",
                highlight: "Prise en main en 5 minutes",
              },
              {
                title: "Support réactif",
                description:
                  "Une équipe à votre écoute pour répondre à vos questions et vous accompagner.",
                icon: "💬",
                highlight: "Réponse sous 24h",
              },
              {
                title: "Évolutif",
                description:
                  "Une plateforme qui grandit avec vous, de l'athlète amateur au coach professionnel.",
                icon: "📈",
                highlight: "S'adapte à vos besoins",
              },
              {
                title: "Innovation continue",
                description:
                  "Des mises à jour régulières avec de nouvelles fonctionnalités basées sur vos retours.",
                icon: "🚀",
                highlight: "Nouveautés mensuelles",
              },
              {
                title: "Prix transparent",
                description:
                  "Un tarif clair, sans frais cachés, avec la possibilité d'essayer gratuitement.",
                icon: "💰",
                highlight: "Sans surprise",
              },
              {
                title: "Communauté active",
                description:
                  "Rejoignez une communauté de coachs et d'athlètes qui partagent leurs expériences.",
                icon: "👥",
                highlight: "15K+ utilisateurs",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl hover:border-indigo-200 transition-all text-center ${
                  isVisible["comparison"]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-20"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <div className="inline-block bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                  {item.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Design Premium */}
      <section
        id="cta"
        ref={setSectionRef("cta")}
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700"
      >
        {/* Formes subtiles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible["cta"] ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Prêt à transformer votre pratique sportive ?
            </h2>

            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Rejoignez des milliers d'athlètes et de coachs qui font déjà
              confiance à MyTrackLy
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleCTAClick}
                className="group bg-white hover:bg-gray-50 text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Commencer gratuitement
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
              <button
                onClick={handleCTAClick}
                className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-white/10"
              >
                Réserver une démo
              </button>
            </div>

            <div className="text-white/80 text-sm">
              ✓ Essai gratuit de 14 jours · Sans carte bancaire · Assistance
              incluse
            </div>

            {/* Social proof final */}
            <div className="flex flex-wrap justify-center gap-12 mt-16 pt-12 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">15K+</div>
                <div className="text-sm text-white/70">Utilisateurs actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">4.8/5</div>
                <div className="text-sm text-white/70">Note moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">500K+</div>
                <div className="text-sm text-white/70">
                  Séances enregistrées
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
