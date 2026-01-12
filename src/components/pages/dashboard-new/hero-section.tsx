import { Plus, TrendingUp, Calendar, Play, Users, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  userName: string;
  sessionsThisMonth: number;
  role: "coach" | "eleve" | "personnel";
  studentsCount?: number;
  upcomingReservations?: number;
}

export function HeroSection({
  userName,
  sessionsThisMonth,
  role,
  studentsCount = 0,
  upcomingReservations = 0,
}: HeroSectionProps) {
  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedDate = dateFormatter.format(today);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getSubtitle = () => {
    if (role === "coach") {
      if (studentsCount === 0) {
        return "Invitez vos premiers élèves pour commencer à les accompagner.";
      }
      return `Vous accompagnez ${studentsCount} élève${
        studentsCount > 1 ? "s" : ""
      } dans leur progression.`;
    }
    if (sessionsThisMonth === 0) {
      return "Commencez votre première séance pour suivre vos progrès.";
    }
    return "Continuez sur cette lancée, votre régularité paie !";
  };

  return (
    <section className="relative overflow-hidden border-b border-border px-4 py-12 lg:px-8 lg:py-16 bg-gradient-hero">
      <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-[100px]" />
      <div className="absolute left-0 bottom-0 h-[300px] w-[300px] -translate-x-1/3 translate-y-1/3 rounded-full bg-chart-2/5 blur-[80px]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-[1600px]">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="capitalize">{formattedDate}</span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl">
          {getGreeting()}, <span className="text-gradient">{userName}</span>
        </h1>

        <p className="mt-3 text-base text-muted-foreground max-w-xl lg:text-lg">
          {getSubtitle()}
        </p>

        {/* Stats pills */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {role === "coach" ? (
            <>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  <span className="text-primary font-bold">
                    {studentsCount}
                  </span>{" "}
                  élève{studentsCount !== 1 ? "s" : ""}
                </span>
              </div>
              {upcomingReservations > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-chart-2/10 border border-chart-2/20 px-4 py-2">
                  <Clock className="h-4 w-4 text-chart-2" />
                  <span className="text-sm font-medium text-foreground">
                    <span className="text-chart-2 font-bold">
                      {upcomingReservations}
                    </span>{" "}
                    réservation{upcomingReservations !== 1 ? "s" : ""} à venir
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-full bg-chart-2/10 border border-chart-2/20 px-4 py-2">
                <TrendingUp className="h-4 w-4 text-chart-2" />
                <span className="text-sm font-medium text-foreground">
                  <span className="text-chart-2 font-bold">
                    {sessionsThisMonth} séance
                    {sessionsThisMonth !== 1 ? "s" : ""}
                  </span>{" "}
                  ce mois
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-3">
          {role === "coach" ? (
            <>
              <Link to="/dashboard/students">
                <Button className="group h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-5 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 btn-press transition-all">
                  <Users className="h-4 w-4" />
                  Gérer mes élèves
                </Button>
              </Link>
              <Link to="/dashboard/calendar">
                <Button
                  variant="outline"
                  className="h-11 gap-2 rounded-xl border-border bg-background/50 px-5 text-foreground hover:bg-muted hover:border-primary/30 btn-press transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  Voir le calendrier
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard/training/new">
                <Button className="group h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-5 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 btn-press transition-all">
                  <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                  Nouvelle séance
                </Button>
              </Link>
              <Link to="/dashboard/training/history">
                <Button
                  variant="outline"
                  className="h-11 gap-2 rounded-xl border-border bg-background/50 px-5 text-foreground hover:bg-muted hover:border-primary/30 btn-press transition-all"
                >
                  <Play className="h-4 w-4" />
                  Voir l'historique
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
