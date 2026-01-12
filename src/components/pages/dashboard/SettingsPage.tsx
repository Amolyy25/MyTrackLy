import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { useToast } from "../../../contexts/ToastContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Shield,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  User,
  Palette,
  Clock,
  Calendar,
  Dumbbell,
  LogOut,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";

// Toggle Component
interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, disabled }) => (
  <button
    onClick={disabled ? undefined : onChange}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    } ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        enabled ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  onClick?: () => void;
  soon?: boolean;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  action,
  onClick,
  soon,
  danger,
}) => (
  <div
    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
      onClick && !soon ? "cursor-pointer hover:bg-muted/50" : ""
    } ${danger ? "hover:bg-destructive/5" : ""}`}
    onClick={!soon ? onClick : undefined}
  >
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
        danger ? "bg-destructive/10" : "bg-muted"
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-medium ${danger ? "text-destructive" : "text-foreground"} flex items-center gap-2`}>
          {title}
          {soon && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
              Soon
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="flex-shrink-0 ml-4">
      {action || (onClick && !soon && <ChevronRight className="h-5 w-5 text-muted-foreground" />)}
    </div>
  </div>
);

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showStats: true,
  });

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
    }
  };

  const handleDeleteAccount = () => {
    showToast("Cette fonctionnalité sera bientôt disponible", "info");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 lg:px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Paramètres</h1>
          <p className="text-muted-foreground text-sm">Personnalisez votre expérience MyTrackLy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Apparence */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Apparence
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Personnalisez l'apparence de l'application
                </p>
              </div>
              <div className="divide-y divide-border">
                <SettingItem
                  icon={theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-amber-500" />}
                  title="Thème"
                  description={theme === "dark" ? "Mode sombre activé" : "Mode clair activé"}
                  action={<Toggle enabled={theme === "dark"} onChange={toggleTheme} />}
                />
                <SettingItem
                  icon={<Globe className="h-5 w-5 text-muted-foreground" />}
                  title="Langue"
                  description="Français"
                  soon
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérez vos préférences de notifications
                </p>
              </div>
              <div className="divide-y divide-border">
                <SettingItem
                  icon={<Mail className="h-5 w-5 text-muted-foreground" />}
                  title="Notifications par email"
                  description="Recevez des mises à jour par email"
                  action={<Toggle enabled={notifications.email} onChange={() => setNotifications(n => ({ ...n, email: !n.email }))} disabled />}
                  soon
                />
                <SettingItem
                  icon={<Smartphone className="h-5 w-5 text-muted-foreground" />}
                  title="Notifications push"
                  description="Notifications sur votre appareil"
                  action={<Toggle enabled={notifications.push} onChange={() => {}} disabled />}
                  soon
                />
                <SettingItem
                  icon={<Clock className="h-5 w-5 text-muted-foreground" />}
                  title="Rappels d'entraînement"
                  description="Recevez des rappels pour vos séances"
                  action={<Toggle enabled={notifications.reminders} onChange={() => setNotifications(n => ({ ...n, reminders: !n.reminders }))} disabled />}
                  soon
                />
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="border-border/50 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Sécurité & Confidentialité
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérez la sécurité de votre compte
                </p>
              </div>
              <div className="divide-y divide-border">
                <SettingItem
                  icon={<Lock className="h-5 w-5 text-muted-foreground" />}
                  title="Changer le mot de passe"
                  description="Modifiez votre mot de passe actuel"
                  onClick={() => showToast("Cette fonctionnalité sera bientôt disponible", "info")}
                  soon
                />
                <SettingItem
                  icon={<Eye className="h-5 w-5 text-muted-foreground" />}
                  title="Visibilité du profil"
                  description={privacy.showProfile ? "Votre profil est visible" : "Votre profil est masqué"}
                  action={<Toggle enabled={privacy.showProfile} onChange={() => setPrivacy(p => ({ ...p, showProfile: !p.showProfile }))} disabled />}
                  soon
                />
                <SettingItem
                  icon={<Dumbbell className="h-5 w-5 text-muted-foreground" />}
                  title="Partage des statistiques"
                  description={privacy.showStats ? "Vos stats sont partagées avec votre coach" : "Vos stats sont privées"}
                  action={<Toggle enabled={privacy.showStats} onChange={() => setPrivacy(p => ({ ...p, showStats: !p.showStats }))} disabled />}
                  soon
                />
              </div>
            </CardContent>
          </Card>

          {/* Zone de danger */}
          <Card className="border-destructive/20 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="p-5 border-b border-destructive/20">
                <h2 className="font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Zone de danger
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Actions irréversibles sur votre compte
                </p>
              </div>
              <div className="divide-y divide-border">
                <SettingItem
                  icon={<LogOut className="h-5 w-5 text-destructive" />}
                  title="Se déconnecter"
                  description="Déconnexion de votre compte"
                  onClick={handleLogout}
                  danger
                />
                <SettingItem
                  icon={<Trash2 className="h-5 w-5 text-destructive" />}
                  title="Supprimer mon compte"
                  description="Suppression définitive de toutes vos données"
                  onClick={handleDeleteAccount}
                  danger
                  soon
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Account Info */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Compte</p>
                  <p className="text-xs text-muted-foreground">Informations</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Nom</span>
                  <span className="font-medium text-foreground">{user?.name || "—"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground text-right truncate max-w-[150px]">
                    {user?.email || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Rôle</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user?.role === "coach" 
                      ? "bg-primary/10 text-primary" 
                      : user?.role === "eleve"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {user?.role === "coach" ? "Coach" : user?.role === "eleve" ? "Élève" : "Personnel"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    Gratuit
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 rounded-xl"
                onClick={() => window.location.href = "/dashboard/profile"}
              >
                Voir mon profil
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm mb-1">Besoin d'aide ?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Consultez notre centre d'aide ou contactez le support.
                  </p>
                  <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs" disabled>
                    Centre d'aide
                    <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-muted">Soon</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Version */}
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">MyTrackLy</p>
              <p className="text-sm font-medium text-foreground">Version 1.0.0</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                © 2026 MyTrackLy. Tous droits réservés.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
