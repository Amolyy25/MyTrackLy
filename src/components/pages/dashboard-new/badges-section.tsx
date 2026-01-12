"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Flame, Dumbbell, Lock, ChevronRight, Star, Crown, Medal } from "lucide-react"

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ElementType
  unlocked: boolean
  progress?: number
  maxProgress?: number
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: string
}

const badges: Badge[] = [
  {
    id: "1",
    name: "Streak 7 jours",
    description: "Une semaine de discipline !",
    icon: Flame,
    unlocked: true,
    rarity: "common",
    unlockedAt: "Hier",
  },
  {
    id: "2",
    name: "50 Séances",
    description: "Demi-centurion du fitness",
    icon: Dumbbell,
    unlocked: true,
    rarity: "rare",
    unlockedAt: "Il y a 2 semaines",
  },
  {
    id: "3",
    name: "Record Volume",
    description: "Nouveau PR de volume !",
    icon: Trophy,
    unlocked: true,
    rarity: "epic",
    unlockedAt: "Il y a 3 jours",
  },
  {
    id: "4",
    name: "Streak 30 jours",
    description: "Un mois de discipline !",
    icon: Crown,
    unlocked: false,
    progress: 7,
    maxProgress: 30,
    rarity: "legendary",
  },
  {
    id: "5",
    name: "100 Séances",
    description: "Centurion du fitness",
    icon: Medal,
    unlocked: false,
    progress: 42,
    maxProgress: 100,
    rarity: "epic",
  },
  {
    id: "6",
    name: "Titan du Bench",
    description: "100kg au développé couché",
    icon: Star,
    unlocked: false,
    progress: 80,
    maxProgress: 100,
    rarity: "legendary",
  },
]

const rarityStyles = {
  common: {
    bg: "from-zinc-500/20 to-zinc-600/10",
    border: "border-zinc-500/30",
    text: "text-zinc-400",
    glow: "",
  },
  rare: {
    bg: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    glow: "shadow-blue-500/20",
  },
  epic: {
    bg: "from-primary/20 to-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    glow: "shadow-primary/20",
  },
  legendary: {
    bg: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/30",
  },
}

export function BadgesSection() {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const unlockedCount = badges.filter((b) => b.unlocked).length

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-2.5">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Badges & Achievements</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {unlockedCount}/{badges.length} débloqués
                  </p>
                </div>
              </div>
              <a
                href="/badges"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
              >
                Tout voir
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {badges.map((badge) => {
                const style = rarityStyles[badge.rarity]
                const IconComponent = badge.icon

                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`group relative cursor-pointer rounded-xl border p-4 transition-all ${
                      badge.unlocked
                        ? `bg-gradient-to-br ${style.bg} ${style.border} hover:scale-105 ${style.glow} shadow-lg`
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    }`}
                  >
                    {/* Badge icon */}
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                        badge.unlocked ? `bg-gradient-to-br ${style.bg} animate-badge-shine` : "bg-muted"
                      }`}
                    >
                      {badge.unlocked ? (
                        <IconComponent
                          className={`h-7 w-7 ${style.text} ${badge.rarity === "legendary" ? "animate-glow" : ""}`}
                        />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Badge name */}
                    <p
                      className={`mt-3 text-center text-xs font-semibold ${
                        badge.unlocked ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {badge.name}
                    </p>

                    {/* Progress bar for locked badges */}
                    {!badge.unlocked && badge.progress !== undefined && (
                      <div className="mt-2">
                        <div className="h-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary/50"
                            style={{ width: `${(badge.progress / (badge.maxProgress || 1)) * 100}%` }}
                          />
                        </div>
                        <p className="mt-1 text-center text-[10px] text-muted-foreground">
                          {badge.progress}/{badge.maxProgress}
                        </p>
                      </div>
                    )}

                    {/* Unlocked date */}
                    {badge.unlocked && badge.unlockedAt && (
                      <p className="mt-1 text-center text-[10px] text-muted-foreground">{badge.unlockedAt}</p>
                    )}

                    {/* Rarity indicator */}
                    {badge.unlocked && (
                      <div
                        className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                          badge.rarity === "legendary"
                            ? "bg-amber-400"
                            : badge.rarity === "epic"
                              ? "bg-primary"
                              : badge.rarity === "rare"
                                ? "bg-blue-400"
                                : "bg-zinc-400"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
