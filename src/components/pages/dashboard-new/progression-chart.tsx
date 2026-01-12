"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

const data7d = [
  { date: "Lun", volume: 1800 },
  { date: "Mar", volume: 0 },
  { date: "Mer", volume: 2200 },
  { date: "Jeu", volume: 0 },
  { date: "Ven", volume: 2100 },
  { date: "Sam", volume: 2400 },
  { date: "Dim", volume: 2340 },
]

const data30d = [
  { date: "S1", volume: 8500 },
  { date: "S2", volume: 9100 },
  { date: "S3", volume: 7800 },
  { date: "S4", volume: 10200 },
]

const periods = ["7J", "30J", "3M", "1A"] as const

export function ProgressionChart() {
  const [activePeriod, setActivePeriod] = useState<(typeof periods)[number]>("7J")
  const data = activePeriod === "7J" ? data7d : data30d

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-2.5">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Progression</CardTitle>
                <p className="text-sm text-muted-foreground">Volume soulevé par période</p>
              </div>
            </div>
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {periods.map((period) => (
                <Button
                  key={period}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActivePeriod(period)}
                  className={`h-8 rounded-lg px-4 text-sm font-medium transition-all btn-press ${
                    activePeriod === period
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {period}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full lg:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111113",
                      border: "1px solid #27272a",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    }}
                    labelStyle={{ color: "#fafafa", fontWeight: 600, marginBottom: 4 }}
                    itemStyle={{ color: "#8b5cf6" }}
                    formatter={(value: number) => [`${value.toLocaleString()} kg`, "Volume"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="url(#colorVolume)"
                    dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
                    activeDot={{
                      r: 8,
                      fill: "#8b5cf6",
                      stroke: "#0a0a0b",
                      strokeWidth: 3,
                      className: "animate-violet-pulse",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
