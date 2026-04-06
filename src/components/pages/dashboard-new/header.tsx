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
  isDropdown?: boolean;
  children?: { name: string; href: string }[];
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

  // Flatten nav items for the mobile bottom bar (max 5 items)
  const mobileBottomItems = navItems
    .flatMap((item) =>
      item.isDropdown && item.children
        ? item.children.map((child) => ({ ...child, icon: item.icon }))
        : [item]
    )
    .slice(0, 4);

  // Extra mobile items for the "more" sheet
  const mobileExtraItems = navItems
    .flatMap((item) =>
      item.isDropdown && item.children
        ? item.children.map((child) => ({ ...child, icon: item.icon }))
        : [item]
    )
    .slice(4);

  return (
    <>
      {/* ── Desktop Header (hidden on mobile) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border glass bg-background/80 backdrop-blur-md hidden lg:block">
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
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                MyTrack<span className="text-primary">Ly</span>
              </span>
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/20">
                {getRoleBadge()}
              </span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) =>
              item.isDropdown && item.children ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                        item.children.some(child => isActive(child.href))
                          ? "text-foreground bg-muted shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {item.icon && <span className="text-primary/70">{item.icon}</span>}
                      {item.name}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    {item.children.map((child) => (
                      <DropdownMenuItem
                        key={child.name}
                        className={`cursor-pointer flex items-center gap-2 px-3 py-2.5 my-0.5 rounded-md transition-colors ${
                          isActive(child.href)
                            ? "text-primary bg-primary/10 font-semibold"
                            : "text-foreground hover:bg-muted"
                        }`}
                        onClick={() => navigate(child.href)}
                      >
                        {child.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive(item.href)
                      ? "text-foreground bg-muted shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.icon && <span className={isActive(item.href) ? "text-primary" : "text-primary/60 group-hover:text-primary/80 transition-colors"}>{item.icon}</span>}
                  {item.name}
                  {isActive(item.href) && (
                    <span className="absolute bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Link>
              )
            )}
          </nav>

          {/* Actions Desktop */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground btn-press"
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-9 items-center gap-2 rounded-lg px-2 hover:bg-muted btn-press"
                >
                  <Avatar className="h-7 w-7 border-2 border-primary/30">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-card">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer" onClick={() => navigate("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  Mon Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer" onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="text-destructive hover:bg-destructive/10 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Mobile Top Bar (compact, only logo + key actions) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-border bg-background/90 backdrop-blur-md lg:hidden">
        <div className="flex h-full items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.svg" alt="MyTrackLy" className="h-7 w-7 object-contain" />
            <span className="text-base font-bold tracking-tight text-foreground">
              MyTrack<span className="text-primary">Ly</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Avatar className="h-6 w-6 border border-primary/30">
                    <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 border-border bg-card">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer" onClick={() => navigate("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  Mon Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer" onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="text-destructive hover:bg-destructive/10 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around h-14">
          {mobileBottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
                )}
                <span className={active ? "text-primary" : "text-muted-foreground"}>
                  {item.icon || <Menu className="h-5 w-5" />}
                </span>
                <span className="text-[10px] font-medium leading-none">{item.name}</span>
              </Link>
            );
          })}
          {/* "Plus" button if there are extra items */}
          {mobileExtraItems.length > 0 && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                mobileMenuOpen ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="text-[10px] font-medium leading-none">Plus</span>
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile "More" Sheet ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 bg-background border-t border-border rounded-t-2xl animate-in slide-in-from-bottom duration-200 max-h-[60vh] overflow-y-auto">
            <div className="p-4 space-y-1">
              {mobileExtraItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.icon && <span className={isActive(item.href) ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>

  );
}
