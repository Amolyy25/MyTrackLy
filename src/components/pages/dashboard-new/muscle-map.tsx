"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, RotateCcw } from "lucide-react"

// Muscle activation data based on recent workouts
const muscleData = {
  front: {
    chest: { name: "Pectoraux", intensity: 5, color: "#6366f1" },
    shoulders: { name: "Deltoïdes", intensity: 4, color: "#818cf8" },
    biceps: { name: "Biceps", intensity: 3, color: "#a5b4fc" },
    abs: { name: "Abdominaux", intensity: 2, color: "#c7d2fe" },
    quads: { name: "Quadriceps", intensity: 4, color: "#818cf8" },
  },
  back: {
    traps: { name: "Trapèzes", intensity: 3, color: "#a5b4fc" },
    lats: { name: "Dorsaux", intensity: 5, color: "#6366f1" },
    triceps: { name: "Triceps", intensity: 4, color: "#818cf8" },
    glutes: { name: "Fessiers", intensity: 2, color: "#c7d2fe" },
    hamstrings: { name: "Ischio-jambiers", intensity: 3, color: "#a5b4fc" },
    calves: { name: "Mollets", intensity: 1, color: "#e0e7ff" },
  },
}

const getIntensityLabel = (intensity: number) => {
  if (intensity >= 5) return "Intensément travaillé"
  if (intensity >= 3) return "Moyennement travaillé"
  if (intensity >= 1) return "Légèrement sollicité"
  return "Non travaillé"
}

export function MuscleMap() {
  const [view, setView] = useState<"front" | "back">("front")
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  const muscles = view === "front" ? muscleData.front : muscleData.back

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Carte musculaire</CardTitle>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </div>
          </div>
          <button
            onClick={() => setView(view === "front" ? "back" : "front")}
            className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            {view === "front" ? "Dos" : "Face"}
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Body silhouette SVG */}
        <div className="relative mx-auto w-full max-w-[180px]">
          <svg viewBox="0 0 100 200" className="w-full">
            {/* Head */}
            <circle cx="50" cy="18" r="12" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />

            {/* Neck */}
            <rect x="44" y="30" width="12" height="8" fill="#27272a" />

            {view === "front" ? (
              <>
                {/* Shoulders */}
                <ellipse
                  cx="30"
                  cy="45"
                  rx="12"
                  ry="8"
                  fill={muscleData.front.shoulders.color}
                  className="cursor-pointer animate-muscle-pulse transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("shoulders")}
                  style={{ animationDelay: "0.2s" }}
                />
                <ellipse
                  cx="70"
                  cy="45"
                  rx="12"
                  ry="8"
                  fill={muscleData.front.shoulders.color}
                  className="cursor-pointer animate-muscle-pulse transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("shoulders")}
                  style={{ animationDelay: "0.2s" }}
                />

                {/* Chest */}
                <ellipse
                  cx="50"
                  cy="55"
                  rx="20"
                  ry="12"
                  fill={muscleData.front.chest.color}
                  className="cursor-pointer animate-muscle-pulse transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("chest")}
                />

                {/* Arms / Biceps */}
                <rect
                  x="14"
                  y="50"
                  width="8"
                  height="30"
                  rx="4"
                  fill={muscleData.front.biceps.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("biceps")}
                />
                <rect
                  x="78"
                  y="50"
                  width="8"
                  height="30"
                  rx="4"
                  fill={muscleData.front.biceps.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("biceps")}
                />

                {/* Forearms */}
                <rect x="12" y="82" width="6" height="25" rx="3" fill="#3f3f46" />
                <rect x="82" y="82" width="6" height="25" rx="3" fill="#3f3f46" />

                {/* Abs */}
                <rect
                  x="38"
                  y="68"
                  width="24"
                  height="32"
                  rx="4"
                  fill={muscleData.front.abs.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("abs")}
                />

                {/* Quads */}
                <rect
                  x="32"
                  y="105"
                  width="14"
                  height="40"
                  rx="5"
                  fill={muscleData.front.quads.color}
                  className="cursor-pointer animate-muscle-pulse transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("quads")}
                  style={{ animationDelay: "0.4s" }}
                />
                <rect
                  x="54"
                  y="105"
                  width="14"
                  height="40"
                  rx="5"
                  fill={muscleData.front.quads.color}
                  className="cursor-pointer animate-muscle-pulse transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("quads")}
                  style={{ animationDelay: "0.4s" }}
                />

                {/* Lower legs */}
                <rect x="34" y="150" width="10" height="35" rx="4" fill="#3f3f46" />
                <rect x="56" y="150" width="10" height="35" rx="4" fill="#3f3f46" />
              </>
            ) : (
              <>
                {/* Traps */}
                <path
                  d="M35 38 Q50 32 65 38 L60 50 Q50 46 40 50 Z"
                  fill={muscleData.back.traps.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("traps")}
                />

                {/* Lats */}
                <path
                  d="M30 50 Q25 70 35 95 L45 90 Q40 70 42 52 Z"
                  fill={muscleData.back.lats.color}
                  className="cursor-pointer animate-muscle-pulse transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("lats")}
                />
                <path
                  d="M70 50 Q75 70 65 95 L55 90 Q60 70 58 52 Z"
                  fill={muscleData.back.lats.color}
                  className="cursor-pointer animate-muscle-pulse transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("lats")}
                />

                {/* Triceps */}
                <rect
                  x="14"
                  y="50"
                  width="8"
                  height="28"
                  rx="4"
                  fill={muscleData.back.triceps.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("triceps")}
                />
                <rect
                  x="78"
                  y="50"
                  width="8"
                  height="28"
                  rx="4"
                  fill={muscleData.back.triceps.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("triceps")}
                />

                {/* Forearms */}
                <rect x="12" y="80" width="6" height="25" rx="3" fill="#3f3f46" />
                <rect x="82" y="80" width="6" height="25" rx="3" fill="#3f3f46" />

                {/* Lower back */}
                <rect x="40" y="70" width="20" height="28" rx="4" fill="#27272a" />

                {/* Glutes */}
                <ellipse
                  cx="50"
                  cy="108"
                  rx="16"
                  ry="10"
                  fill={muscleData.back.glutes.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("glutes")}
                />

                {/* Hamstrings */}
                <rect
                  x="32"
                  y="118"
                  width="14"
                  height="30"
                  rx="5"
                  fill={muscleData.back.hamstrings.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("hamstrings")}
                />
                <rect
                  x="54"
                  y="118"
                  width="14"
                  height="30"
                  rx="5"
                  fill={muscleData.back.hamstrings.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("hamstrings")}
                />

                {/* Calves */}
                <rect
                  x="34"
                  y="152"
                  width="10"
                  height="32"
                  rx="4"
                  fill={muscleData.back.calves.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("calves")}
                />
                <rect
                  x="56"
                  y="152"
                  width="10"
                  height="32"
                  rx="4"
                  fill={muscleData.back.calves.color}
                  className="cursor-pointer transition-all hover:brightness-125"
                  onClick={() => setSelectedMuscle("calves")}
                />
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intensité</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-[#6366f1]" />
              <span className="text-xs text-muted-foreground">Intense</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-[#a5b4fc]" />
              <span className="text-xs text-muted-foreground">Moyen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-[#e0e7ff]" />
              <span className="text-xs text-muted-foreground">Léger</span>
            </div>
          </div>
        </div>

        {/* Selected muscle info */}
        {selectedMuscle && muscles[selectedMuscle as keyof typeof muscles] && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 animate-slide-in">
            <p className="text-sm font-semibold text-foreground">
              {muscles[selectedMuscle as keyof typeof muscles].name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getIntensityLabel(muscles[selectedMuscle as keyof typeof muscles].intensity)}(
              {muscles[selectedMuscle as keyof typeof muscles].intensity} exercices)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
