"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Target, ChevronRight, X, Lightbulb, Dumbbell } from "lucide-react"

interface Insight {
  id: string
  type: "suggestion" | "warning" | "prediction" | "tip"
  icon: React.ElementType
  title: string
  message: string
  action?: string
  priority: "high" | "medium" | "low"
}

const insights: Insight[] = [
  {
    id: "1",
    type: "suggestion",
    icon: Dumbbell,
    title: "Déséquilibre détecté",
    message: "Vous avez travaillé le haut du corps 2x plus que le bas cette semaine. Ajoutez une séance jambes ?",
    action: "Créer séance Jambes",
    priority: "high",
  },
  {
    id: "2",
    type: "prediction",
    icon: Target,
    title: "Objectif en vue",
    message: "À ce rythme, vous atteindrez 50 séances le 28 janvier (dans 19 jours)",
    priority: "medium",
  },
  {
    id: "3",
    type: "tip",
    icon: Lightbulb,
    title: "Optimisation repos",
    message: "Vos meilleures performances sont après 2 jours de repos. Prochaine séance suggérée : Vendredi",
    priority: "low",
  },
]

const priorityStyles = {
  high: "border-primary/30 bg-primary/5",
  medium: "border-chart-2/30 bg-chart-2/5",
  low: "border-chart-4/30 bg-chart-4/5",
}

const iconStyles = {
  high: "text-primary bg-primary/10",
  medium: "text-chart-2 bg-chart-2/10",
  low: "text-chart-4 bg-chart-4/10",
}

export function AiInsights() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  const visibleInsights = insights.filter((i) => !dismissedIds.includes(i.id))

  if (visibleInsights.length === 0) return null

  return (
    <section className="px-4 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Suggestions IA</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {visibleInsights.length} nouvelle{visibleInsights.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleInsights.map((insight) => {
            const IconComponent = insight.icon

            return (
              <Card
                key={insight.id}
                className={`group relative border ${priorityStyles[insight.priority]} card-hover-lift animate-slide-in`}
              >
                <button
                  onClick={() => setDismissedIds([...dismissedIds, insight.id])}
                  className="absolute right-2 top-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 rounded-lg p-2 ${iconStyles[insight.priority]}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{insight.message}</p>

                      {insight.action && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3 h-7 gap-1 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
                        >
                          {insight.action}
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
