import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../pages/dashboard-new/header";
import InstallPrompt from "../ui/InstallPrompt";
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

      {/* Main Content with top padding to account for fixed header */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* PWA install prompt — shown once if app not installed */}
      <InstallPrompt />
    </div>
  );
};

export default DashboardLayout;
