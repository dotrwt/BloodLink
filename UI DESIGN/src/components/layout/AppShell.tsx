import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Link, useRouter } from "../../lib/router";
import type { Role } from "../../lib/types";
import {
  Bell,
  Building,
  Calendar,
  DropletFill,
  Home,
  List,
  LogOut,
  Package,
  Plus,
  Settings,
  User,
} from "../../lib/icons";
import { NOTIFICATIONS } from "../../lib/mock";

type NavItem = { label: string; to: string; icon: typeof Home };

const NAV: Record<Role, NavItem[]> = {
  requester: [
    { label: "Dashboard", to: "/app/requester", icon: Home },
    { label: "New request", to: "/app/requester/new", icon: Plus },
    { label: "History", to: "/app/requester/history", icon: List },
    { label: "Alerts", to: "/app/notifications", icon: Bell },
    { label: "Profile", to: "/app/profile", icon: User },
  ],
  donor: [
    { label: "Dashboard", to: "/app/donor", icon: Home },
    { label: "Emergencies", to: "/app/donor", icon: DropletFill },
    { label: "Schedule", to: "/app/donor", icon: Calendar },
    { label: "Alerts", to: "/app/notifications", icon: Bell },
    { label: "Profile", to: "/app/profile", icon: User },
  ],
  bank: [
    { label: "Dashboard", to: "/app/bank", icon: Home },
    { label: "Inventory", to: "/app/bank", icon: Package },
    { label: "Requests", to: "/app/bank", icon: List },
    { label: "Alerts", to: "/app/notifications", icon: Bell },
    { label: "Profile", to: "/app/profile", icon: User },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  requester: "Requester",
  donor: "Donor",
  bank: "Blood Bank",
};

function Logo({ className }: { className?: string }) {
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
  role,
  children,
  title,
  active,
}: {
  role: Role;
  children: ReactNode;
  title?: string;
  active?: string;
}) {
  const { path } = useRouter();
  const items = NAV[role];
  const unread = NOTIFICATIONS.filter((n) => n.unread && (n.role === role || n.role === "all")).length;

  const isActive = (to: string) =>
    active ? to === active : path === to || (to !== `/app/${role}` && path.startsWith(to));

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-border bg-card sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center border-b border-border">
          <Link to="/select-role"><Logo /></Link>
        </div>
        <div className="px-3 py-3">
          <div className="rounded-xl bg-primary-soft/60 px-3 py-2.5 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {role === "bank" ? <Building size={16} /> : role === "donor" ? <DropletFill size={16} /> : <User size={16} />}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-none">Signed in as</p>
              <p className="text-sm font-semibold truncate">{ROLE_LABEL[role]}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {items.map((it, i) => (
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
              {it.label === "Alerts" && unread > 0 && (
                <span className="ml-auto font-num text-[11px] font-bold bg-critical text-critical-foreground rounded-full px-1.5 py-0.5 leading-none">
                  {unread}
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
          <Link to="/select-role" className="lg:hidden"><Logo className="text-sm" /></Link>
          {title && (
            <h1 className="hidden lg:block text-lg font-semibold">{title}</h1>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/app/notifications"
              className="relative flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-critical ring-2 ring-background" />
              )}
            </Link>
            <Link
              to="/app/profile"
              className="flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Settings size={20} />
            </Link>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="grid grid-cols-5 h-16">
          {items.map((it, i) => (
            <Link
              key={i}
              to={it.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium relative",
                isActive(it.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <it.icon size={20} />
              {it.label}
              {it.label === "Alerts" && unread > 0 && (
                <span className="absolute top-2 right-[calc(50%-1.25rem)] size-2 rounded-full bg-critical" />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export { Logo };
