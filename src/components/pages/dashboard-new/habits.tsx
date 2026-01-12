"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Moon, Salad, Footprints, Calendar, Check, Sparkles } from "lucide-react"

interface Habit {
  id: string
  icon: React.ElementType
  name: string
  completed: boolean
  weekProgress: number
}

const initialHabits: Habit[] = [
  { id: "1", icon: Droplets, name: "Boire 2L d'eau", completed: true, weekProgress: 5 },
  { id: "2", icon: Moon, name: "Dormir 8h", completed: true, weekProgress: 6 },
  { id: "3", icon: Salad, name: "Manger équilibré", completed: false, weekProgress: 3 },
  { id: "4", icon: Footprints, name: "10,000 pas", completed: true, weekProgress: 7 },
]

export function Habits() {
  const [habits, setHabits] = useState(initialHabits)
  const [animatingId, setAnimatingId] = useState<string | null>(null)

  const today = new Date()
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const toggleHabit = (id: string) => {
    const habit = habits.find((h) => h.id === id)
    if (habit && !habit.completed) {
      setAnimatingId(id)
      setTimeout(() => setAnimatingId(null), 600)
    }
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)))
  }

  const completedCount = habits.filter((h) => h.completed).length
  const totalCount = habits.length

  return (
    <Card className="border-border bg-card h-full">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/10 p-2.5">
              <Calendar className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Habitudes du jour</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">{dateFormatter.format(today)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-chart-2/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-chart-2" />
            <span className="text-sm font-semibold text-chart-2">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {habits.map((habit) => {
            const IconComponent = habit.icon
            const isAnimating = animatingId === habit.id

            return (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all overflow-hidden ${
                  habit.completed
                    ? "border-chart-2/30 bg-chart-2/5"
                    : "border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                } ${isAnimating ? "animate-success-pulse" : ""}`}
              >
                {/* Background pulse effect on completion */}
                {isAnimating && (
                  <div className="absolute inset-0 bg-chart-2/20 animate-[confetti-burst_0.5s_ease-out]" />
                )}

                <div
                  className={`relative rounded-xl p-3 transition-all ${
                    habit.completed
                      ? "bg-gradient-to-br from-chart-2/30 to-chart-2/10"
                      : "bg-secondary group-hover:bg-primary/10"
                  }`}
                >
                  <IconComponent
                    className={`h-5 w-5 transition-colors ${
                      habit.completed ? "text-chart-2" : "text-muted-foreground group-hover:text-primary"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <p
                    className={`font-medium transition-colors ${
                      habit.completed ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {habit.name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-3 rounded-full transition-colors ${
                          i < habit.weekProgress ? "bg-chart-2" : "bg-secondary"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-[10px] text-muted-foreground">{habit.weekProgress}/7</span>
                  </div>
                </div>

                {/* Custom checkbox */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
                    habit.completed
                      ? "border-chart-2 bg-chart-2"
                      : "border-muted-foreground/50 group-hover:border-primary"
                  }`}
                >
                  {habit.completed && <Check className="h-4 w-4 text-background" />}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
