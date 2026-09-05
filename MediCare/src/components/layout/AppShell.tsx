import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Link, useRouter } from "../../lib/router";
import type { Role } from "../../types/models";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNotifications } from "../../hooks/useNotifications";
import {
  Bell,
  DropletFill,
  Home,
  List,
  LogOut,
  Plus,
  User,
} from "../../lib/icons";

type NavItem = { label: string; to: string; icon: typeof Home };

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/app/dashboard", icon: Home },
  { label: "New request", to: "/app/requester/new", icon: Plus },
  { label: "History", to: "/app/requester/history", icon: List },
  { label: "Alerts", to: "/app/notifications", icon: Bell },
  { label: "Profile", to: "/app/profile", icon: User },
];

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold", className)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <DropletFill size={16} />
      </span>
      BloodLink
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
  const { path } = useRouter();
  const { user } = useCurrentUser();
  const { unreadCount } = useNotifications();

  const isActive = (to: string) =>
    active ? to === active : path === to || (to !== "/app/dashboard" && path.startsWith(to));

  const userName = user?.name || "Member";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-border bg-card sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center border-b border-border">
          <Link to="/app/dashboard"><Logo /></Link>
        </div>
        <div className="px-3 py-3">
          <div className="rounded-xl bg-primary-soft/60 px-3 py-2.5 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <DropletFill size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-none">Signed in as</p>
              <p className="text-sm font-semibold truncate">{userName}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((it, i) => (
            <Link
              key={i}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(it.to)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <it.icon size={18} />
              {it.label}
              {it.label === "Alerts" && unreadCount > 0 && (
                <span className="ml-auto font-num text-[11px] font-bold bg-critical text-critical-foreground rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut size={18} /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div id="bl-scroll" className="min-w-0 lg:h-screen lg:overflow-y-auto pb-20 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/85 backdrop-blur flex items-center gap-3 px-4 sm:px-6">
          <Link to="/app/dashboard" className="lg:hidden"><Logo className="text-sm" /></Link>
          {title && (
            <h1 className="hidden lg:block text-lg font-semibold">{title}</h1>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/app/notifications"
              className="relative flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-critical ring-2 ring-background" />
              )}
            </Link>
            <Link
              to="/app/profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted text-sm font-medium"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold">
                {userInitials}
              </span>
              <span className="hidden sm:inline">{userName.split(" ")[0]}</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-border bg-card/95 backdrop-blur grid grid-cols-5 items-center px-2">
        {NAV.map((it, i) => (
          <Link
            key={i}
            to={it.to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors relative",
              isActive(it.to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="relative">
              <it.icon size={20} />
              {it.label === "Alerts" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-critical" />
              )}
            </span>
            <span className="truncate max-w-[60px]">{it.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
