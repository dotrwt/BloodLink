import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/misc";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/cn";
import { useNotifications } from "../hooks/useNotifications";
import { AlertTriangle, Bell, Check, Clock, Info, Zap } from "../lib/icons";

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

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const shown = notifications.filter((n) => (filter === "unread" ? n.unread : true));

  return (
    <AppShell title="Notifications" active="/app/notifications">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:hidden">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" leftIcon={<Check size={15} />} onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState message={error} retry={refetch} />
        </div>
      )}

      <div className="inline-flex rounded-xl border border-border bg-card p-1 mb-5">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 h-8 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer",
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
            {f === "unread" && unreadCount > 0 && ` (${unreadCount})`}
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
        <div className="rounded-2xl border border-border bg-card p-8">
          <EmptyState
            icon={<Bell size={28} />}
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description="When emergencies arise or your requests change status, you'll see alerts here."
            action={
              filter === "unread" ? (
                <Button size="sm" variant="outline" onClick={() => setFilter("all")}>
                  Show all
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
                  "rounded-2xl border p-4 transition-all flex items-start gap-4 cursor-pointer",
                  n.unread
                    ? "bg-card border-primary/35 shadow-xs"
                    : "bg-card/60 border-border opacity-85 hover:opacity-100",
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
                    <p className="font-semibold text-sm leading-tight text-foreground">{n.title}</p>
                    <Badge tone={meta.tone} className="capitalize text-[11px]">{n.kind}</Badge>
                    {n.unread && (
                      <span className="size-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{n.body}</p>
                  <span className="mt-2 inline-block text-xs text-muted-foreground font-num">{n.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
