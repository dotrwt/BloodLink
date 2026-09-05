import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/misc";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/cn";
import { useNotifications } from "../hooks/useNotifications";
import { Link } from "../lib/router";
import { AlertTriangle, ArrowRight, Bell, Check, Clock, Info, Zap } from "../lib/icons";

const KIND_META = {
  emergency: { tone: "critical" as const, Icon: Zap },
  status: { tone: "primary" as const, Icon: Info },
  reminder: { tone: "urgent" as const, Icon: Clock },
  system: { tone: "neutral" as const, Icon: AlertTriangle },
};

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread" | "emergencies">("all");

  const shown = notifications.filter((n) => {
    if (filter === "unread") return n.unread;
    if (filter === "emergencies") return n.kind === "emergency";
    return true;
  });

  return (
    <AppShell title="Alerts & Notifications" active="/app/notifications">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Emergency alerts &amp; updates
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"} requiring attention` : "You are completely up to date"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Check size={14} />}
            onClick={markAllAsRead}
            className="self-start sm:self-auto shadow-2xs"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState message={error} retry={refetch} />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="inline-flex rounded-xl border border-border bg-card p-1 mb-5">
        {[
          { key: "all", label: "All Alerts", count: notifications.length },
          { key: "unread", label: "Unread", count: unreadCount },
          { key: "emergencies", label: "Emergencies", count: notifications.filter((n) => n.kind === "emergency").length },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key as "all" | "unread" | "emergencies")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
              filter === f.key ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{f.label}</span>
            {f.count > 0 && (
              <span className={cn("font-num rounded-full px-1.5 py-0.2 text-[10px]", filter === f.key ? "bg-white/20" : "bg-muted")}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      )}

      {!loading && shown.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xs">
          <EmptyState
            icon={<Bell size={28} />}
            title={filter === "unread" ? "No unread alerts" : filter === "emergencies" ? "No urgent emergency alerts" : "No notifications yet"}
            description="When local emergencies arise or your requests change status, live updates will appear here."
            action={
              filter !== "all" ? (
                <Button size="sm" variant="outline" onClick={() => setFilter("all")}>
                  Show all notifications
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((n) => {
            const meta = KIND_META[n.kind];
            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "rounded-2xl border p-4 transition-all flex items-start gap-3.5 cursor-pointer shadow-2xs",
                  n.unread
                    ? "bg-card border-primary/40 shadow-xs"
                    : "bg-card/70 border-border/80 opacity-85 hover:opacity-100",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl shrink-0 mt-0.5",
                    meta.tone === "critical" && "bg-critical-soft text-critical",
                    meta.tone === "primary" && "bg-primary-soft text-primary",
                    meta.tone === "urgent" && "bg-urgent-soft text-urgent",
                    meta.tone === "neutral" && "bg-muted text-muted-foreground",
                  )}
                >
                  <meta.Icon size={18} />
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm leading-tight text-foreground">{n.title}</p>
                    <Badge tone={meta.tone} size="sm" className="capitalize text-[10px]">{n.kind}</Badge>
                    {n.unread && (
                      <span className="size-2 rounded-full bg-primary shrink-0 animate-bl-pulse" />
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">{n.body}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-num">{n.time}</span>
                    <Link
                      to={n.kind === "emergency" ? "/app/requester" : "/app/dashboard"}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View related request <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
