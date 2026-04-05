import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useAuth } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";
import {
  Building,
  Building2,
  Globe,
  FileText,
  CheckCircle2,
} from "lucide-react";
import LoadingSpinner from "../../../composants/LoadingSpinner";
import API_URL from "../../../../config/api";

interface FiscalModalProps {
  children: React.ReactNode;
}

export const FiscalModal: React.FC<FiscalModalProps> = ({ children }) => {
  const { user, refetchUser } = useAuth();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: user?.businessName || "",
    businessSiret: user?.businessSiret || "",
    businessAddress: user?.businessAddress || "",
    taxStatus: user?.taxStatus || "AUTO_ENTREPRENEUR",
    isTaxExempt: user?.isTaxExempt ?? true,
    taxRate: user?.taxRate || 20,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        businessName: user?.businessName || "",
        businessSiret: user?.businessSiret || "",
        businessAddress: user?.businessAddress || "",
        taxStatus: user?.taxStatus || "AUTO_ENTREPRENEUR",
        isTaxExempt: user?.isTaxExempt ?? true,
        taxRate: user?.taxRate || 20,
      });
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      await refetchUser();
      showToast("Informations fiscales mises à jour avec succès", "success");
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des infos fiscales", error);
      showToast("Erreur lors de la mise à jour", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Building className="h-5 w-5 text-primary" />
            </div>
            Informations Fiscales
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nom de l'entreprise / Prénom Nom
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  placeholder="Ex: John Doe Coaching"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Numéro SIRET
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.businessSiret}
                  onChange={(e) =>
                    setFormData({ ...formData, businessSiret: e.target.value })
                  }
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  placeholder="14 chiffres"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Adresse de facturation
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  value={formData.businessAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessAddress: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
                  placeholder="123 rue de la Paix, 75000 Paris"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Statut Fiscal
              </label>
              <select
                value={formData.taxStatus}
                onChange={(e) =>
                  setFormData({ ...formData, taxStatus: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              >
                <option value="AUTO_ENTREPRENEUR">Auto-entrepreneur</option>
                <option value="SOCIETE">Société (SAS, SARL...)</option>
                <option value="PARTICULIER">Particulier</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground mb-1 block">
                Assujetti à la TVA
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isTaxExempt"
                    checked={formData.isTaxExempt === true}
                    onChange={() =>
                      setFormData({ ...formData, isTaxExempt: true })
                    }
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">
                    Exonéré (non assujetti)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isTaxExempt"
                    checked={formData.isTaxExempt === false}
                    onChange={() =>
                      setFormData({ ...formData, isTaxExempt: false })
                    }
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Assujetti</span>
                </label>
              </div>
            </div>

            {!formData.isTaxExempt && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Taux de TVA (%)
                </label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxRate: parseFloat(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="mr-3"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" message="" fullScreen={false} />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
