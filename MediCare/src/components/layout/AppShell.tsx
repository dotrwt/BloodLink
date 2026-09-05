import { useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Link, useRouter } from "../../lib/router";
import type { Role } from "../../types/models";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNotifications } from "../../hooks/useNotifications";
import {
  Bell,
  Building,
  DropletFill,
  Home,
  List,
  LogOut,
  Menu,
  Phone,
  Plus,
  User,
  X,
  Zap,
} from "../../lib/icons";

type NavItem = { label: string; to: string; icon: typeof Home; isCenterAction?: boolean };

const REQUESTER_NAV: NavItem[] = [
  { label: "Home", to: "/app/requester", icon: Home },
  { label: "Request", to: "/app/requester/new", icon: Plus, isCenterAction: true },
  { label: "History", to: "/app/requester/history", icon: List },
  { label: "Alerts", to: "/app/notifications", icon: Bell },
  { label: "Profile", to: "/app/profile", icon: User },
];

const DONOR_NAV: NavItem[] = [
  { label: "Donor Hub", to: "/app/donor", icon: Home },
  { label: "Alerts", to: "/app/notifications", icon: Bell },
  { label: "Profile", to: "/app/profile", icon: User },
];

const BANK_NAV: NavItem[] = [
  { label: "Inventory", to: "/app/bank", icon: Home },
  { label: "Alerts", to: "/app/notifications", icon: Bell },
  { label: "Profile", to: "/app/profile", icon: User },
];

const ROLE_META: Record<Role, { label: string; tone: string; desc: string; icon: typeof User }> = {
  requester: {
    label: "Requester",
    tone: "bg-primary-soft text-primary border-primary/30",
    desc: "Coordinate patient requests & live dispatch",
    icon: User,
  },
  donor: {
    label: "Donor",
    tone: "bg-critical-soft text-critical border-critical/30",
    desc: "Respond to nearby blood emergencies",
    icon: DropletFill,
  },
  bank: {
    label: "Blood Bank",
    tone: "bg-urgent-soft text-urgent border-urgent/30",
    desc: "Manage storage units & hospital triage",
    icon: Building,
  },
};

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold tracking-tight select-none", className)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
        <DropletFill size={15} />
      </span>
      <span>BloodLink</span>
    </span>
  );
}

export function AppShell({
  children,
  title,
  active,
}: {
  role?: Role;
  children: ReactNode;
  title?: string;
  active?: string;
}) {
  const { path, navigate } = useRouter();
  const { user } = useCurrentUser();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect active role context from current path
  const currentRole: Role = path.startsWith("/app/donor")
    ? "donor"
    : path.startsWith("/app/bank")
    ? "bank"
    : "requester";

  const navItems =
    currentRole === "donor"
      ? DONOR_NAV
      : currentRole === "bank"
      ? BANK_NAV
      : REQUESTER_NAV;

  const isActive = (to: string) => {
    if (active) return to === active;
    if (to === "/app/requester" && (path === "/app/requester" || path === "/app/dashboard")) return true;
    return path === to;
  };

  const userName = user?.name || "Member";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleMeta = ROLE_META[currentRole];

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr] bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-border bg-card sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="px-5 h-16 flex items-center justify-between border-b border-border">
          <Link to="/"><Logo /></Link>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            v1.2
          </span>
        </div>

        {/* Signed In User Badge */}
        <div className="p-3">
          <div className="rounded-xl border border-border/70 bg-muted/40 p-2.5 flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs shrink-0">
              {userInitials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block size-1.5 rounded-full bg-success" />
                <p className="text-[11px] text-muted-foreground truncate">{user?.location || "Bengaluru"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="px-3 pb-3 border-b border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 px-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Active Workspace</span>
            <Link to="/select-role" className="text-primary hover:underline text-[11px] font-medium">
              Manage
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-muted/70 p-1 rounded-xl text-xs font-semibold">
            {(["donor", "requester", "bank"] as const).map((r) => (
              <Link
                key={r}
                to={`/app/${r}`}
                className={cn(
                  "py-1.5 text-center rounded-lg transition-all capitalize text-xs",
                  currentRole === r
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "requester" ? "Req" : r}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((it, i) => (
            <Link
              key={i}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                isActive(it.to)
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <it.icon size={18} className={cn("transition-transform group-hover:scale-105", isActive(it.to) ? "text-primary-foreground" : "text-muted-foreground")} />
              <span>{it.label}</span>
              {it.label === "Alerts" && unreadCount > 0 && (
                <span className="ml-auto font-num text-[11px] font-bold bg-critical text-critical-foreground rounded-full px-1.5 py-0.5 leading-none shadow-xs animate-bl-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Emergency Hotline Desk */}
        <div className="p-3 mx-3 mb-3 rounded-xl border border-critical/20 bg-critical-soft/40">
          <p className="text-[11px] font-bold text-critical uppercase tracking-wide flex items-center gap-1">
            <Zap size={13} /> 24/7 Blood Help Desk
          </p>
          <a
            href="tel:108"
            className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-critical transition-colors"
          >
            <Phone size={13} /> Dial 108 / +91 80 2200 4000
          </a>
        </div>

        {/* Sign Out */}
        <div className="p-3 border-t border-border">
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut size={17} /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div id="bl-scroll" className="min-w-0 lg:h-screen lg:overflow-y-auto pb-24 lg:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 border-b border-border/80 bg-background/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 transition-all">
          {/* Mobile Left: Menu Toggle + Logo */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex size-9 items-center justify-center rounded-xl text-foreground hover:bg-muted active:scale-95 transition-all touch-target"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center">
              <Logo className="text-sm" />
            </Link>
          </div>

          {/* Desktop Title */}
          {title && (
            <div className="hidden lg:flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">{title}</h1>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", roleMeta.tone)}>
                {roleMeta.label}
              </span>
            </div>
          )}

          {/* Right actions: Compact Role Pill + Notifications + Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Mobile Role Pill */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-card text-xs font-semibold shadow-2xs hover:bg-muted transition-colors touch-target"
            >
              <roleMeta.icon size={13} className="text-primary" />
              <span>{roleMeta.label}</span>
            </button>

            {/* Notifications Bell */}
            <Link
              to="/app/notifications"
              className="relative flex size-9 sm:size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all touch-target"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-critical ring-2 ring-background animate-bl-pulse" />
              )}
            </Link>

            {/* Profile Avatar & Name */}
            <Link
              to="/app/profile"
              className="flex items-center gap-2 pl-1 sm:pl-2 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-muted text-sm font-medium transition-colors touch-target"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold ring-1 ring-primary/25">
                {userInitials}
              </span>
              <span className="hidden md:inline font-semibold text-foreground">{userName.split(" ")[0]}</span>
            </Link>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="p-3.5 sm:p-6 max-w-6xl mx-auto w-full animate-bl-fade-up">
          {children}
        </main>
      </div>

      {/* Mobile Slide-Out Drawer / Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-bl-fade-up">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-card h-full shadow-2xl border-r border-border flex flex-col z-10 animate-bl-slide-up">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground touch-target"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Details in Drawer */}
            <div className="p-4 bg-muted/40 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                  {userInitials}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || "user@bloodlink.org"}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                  {user?.bloodGroup || "O+"} Verified
                </span>
                <span className="text-xs text-muted-foreground">{user?.location || "Bengaluru"}</span>
              </div>
            </div>

            {/* Role Switcher in Drawer */}
            <div className="p-4 border-b border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Switch Workspace
              </p>
              <div className="space-y-1.5">
                {(["requester", "donor", "bank"] as const).map((r) => {
                  const m = ROLE_META[r];
                  const activeRole = currentRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(`/app/${r}`);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border",
                        activeRole
                          ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                          : "bg-card border-border/70 text-foreground hover:bg-muted"
                      )}
                    >
                      <m.icon size={16} className={activeRole ? "text-primary-foreground" : "text-primary"} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold">{m.label}</p>
                        <p className={cn("text-[10px] truncate", activeRole ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {m.desc}
                        </p>
                      </div>
                      {activeRole && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nav links */}
            <div className="p-3 space-y-1 flex-1 overflow-y-auto">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Navigation
              </p>
              {navItems.map((it, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(it.to);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                    isActive(it.to)
                      ? "bg-primary-soft text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <it.icon size={18} />
                  <span>{it.label}</span>
                  {it.label === "Alerts" && unreadCount > 0 && (
                    <span className="ml-auto text-[11px] font-bold bg-critical text-critical-foreground rounded-full px-1.5 py-0.5 leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border space-y-2">
              <a
                href="tel:108"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-critical-soft text-critical text-xs font-bold hover:bg-critical-soft/80 transition-colors"
              >
                <Phone size={14} /> Emergency Ambulance 108
              </a>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut size={15} /> Sign out
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border/80 bg-card/95 backdrop-blur-md flex items-center justify-around px-1 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {navItems.map((it, i) => {
          const activeItem = isActive(it.to);

          // Center Action highlight (e.g. for "Request" in Requester mode)
          if (it.isCenterAction) {
            return (
              <Link
                key={i}
                to={it.to}
                className="relative -top-3 flex flex-col items-center justify-center group touch-target"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-active:scale-95 group-hover:scale-105">
                  <Plus size={24} strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-foreground mt-0.5">
                  {it.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={i}
              to={it.to}
              className={cn(
                "flex flex-col items-center justify-center py-2 text-center transition-all relative flex-1 touch-target",
                activeItem ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative">
                <it.icon size={20} className={cn("transition-transform", activeItem && "scale-110")} />
                {it.label === "Alerts" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-critical animate-bl-pulse" />
                )}
              </span>
              <span className="text-[11px] leading-tight mt-1 font-medium">{it.label}</span>
              {activeItem && (
                <span className="size-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
