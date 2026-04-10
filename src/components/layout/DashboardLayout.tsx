import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../pages/dashboard-new/header";
import InstallPrompt from "../ui/InstallPrompt";
import OnboardingTutorial from "../composants/OnboardingTutorial";
import {
  Home,
  Users,
  Dumbbell,
  Calendar,
  CalendarDays,
  Wallet,
  UserCircle,
  PieChart,
  Activity,
  Ruler,
  ClipboardList,
  LayoutDashboard
} from "lucide-react";

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("mytrackly_onboarding_completed");
    if (!completed) {
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTutorialClose = () => {
    localStorage.setItem("mytrackly_onboarding_completed", "true");
    setShowTutorial(false);
  };

  const userRole = user?.role || "personnel";

  // Navigation pour le rôle Personnel
  const personalNavigation = [
    { name: "Accueil", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Séances", href: "/dashboard/training/history", icon: <Dumbbell size={18} /> },
    { name: "Mon Plan", href: "/dashboard/training-plans", icon: <CalendarDays size={18} /> },
    {
      name: "Suivi",
      href: "#",
      icon: <Activity size={18} />,
      isDropdown: true,
      children: [
        { name: "Mensurations", href: "/dashboard/measurements" },
        { name: "Habitudes", href: "/dashboard/habits" },
        { name: "Statistiques", href: "/dashboard/statistics" },
      ],
    },
  ];

  // Navigation pour le rôle Élève
  const studentNavigation = [
    { name: "Accueil", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Mon Plan", href: "/dashboard/training-plans", icon: <CalendarDays size={18} /> },
    { name: "Séances", href: "/dashboard/training/history", icon: <Dumbbell size={18} /> },
    { name: "Réservations", href: "/dashboard/reservations", icon: <Calendar size={18} /> },
    {
      name: "Suivi",
      href: "#",
      icon: <Activity size={18} />,
      isDropdown: true,
      children: [
        { name: "Mensurations", href: "/dashboard/measurements" },
        { name: "Habitudes", href: "/dashboard/habits" },
        { name: "Statistiques", href: "/dashboard/statistics" },
      ],
    },
  ];

  // Navigation pour le rôle Coach
  const coachNavigation = [
    { name: "Accueil", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    {
      name: "Coaching",
      href: "#",
      icon: <Users size={18} />,
      isDropdown: true,
      children: [
        { name: "Mes Élèves", href: "/dashboard/students" },
        { name: "Séances Élèves", href: "/dashboard/sessions" },
        { name: "Statistiques", href: "/dashboard/statistics" },
      ],
    },
    {
      name: "Agenda",
      href: "#",
      icon: <Calendar size={18} />,
      isDropdown: true,
      children: [
        { name: "Calendrier", href: "/dashboard/calendar" },
        { name: "Disponibilités", href: "/dashboard/availabilities" },
      ],
    },
    { name: "Paiements", href: "/dashboard/payments", icon: <Wallet size={18} /> },
    {
      name: "Mon espace",
      href: "#",
      icon: <UserCircle size={18} />,
      isDropdown: true,
      children: [
        { name: "Mes séances", href: "/dashboard/training/history" },
        { name: "Mon Plan", href: "/dashboard/training-plans" },
        { name: "Mes mensurations", href: "/dashboard/my-measurements" },
        { name: "Mes habitudes", href: "/dashboard/habits" },
      ],
    },
  ];

  // Sélectionner la navigation selon le rôle
  const navItems =
    userRole === "personnel"
      ? personalNavigation
      : userRole === "eleve"
      ? studentNavigation
      : coachNavigation;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header navItems={navItems} />

      {/* Main Content — mobile: compact top bar + bottom nav; desktop: standard top header */}
      <main className="pb-20 lg:pb-0" style={{ paddingTop: "calc(3rem + env(safe-area-inset-top))" }}>
        <Outlet />
      </main>

      {/* PWA install prompt — shown once if app not installed */}
      <InstallPrompt />

      {/* Onboarding tutorial — shown once for new users */}
      <OnboardingTutorial isOpen={showTutorial} onClose={handleTutorialClose} />
    </div>
  );
};

export default DashboardLayout;
