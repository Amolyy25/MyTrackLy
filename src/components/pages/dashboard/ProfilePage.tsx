import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { useTrainingStats } from "../../../hooks/useTrainingSessions";
import { useMeasurements } from "../../../hooks/useMeasurements";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  User,
  Mail,
  Shield,
  Target,
  Dumbbell,
  TrendingUp,
  Moon,
  Sun,
  LogOut,
  Edit2,
  Activity,
  Scale,
  ChevronRight,
  Settings,
  Calendar,
  Award,
  Camera,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { stats } = useTrainingStats();
  const { measurements } = useMeasurements();

  const latestMeasurement = measurements?.[0];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "coach": return "Coach";
      case "eleve": return "Élève";
      case "personnel": return "Personnel";
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "coach": return "bg-primary/10 text-primary border-primary/20";
      case "eleve": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default: return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
  };

  const getGoalLabel = (goal: string | null | undefined) => {
    switch (goal) {
      case "weight_loss": return "Perte de poids";
      case "weight_gain": return "Prise de poids";
      case "muscle_gain": return "Prise de muscle";
      case "maintenance": return "Maintien";
      default: return "Non défini";
    }
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
    }
  };

  const statCards = [
    { label: "Séances", value: stats?.totalSessions || 0, icon: Dumbbell, color: "text-primary", bg: "bg-primary/10" },
    { label: "Volume", value: `${((stats?.totalVolume || 0) / 1000).toFixed(1)}T`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Streak", value: `${stats?.currentStreak || 0}j`, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Poids", value: latestMeasurement?.bodyWeightKg ? `${latestMeasurement.bodyWeightKg}kg` : "—", icon: Scale, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground text-sm">Gérez vos informations personnelles</p>
          </div>
        </div>
        <Link to="/dashboard/settings">
          <Button variant="outline" className="rounded-xl h-11 px-6 gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card - Left */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Profile Card */}
          <Card className="border-border/50 bg-card overflow-hidden shadow-lg p-0">
            {/* Animated gradient background */}
            <div className="h-32 relative overflow-hidden -mt-[1px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-violet-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full" />
            </div>
            <CardContent className="relative pt-0 pb-6 px-6 -mt-px">
              <div className="-mt-16 flex flex-col items-center">
                {/* Avatar with glow effect */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-90 group-hover:scale-100 transition-transform" />
                  <Avatar className="h-28 w-28 border-4 border-card shadow-2xl relative">
                    <AvatarImage src="/athletic-woman-portrait.png" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-3xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status indicator */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-card shadow-lg">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>

                  <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 border shadow-sm ${getRoleColor(user?.role || "")}`}>
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-semibold">{getRoleLabel(user?.role || "")}</span>
                  </div>
                </div>

                {/* Member since info */}
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Membre depuis janvier 2026</span>
                </div>

                <div className="mt-5 w-full">
                  <Button variant="outline" className="w-full rounded-xl h-11 gap-2 hover:bg-primary/5 transition-colors" disabled>
                    <Edit2 className="h-4 w-4" />
                    Modifier le profil
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase ml-auto">Soon</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Statistiques</p>
                  <p className="text-xs text-muted-foreground">Votre progression</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {statCards.map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl bg-background border border-border/50">
                    <div className={`${stat.bg} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Toggle */}
          <Card className="border-border/50 bg-card">
            <CardContent className="p-4">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme === "dark" ? "bg-primary/10" : "bg-amber-500/10"}`}>
                    {theme === "dark" ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Thème</p>
                    <p className="text-sm text-muted-foreground">
                      {theme === "dark" ? "Mode sombre" : "Mode clair"}
                    </p>
                  </div>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Right */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Info */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Informations personnelles
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Vos informations de base
                </p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/50">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nom complet</p>
                      <p className="font-medium text-foreground">{user?.name || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/50">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground truncate">{user?.email || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/50">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rôle</p>
                      <p className="font-medium text-foreground">{getRoleLabel(user?.role || "")}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/50">
                      <Target className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Objectif</p>
                      <p className="font-medium text-foreground">{getGoalLabel(user?.goalType)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coach Info (for students) */}
          {user?.role === "eleve" && user?.coach && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {user.coach.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-xs text-primary font-medium mb-0.5">Mon Coach</p>
                    <p className="font-bold text-foreground text-lg">{user.coach.name}</p>
                    <p className="text-sm text-muted-foreground">{user.coach.email}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" disabled>
                    <Mail className="h-4 w-4 mr-2" />
                    Contacter
                    <span className="text-[10px] px-1 py-0.5 rounded bg-muted ml-1">Soon</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Summary */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Activité récente
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre historique d'entraînement
                </p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-3xl font-bold text-foreground">{stats?.thisWeekSessions || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-3xl font-bold text-foreground">{stats?.thisMonthSessions || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-3xl font-bold text-foreground">{stats?.totalSessions || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <p className="text-3xl font-bold text-primary">{stats?.currentStreak || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Jours consécutifs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/dashboard/training/history">
              <Card className="border-border/50 bg-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Mes séances</p>
                    <p className="text-sm text-muted-foreground">Voir l'historique</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/dashboard/measurements">
              <Card className="border-border/50 bg-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:scale-110 transition-transform">
                    <Scale className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Mensurations</p>
                    <p className="text-sm text-muted-foreground">Suivre mon évolution</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Danger Zone */}
          <Card className="border-destructive/20 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-destructive/20">
                <h2 className="font-semibold text-destructive">Zone de danger</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Actions irréversibles sur votre compte
                </p>
              </div>
              <div className="p-5 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
