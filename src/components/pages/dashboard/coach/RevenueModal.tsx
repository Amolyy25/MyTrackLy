import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Euro, TrendingUp, Wallet, History, FileText } from "lucide-react";
import API_URL from "../../../../config/api";
import { useAuth } from "../../../../contexts/AuthContext";

export function RevenueModal({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [earnings, setEarnings] = useState<{
    totalEarnings: number;
    transactionCount: number;
    transactions: any[];
  } | null>(null);
  const [stats, setStats] = useState<{
    currentMonthRevenue: number;
    lastMonthRevenue: number;
    evolution: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user?.stripeOnboardingComplete) {
      fetchData();
    }
  }, [open, user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const [earningsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/stripe/earnings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/stripe/revenue-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (earningsRes.ok) {
        setEarnings(await earningsRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Fetch revenue error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== "coach") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4 text-emerald-500" />
            Mes Revenus
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-emerald-500" />
            Statistiques Financières
          </DialogTitle>
          <DialogDescription>
            Aperçu de vos revenus et dernières transactions
          </DialogDescription>
        </DialogHeader>

        {!user?.stripeOnboardingComplete ? (
          <div className="p-8 text-center bg-muted/10 rounded-xl">
            <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Compte Stripe non configuré
            </h3>
            <p className="text-sm text-muted-foreground">
              Configurez votre compte Stripe dans l'onglet Paiements pour voir
              vos revenus.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                <p className="text-sm text-emerald-600/80 font-medium flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4" /> Revenus du mois
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600">
                    {stats?.currentMonthRevenue?.toFixed(2) || "0.00"} €
                  </span>
                  {stats && stats.evolution !== 0 && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${stats.evolution > 0 ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600"}`}
                    >
                      {stats.evolution > 0 ? "+" : ""}
                      {stats.evolution}%
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-muted/30 border border-border/50 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4" /> Gain Total Historique
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {earnings?.totalEarnings?.toFixed(2) || "0.00"} €
                  </span>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="border border-border/50 rounded-xl overflow-hidden">
              <div className="bg-muted/30 p-3 border-b border-border/50 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Dernières transactions
                </h3>
              </div>
              <div className="divide-y divide-border/50 max-h-[250px] overflow-y-auto">
                {earnings?.transactions && earnings.transactions.length > 0 ? (
                  earnings.transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {tx.studentName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {tx.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.sessionType} •{" "}
                            {new Date(tx.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-500">
                          +{tx.amount?.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Aucune transaction récente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
