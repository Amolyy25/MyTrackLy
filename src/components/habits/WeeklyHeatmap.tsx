import React from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

interface WeeklyHeatmapProps {
  data: Array<{ date: string; completed: boolean }>;
  habitName?: string;
  size?: "sm" | "md" | "lg";
}

export function WeeklyHeatmap({ data, habitName, size = "md" }: WeeklyHeatmapProps) {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const daysLong = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  
  // Ensure we have exactly 7 days
  const heatmapData = data.length === 7 
    ? data 
    : [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split("T")[0],
          completed: false,
        };
      });

  const completedCount = heatmapData.filter((d) => d.completed).length;

  // Size configurations
  const cellSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const fontSize = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="space-y-3">
      {/* Header with habit name and completion count */}
      {habitName && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground truncate">{habitName}</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10">
            <span className="text-sm font-medium text-emerald-600">
              {completedCount}/7
            </span>
            <span className="text-xs text-muted-foreground">cette semaine</span>
          </div>
        </div>
      )}
      
      {/* Heatmap grid */}
      <div className="flex flex-col gap-1.5">
        {/* Day labels */}
        <div className="flex gap-1.5 justify-between px-0.5">
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                "font-medium text-muted-foreground text-center",
                cellSizes[size],
                "flex items-center justify-center",
                fontSize[size]
              )}
            >
              <span className="sm:hidden">{day}</span>
              <span className="hidden sm:inline">{daysLong[index]}</span>
            </div>
          ))}
        </div>
        
        {/* Day cells */}
        <div className="flex gap-1.5 justify-between">
          {heatmapData.map((day, index) => {
            const dateObj = new Date(day.date);
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const formattedDate = dateObj.toLocaleDateString("fr-FR", { 
              day: "numeric",
              month: "short"
            });
            
            return (
              <div
                key={index}
                className={cn(
                  "relative rounded-lg flex items-center justify-center transition-all duration-200",
                  cellSizes[size],
                  day.completed
                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/30"
                    : "bg-muted hover:bg-muted/80",
                  isToday && !day.completed && "ring-2 ring-primary/50 ring-offset-1 ring-offset-background"
                )}
                title={`${formattedDate}: ${day.completed ? "Complété ✓" : "Non complété"}`}
              >
                {day.completed && (
                  <Check className={cn("text-white", iconSize[size])} />
                )}
                {isToday && !day.completed && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend for accessibility */}
      {!habitName && (
        <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-muted" />
            <span>Non complété</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Complété</span>
          </div>
        </div>
      )}
    </div>
  );
}
