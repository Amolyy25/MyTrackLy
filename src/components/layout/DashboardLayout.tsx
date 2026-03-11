import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../pages/dashboard-new/header";
import { 
  Home, 
  Users, 
  Dumbbell, 
  Calendar, 
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
    { name: "Mensurations", href: "/dashboard/measurements", icon: <Ruler size={18} /> },
    { name: "Habitudes", href: "/dashboard/habits", icon: <ClipboardList size={18} /> },
    { name: "Statistiques", href: "/dashboard/statistics", icon: <PieChart size={18} /> },
  ];

  // Navigation pour le rôle Élève
  const studentNavigation = [
    { name: "Accueil", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Séances", href: "/dashboard/training/history", icon: <Dumbbell size={18} /> },
    { name: "Réservations", href: "/dashboard/reservations", icon: <Calendar size={18} /> },
    { name: "Mensurations", href: "/dashboard/measurements", icon: <Ruler size={18} /> },
    { name: "Habitudes", href: "/dashboard/habits", icon: <ClipboardList size={18} /> },
    { name: "Statistiques", href: "/dashboard/statistics", icon: <PieChart size={18} /> },
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
    </div>
  );
};

export default DashboardLayout;
