import { ChevronRight, Brain } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function Tips() {
  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute right-20 bottom-0 h-20 w-20 translate-y-4 rounded-full bg-chart-2/10 blur-xl" />

          <CardContent className="flex items-center gap-4 p-5 relative">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">Conseil Performance</h4>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  IA
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Pensez à vous hydrater pendant vos séances. Objectif: 500ml par heure d&apos;entraînement pour des
                performances optimales.
              </p>
            </div>
            <a
              href="#"
              className="hidden items-center gap-1 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors sm:flex btn-press"
            >
              En savoir plus
              <ChevronRight className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
