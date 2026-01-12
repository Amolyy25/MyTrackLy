"use client";

import {
  Dumbbell,
  Timer,
  Weight,
  ChevronRight,
  CheckCircle2,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Link } from "react-router-dom";

export interface ActivitySession {
  id: string;
  date: string;
  name: string;
  exercises: number;
  duration: string;
  volume: string;
  status: "completed" | "in-progress" | "pending" | "confirmed";
  studentName?: string;
  type?: "training" | "reservation";
  timestamp?: number; // Timestamp pour le tri chronologique
}

interface RecentActivityProps {
  sessions: ActivitySession[];
  title?: string;
  viewAllLink?: string;
  emptyMessage?: string;
  role?: "coach" | "eleve" | "personnel";
}

export function RecentActivity({
  sessions,
  title = "Activité récente",
  viewAllLink = "/dashboard/training/history",
  emptyMessage = "Aucune activité récente",
  role = "personnel",
}: RecentActivityProps) {
  const getStatusBadge = (session: ActivitySession) => {
    if (session.type === "reservation") {
      switch (session.status) {
        case "confirmed":
          return (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-chart-2/10 text-chart-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmée
            </div>
          );
        case "pending":
          return (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-chart-3/10 text-chart-3">
              <Clock className="h-3.5 w-3.5" />
              En attente
            </div>
          );
        default:
          return null;
      }
    }

    return (
      <div
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
          session.status === "completed"
            ? "bg-chart-2/10 text-chart-2"
            : "bg-primary/10 text-primary"
        }`}
      >
        {session.status === "completed" ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Clock className="h-3.5 w-3.5" />
        )}
        {session.status === "completed" ? "Terminé" : "En cours"}
      </div>
    );
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-2.5">
              {role === "coach" ? (
                <Calendar className="h-5 w-5 text-primary" />
              ) : (
                <Dumbbell className="h-5 w-5 text-primary" />
              )}
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {title}
            </CardTitle>
          </div>
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Tout voir
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            sessions.map((session, index) => (
              <div
                key={session.id}
                className="group flex cursor-pointer items-center justify-between px-5 py-4 transition-all hover:bg-muted/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${
                      session.type === "reservation"
                        ? "bg-gradient-to-br from-chart-4/20 to-chart-4/10"
                        : "bg-primary/10"
                    }`}
                  >
                    {session.type === "reservation" ? (
                      <Calendar className="h-5 w-5 text-chart-4" />
                    ) : (
                      <Dumbbell className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {session.name}
                      </h4>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{session.date}</span>
                      {session.studentName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {session.studentName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {session.type !== "reservation" && (
                    <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
                      <span className="flex items-center gap-1.5">
                        <Dumbbell className="h-3.5 w-3.5" />
                        {session.exercises}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Timer className="h-3.5 w-3.5" />
                        {session.duration}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Weight className="h-3.5 w-3.5 text-primary" />
                        {session.volume}
                      </span>
                    </div>
                  )}
                  {getStatusBadge(session)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
