"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface HeaderProps {
  navItems: NavItem[];
}

export function Header({ navItems }: HeaderProps) {
  const [notifications] = useState(0); // Sera connecté à la DB plus tard
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/dashboard" && location.pathname === "/dashboard")
      return true;
    if (href !== "/dashboard" && location.pathname.startsWith(href))
      return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case "coach":
        return "Coach";
      case "eleve":
        return "Élève";
      default:
        return "Pro";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border glass bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
            <img
              src="/logo.svg"
              alt="MyTrackLy"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold tracking-tight text-foreground">
              MyTrack<span className="text-primary">Ly</span>
            </span>
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/20">
              {getRoleBadge()}
            </span>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive(item.href)
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.name}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground btn-press"
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground btn-press"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground animate-violet-pulse">
                {notifications}
              </span>
            )}
          </Button>

          {/* User Menu Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden sm:flex h-9 items-center gap-2 rounded-lg px-2 hover:bg-muted btn-press"
              >
                <Avatar className="h-7 w-7 border-2 border-primary/30">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground lg:inline">
                  {user?.name}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border-border bg-card"
            >
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-semibold text-foreground">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem
                className="text-foreground hover:bg-muted cursor-pointer"
                onClick={() => navigate("/dashboard/profile")}
              >
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                Mon Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground hover:bg-muted cursor-pointer"
                onClick={() => navigate("/dashboard/settings")}
              >
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 text-muted-foreground hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 border-b border-border bg-background/95 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border pt-3 mt-2">
              <div className="flex items-center gap-3 px-4 py-2">
                <Avatar className="h-8 w-8 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-2 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
