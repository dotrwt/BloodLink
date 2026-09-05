import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { EmptyState } from "../components/ui/misc";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/cn";
import { getRole } from "../lib/session";
import { NOTIFICATIONS } from "../lib/mock";
import type { AppNotification } from "../lib/types";
import { AlertTriangle, Bell, Check, Clock, Info, Zap } from "../lib/icons";

const KIND_META = {
  emergency: { tone: "critical" as const, Icon: Zap },
  status: { tone: "primary" as const, Icon: Info },
  reminder: { tone: "urgent" as const, Icon: Clock },
  system: { tone: "neutral" as const, Icon: AlertTriangle },
};

export default function Notifications() {
  const role = getRole();
  const [items, setItems] = useState<AppNotification[]>(() =>
    NOTIFICATIONS.filter((n) => n.role === role || n.role === "all"),
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const shown = items.filter((n) => (filter === "unread" ? n.unread : true));
  const unread = items.filter((n) => n.unread).length;

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  const toggle = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  return (
    <AppShell role={role} title="Notifications" active="/app/notifications">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:hidden">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unread > 0 ? `${unread} unread` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" leftIcon={<Check size={15} />} onClick={markAll}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="inline-flex rounded-xl border border-border bg-card p-1 mb-5">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 h-8 rounded-lg text-sm font-medium capitalize transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
            {f === "unread" && unread > 0 && ` (${unread})`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            icon={<Bell size={26} />}
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description="Emergency alerts, status updates and reminders will appear here."
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((n) => {
            const m = KIND_META[n.kind];
            return (
              <button
                key={n.id}
                onClick={() => toggle(n.id)}
                className={cn(
                  "w-full text-left rounded-2xl border p-4 flex gap-3.5 transition-colors",
                  n.unread ? "border-primary/25 bg-primary-soft/25" : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    m.tone === "critical" && "bg-critical-soft text-critical",
                    m.tone === "primary" && "bg-primary-soft text-primary",
                    m.tone === "urgent" && "bg-urgent-soft text-urgent",
                    m.tone === "neutral" && "bg-muted text-muted-foreground",
                  )}
                >
                  <m.Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm leading-tight">{n.title}</p>
                    {n.kind === "emergency" && <Badge tone="critical">Emergency</Badge>}
                    {n.unread && <span className="size-2 rounded-full bg-primary ml-auto shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1.5 font-num">{n.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
