import React from "react";
import { Flame, Trophy } from "lucide-react";
import { cn } from "../../lib/utils";

interface StreakBadgeProps {
  currentStreak: number;
  bestStreak?: number;
  size?: "sm" | "md" | "lg";
  showBest?: boolean;
  variant?: "inline" | "card";
}

export function StreakBadge({
  currentStreak,
  bestStreak,
  size = "md",
  showBest = false,
  variant = "inline",
}: StreakBadgeProps) {
  const getFlameSize = () => {
    if (currentStreak >= 100) return "h-6 w-6";
    if (currentStreak >= 30) return "h-5 w-5";
    if (currentStreak >= 7) return "h-4 w-4";
    return "h-3.5 w-3.5";
  };

  const getFlameColor = () => {
    if (currentStreak >= 100) return "text-orange-600";
    if (currentStreak >= 30) return "text-orange-500";
    if (currentStreak >= 7) return "text-orange-400";
    if (currentStreak > 0) return "text-orange-300";
    return "text-muted-foreground";
  };

  const getBgColor = () => {
    if (currentStreak >= 30) return "bg-orange-500/15";
    if (currentStreak >= 7) return "bg-orange-500/10";
    if (currentStreak > 0) return "bg-orange-500/5";
    return "bg-muted";
  };

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const paddingClasses = {
    sm: "px-2 py-0.5",
    md: "px-2.5 py-1",
    lg: "px-3 py-1.5",
  };

  if (variant === "card") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
          <Flame className={cn(getFlameSize(), getFlameColor(), currentStreak > 0 && "animate-pulse")} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">jour{currentStreak !== 1 ? "s" : ""}</span>
          </div>
          {showBest && bestStreak !== undefined && bestStreak > currentStreak && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" />
              <span>Record: {bestStreak}j</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className={cn(
        "flex items-center gap-1.5 rounded-full",
        paddingClasses[size],
        getBgColor()
      )}>
        <Flame
          className={cn(
            getFlameSize(),
            getFlameColor(),
            currentStreak > 0 && "animate-pulse"
          )}
        />
        <span className={cn("font-semibold text-foreground", sizeClasses[size])}>
          {currentStreak} jour{currentStreak !== 1 ? "s" : ""}
        </span>
      </div>
      
      {showBest && bestStreak !== undefined && bestStreak > currentStreak && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" />
          <span className={cn("text-xs", sizeClasses[size])}>
            Record: {bestStreak}j
          </span>
        </div>
      )}
    </div>
  );
}
