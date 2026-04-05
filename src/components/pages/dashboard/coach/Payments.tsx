import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";
import API_URL from "../../../../config/api";
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  History,
  Info,
  Euro,
  Building,
  FileText,
  Download,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { FiscalModal } from "./FiscalModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Payments: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [earnings, setEarnings] = useState<{
    totalEarnings: number;
    transactionCount: number;
    transactions: any[];
    revenueByClient: {
      studentName: string;
      totalRevenue: number;
      sessionCount: number;
    }[];
  } | null>(null);
  const [stats, setStats] = useState<{
    currentMonthRevenue: number;
    lastMonthRevenue: number;
    evolution: number;
  } | null>(null);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem("token");
      const [resEarnings, resStats] = await Promise.all([
        fetch(`${API_URL}/stripe/earnings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/stripe/revenue-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resEarnings.ok) {
        setEarnings(await resEarnings.json());
      }
      if (resStats.ok) {
        setStats(await resStats.json());
      }
    } catch (err) {
      console.error("Fetch errors:", err);
    }
  };

  const syncStatus = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/stripe/connect/sync-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await refetchUser();
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Si déjà connecté, on récupère les revenus
    if (user?.stripeOnboardingComplete) {
      fetchEarnings();
    }

    // Synchroniser le statut Stripe au montage au cas où le webhook a été raté
    if (user?.stripeAccountId) {
      syncStatus();
    } else {
      refetchUser();
    }

    // Vérifier si on revient d'un onboarding réussi
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "success") {
      showToast("Compte Stripe configuré avec succès !", "success");
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get("stripe") === "refresh") {
      showToast("L'onboarding a été interrompu.", "info");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Polling optionnel toutes les 10 secondes si on attend l'activation
    let interval: NodeJS.Timeout;
    if (
      user?.stripeAccountId &&
      (!user.stripeChargesEnabled || !user.stripeOnboardingComplete)
    ) {
      interval = setInterval(() => {
        syncStatus();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.stripeAccountId, user?.stripeOnboardingComplete]); // Se déclenche quand l'ID stripe apparaît ou l'onboarding change

  const handleCreateStripeAccount = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/stripe/connect/create-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Une fois le compte créé, on génère le lien d'onboarding
      handleOnboarding();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création du compte",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboarding = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/stripe/connect/create-account-link`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Rediriger vers Stripe
      window.location.href = data.url;
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Erreur lors de la génération du lien",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/stripe/connect/create-login-link`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      window.open(data.url, "_blank");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'accès au dashboard",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (
      !earnings ||
      !earnings.transactions ||
      earnings.transactions.length === 0
    )
      return;

    try {
      const doc = new jsPDF();

      const monthName = new Date().toLocaleString("fr-FR", { month: "long" });
      const year = new Date().getFullYear();

      // En-tête du PDF
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(
        `Récapitulatif Financier ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
        14,
        22,
      );

      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`MyTrackLy - Coach : ${user?.name}`, 14, 32);

      // Infos Fiscales du Coach
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `Entreprise : ${user?.businessName || user?.name || "Non renseigné"}`,
        14,
        45,
      );
      if (user?.businessSiret)
        doc.text(`SIRET : ${user.businessSiret}`, 14, 52);
      if (user?.businessAddress)
        doc.text(`Adresse : ${user.businessAddress}`, 14, 59);

      // Résumé Mois
      const totalHT = stats?.currentMonthRevenue || 0;
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`Revenus du mois (Net Coach) : ${totalHT.toFixed(2)} €`, 14, 72);

      // Tableau Autotable
      const tableColumn = [
        "Date",
        "Client",
        "Type de séance",
        "Statut",
        "Gains Nets (€)",
      ];
      const tableRows: any[] = [];

      earnings.transactions.forEach((tx) => {
        const rowData = [
          new Date(tx.date).toLocaleDateString("fr-FR"),
          tx.studentName,
          tx.sessionType,
          tx.status === "confirmed" ? "Payé" : "En attente",
          `+${(tx.amount || 0).toFixed(2)}`,
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // Pied de page
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175); // gray-400
        doc.text(
          `Généré par MyTrackLy le ${new Date().toLocaleDateString("fr-FR")}`,
          14,
          doc.internal.pageSize.height - 10,
        );
        doc.text(
          `Page ${i} / ${pageCount}`,
          doc.internal.pageSize.width - 25,
          doc.internal.pageSize.height - 10,
        );
      }

      doc.save(`Recapitulatif_${monthName}_${year}.pdf`);
      showToast("PDF téléchargé avec succès", "success");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
      showToast("Erreur lors de la génération du document", "error");
    }
  };

  const getStatusDisplay = () => {
    if (!user?.stripeAccountId) {
      return {
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        icon: <AlertCircle className="h-5 w-5" />,
        text: "Non configuré",
        description:
          "Configurez votre compte Stripe pour recevoir des paiements.",
        action: (
          <Button
            onClick={handleCreateStripeAccount}
            disabled={isLoading}
            className="w-full sm:w-auto gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Activer mes paiements
          </Button>
        ),
      };
    }

    if (!user.stripeChargesEnabled || !user.stripeOnboardingComplete) {
      return {
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        icon: <RefreshCw className="h-5 w-5 animate-spin" />,
        text: "En attente de configuration",
        description:
          "Votre compte Stripe est créé mais l'onboarding n'est pas terminé.",
        action: (
          <Button
            onClick={handleOnboarding}
            variant="outline"
            disabled={isLoading}
            className="w-full sm:w-auto gap-2"
          >
            Compléter l'onboarding
          </Button>
        ),
      };
    }

    return {
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      icon: <CheckCircle2 className="h-5 w-5" />,
      text: "Compte Actif",
      description:
        "Votre compte Stripe est prêt. Vous pouvez recevoir des paiements.",
      action: (
        <Button
          onClick={handleOpenDashboard}
          variant="outline"
          disabled={isLoading}
          className="w-full sm:w-auto gap-2"
        >
          Dashboard Stripe <ExternalLink className="h-4 w-4" />
        </Button>
      ),
    };
  };

  const status = getStatusDisplay();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 shadow-sm">
            <Wallet className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Paiements & Revenus
            </h1>
            <p className="text-muted-foreground text-sm">
              Gérez votre compte Stripe et suivez vos gains
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className={`border-none ${status.bg} overflow-hidden`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${status.color}`}>{status.icon}</div>
                  <div>
                    <h2 className={`font-bold text-lg ${status.color}`}>
                      {status.text}
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md mt-1">
                      {status.description}
                    </p>
                  </div>
                </div>
                {status.action}
              </div>
            </CardContent>
          </Card>

          {/* Business Info (Placeholder/Mock) */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Informations Fiscales
                </h2>
                <FiscalModal>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Modifier
                  </Button>
                </FiscalModal>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Statut fiscal
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user?.taxStatus || "Auto-entrepreneur"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Numéro SIRET
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user?.businessSiret || "Non renseigné"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Adresse de facturation
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.businessAddress || "Non renseignée"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue By Client */}
          {user?.stripeOnboardingComplete &&
            earnings?.revenueByClient &&
            earnings.revenueByClient.length > 0 && (
              <Card className="border-border/50 bg-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Revenus par client (Top 5)
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {earnings.revenueByClient.map((client, idx) => (
                      <div
                        key={idx}
                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {client.studentName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {client.studentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {client.sessionCount} séance
                              {client.sessionCount > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-500">
                            +{client.totalRevenue?.toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Recent Transactions */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Dernières transactions
                </h2>
                {user?.stripeOnboardingComplete &&
                  earnings?.transactions &&
                  earnings.transactions.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs flex items-center gap-1.5"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Télécharger PDF
                    </Button>
                  )}
              </div>
              <div className="divide-y divide-border">
                {/* SI NON CONNECTÉ : On montre des mocks en prévisualisation */}
                {!user?.stripeOnboardingComplete ? (
                  <>
                    <div className="p-4 flex items-center justify-between opacity-50 grayscale select-none">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          JD
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Jean Dupont
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Séance Musculation • 12 Mar 2024
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          +60,00 €
                        </p>
                        <p className="text-[10px] text-emerald-500 font-medium font-serif italic">
                          Preview
                        </p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between opacity-50 grayscale select-none">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          ML
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Marie Laurent
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Séance Yoga • 10 Mar 2024
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          +45,00 €
                        </p>
                        <p className="text-[10px] text-emerald-500 font-medium font-serif italic">
                          Preview
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  /* SI CONNECTÉ : On montre les vrais données ou rien */
                  <>
                    {earnings?.transactions &&
                    earnings.transactions.length > 0 ? (
                      earnings.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {tx.studentName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {tx.studentName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tx.sessionType} •{" "}
                                {new Date(tx.date).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                              +{tx.amount?.toFixed(2)} €
                            </p>
                            {tx.invoiceUrl ? (
                              <a
                                href={tx.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline flex items-center gap-1 justify-end"
                              >
                                <FileText className="h-2.5 w-2.5" /> Facture
                              </a>
                            ) : (
                              <p className="text-[10px] text-emerald-500 font-medium">
                                Payé
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center bg-muted/10">
                        <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground">
                          Aucune transaction pour le moment.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vos revenus apparaîtront ici dès que vos élèves
                          paieront leurs séances.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-primary/90 to-primary shadow-lg shadow-primary/20 text-white overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <CardContent className="p-6 relative">
              <p className="text-primary-foreground/80 text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Revenus du mois
              </p>
              <h3 className="text-4xl font-black mt-2 tracking-tight">
                {(user?.stripeOnboardingComplete
                  ? stats?.currentMonthRevenue || 0
                  : 0
                ).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                <span className="text-2xl opacity-80 decoration-stone-500">
                  {" "}
                  €
                </span>
              </h3>
              {user?.stripeOnboardingComplete && stats && (
                <div className="mt-6 flex items-center gap-2 text-primary-foreground/90 text-xs text-secondary-foreground font-bold">
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${stats.evolution >= 0 ? "bg-white/20" : "bg-red-500/50"}`}
                  >
                    <ArrowUpRight
                      className={`h-3 w-3 ${stats.evolution < 0 ? "rotate-180" : ""}`}
                    />
                    {stats.evolution > 0 ? "+" : ""}
                    {stats.evolution}%
                  </span>
                  vs mois dernier ({stats.lastMonthRevenue.toFixed(2)} €)
                </div>
              )}
              {!user?.stripeOnboardingComplete && (
                <div className="mt-6 flex items-center gap-2 text-primary-foreground/90 text-xs text-secondary-foreground font-bold">
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="h-3 w-3" />
                    +0%
                  </span>
                  vs mois dernier
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-sm font-medium flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4" /> Total généré (historique)
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {(user?.stripeOnboardingComplete
                  ? earnings?.totalEarnings || 0
                  : 0
                ).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}{" "}
                €
              </h3>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="p-6 space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-muted-foreground" />
                Répartition des gains
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Parts Coach (Net)
                  </span>
                  <span className="font-bold text-foreground">90%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Frais plateforme
                  </span>
                  <span className="font-bold text-primary">10%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full w-[90%]" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed italic">
                La TVA est calculée selon votre statut fiscal et reversée
                directement sur votre compte Stripe. les frais de plateforme
                couvrent la maintenance et l'hébergement de MyTrackLy.
              </p>
            </CardContent>
          </Card>

          {/* Invoices Download Quick Access */}
          <Card className="border-border/50 bg-muted/20 border-dashed">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Besoin d'un récapitulatif comptable ?
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs rounded-lg"
                disabled
              >
                Télécharger le PDF du mois
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payments;
