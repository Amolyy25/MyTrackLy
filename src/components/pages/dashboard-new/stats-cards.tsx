"use client";

import { useState, useEffect } from "react";
import {
  Dumbbell,
  BarChart3,
  Flame,
  Target,
  ArrowUpRight,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface StatsData {
  sessionsThisMonth: number;
  totalVolume: string;
  streakDays: number;
  weekActivity: boolean[];
  // Pour les coachs
  studentsCount?: number;
  upcomingReservations?: number;
}

interface StatsCardsProps {
  stats: StatsData;
  role: "coach" | "eleve" | "personnel";
}

export function StatsCards({ stats, role }: StatsCardsProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  if (role === "coach") {
    return (
      <section className="px-4 py-6 lg:px-8">
        <div className="mx-auto grid max-w-[1600px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Élèves actifs */}
          <Card className="group border-border bg-card card-hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Élèves actifs
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold tracking-tight text-foreground ${
                      animated ? "animate-number-pop" : ""
                    }`}
                  >
                    {stats.studentsCount ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 group-hover:animate-float">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Élèves sous votre coaching
              </div>
            </CardContent>
          </Card>

          {/* Réservations à venir */}
          <Card className="group border-border bg-card card-hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Réservations
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold tracking-tight text-foreground ${
                      animated ? "animate-number-pop" : ""
                    }`}
                  >
                    {stats.upcomingReservations ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/10 p-3 group-hover:animate-float">
                  <Calendar className="h-5 w-5 text-chart-2" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                À venir cette semaine
              </div>
            </CardContent>
          </Card>

          {/* Séances élèves ce mois */}
          <Card className="group border-border bg-card card-hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Séances élèves
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold tracking-tight text-foreground ${
                      animated ? "animate-number-pop" : ""
                    }`}
                  >
                    {stats.sessionsThisMonth}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/10 p-3 group-hover:animate-float">
                  <Dumbbell className="h-5 w-5 text-chart-3" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Ce mois-ci
              </div>
            </CardContent>
          </Card>

          {/* Volume total élèves */}
          <Card className="group border-border bg-card card-hover-lift overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-4/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Volume total
                  </p>
                  <p
                    className={`mt-2 text-3xl font-bold tracking-tight text-foreground ${
                      animated ? "animate-number-pop" : ""
                    }`}
                  >
                    {stats.totalVolume}
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-chart-4/20 to-chart-4/10 p-3 group-hover:animate-float">
                  <BarChart3 className="h-5 w-5 text-chart-4" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Soulevé par vos élèves
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Vue pour élève et personnel
  return (
    <section className="px-4 py-6 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sessions Card */}
        <Card className="group border-border bg-card card-hover-lift overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Séances
                </p>
                <p
                  className={`mt-2 text-3xl font-bold tracking-tight text-foreground ${
                    animated ? "animate-number-pop" : ""
                  }`}
                >
                  {stats.sessionsThisMonth}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 group-hover:animate-float">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">Ce mois-ci</div>
          </CardContent>
        </Card>

        {/* Volume Card */}
        <Card className="group border-border bg-card card-hover-lift overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Volume total
                </p>
                <p
                  className={`mt-2 text-3xl font-bold tracking-tight text-foreground ${
                    animated ? "animate-number-pop" : ""
                  }`}
                >
                  {stats.totalVolume}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/10 p-3 group-hover:animate-float">
                <BarChart3 className="h-5 w-5 text-chart-2" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Total soulevé
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="group border-border bg-card card-hover-lift overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-chart-3/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Streak actuel
                </p>
                <p
                  className={`mt-2 text-3xl font-bold tracking-tight text-foreground ${
                    animated ? "animate-number-pop" : ""
                  }`}
                >
                  {stats.streakDays}
                  <span className="text-lg font-normal text-muted-foreground">
                    {" "}
                    jours
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/10 p-3">
                <Flame className="h-5 w-5 text-chart-3 animate-flame" />
              </div>
            </div>
            <div className="mt-4 flex gap-1">
              {stats.weekActivity.map((active, i) => (
                <div
                  key={i}
                  className={`h-6 flex-1 rounded-md transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-t from-chart-2 to-chart-2/70 shadow-sm shadow-chart-2/30"
                      : "bg-secondary"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Objectif - Soon */}
        <Card className="group border-border bg-card card-hover-lift overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Objectif mensuel
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="badge-soon">
                    <Clock className="h-3 w-3" />
                    Soon
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-muted to-muted/50 p-3 opacity-50">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-0 rounded-full bg-muted-foreground/30" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Définissez vos objectifs bientôt
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
