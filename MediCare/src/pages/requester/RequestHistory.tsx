import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/misc";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { cn } from "../../lib/cn";
import { Link, useRouter } from "../../lib/router";
import { useRequests } from "../../hooks/useRequests";
import { STATUS_LABELS, STATUS_TONES } from "../../constants/statuses";
import { ArrowLeft, ArrowRight, Clock, Hospital, Plus } from "../../lib/icons";

export default function RequestHistory() {
  const { navigate } = useRouter();
  const { requests, loading, error, refetch } = useRequests();
  const [filter, setFilter] = useState<"all" | "active" | "fulfilled">("all");

  const filtered = requests.filter((r) => {
    if (filter === "active") return r.status !== "fulfilled" && r.status !== "cancelled";
    if (filter === "fulfilled") return r.status === "fulfilled";
    return true;
  });

  return (
    <AppShell title="Request history" active="/app/requester/history">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/app/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Request history</h1>
          <p className="text-sm text-muted-foreground mt-1">All requests created by your organization</p>
        </div>
        <Link to="/app/requester/new">
          <Button size="md" leftIcon={<Plus size={16} />}>New request</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState message={error} retry={refetch} />
        </div>
      )}

      <div className="inline-flex rounded-xl border border-border bg-card p-1 mb-5">
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "fulfilled", label: "Fulfilled" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as "all" | "active" | "fulfilled")}
            className={cn(
              "px-4 h-8 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer",
              filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={<Clock size={28} />}
            title="No requests found"
            description="You don't have any requests matching this filter."
            action={
              <Button size="sm" onClick={() => setFilter("all")}>Reset filter</Button>
            }
          />
        </Card>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card
              key={r.id}
              interactive
              onClick={() =>
                navigate(
                  r.status === "matching"
                    ? `/app/requester/matches/${r.id}`
                    : `/app/requester/track/${r.id}`
                )
              }
            >
              <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <BloodGroupChip group={r.bloodGroup} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge urgency={r.urgency} />
                      <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                      <span className="text-xs text-muted-foreground font-num">ID: {r.id}</span>
                    </div>
                    <h3 className="font-semibold text-base mt-1">
                      {r.units} units for {r.patientName}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Hospital size={13} /> {r.hospital}</span>
                      <span>&bull;</span>
                      <span>Created {r.createdAt}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    Details <ArrowRight size={14} />
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
