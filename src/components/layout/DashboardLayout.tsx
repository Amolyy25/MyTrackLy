import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../pages/dashboard-new/header";

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();

  const userRole = user?.role || "personnel";

  // Navigation pour le rôle Personnel
  const personalNavigation = [
    { name: "Accueil", href: "/dashboard" },
    { name: "Séances", href: "/dashboard/training/history" },
    { name: "Mensurations", href: "/dashboard/measurements" },
  ];

  // Navigation pour le rôle Élève
  const studentNavigation = [
    { name: "Accueil", href: "/dashboard" },
    { name: "Séances", href: "/dashboard/training/history" },
    { name: "Réservations", href: "/dashboard/reservations" },
    { name: "Mensurations", href: "/dashboard/measurements" },
  ];

  // Navigation pour le rôle Coach
  const coachNavigation = [
    { name: "Accueil", href: "/dashboard" },
    { name: "Élèves", href: "/dashboard/students" },
    { name: "Séances", href: "/dashboard/sessions" },
    { name: "Calendrier", href: "/dashboard/calendar" },
    { name: "Disponibilités", href: "/dashboard/availabilities" },
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
