import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { EmptyState, ErrorState, Skeleton, Stat } from "../../components/ui/misc";
import { useBankDashboard } from "../../hooks/useBankDashboard";
import { cn } from "../../lib/cn";
import {
  Building,
  CheckCircle,
  Clock,
  DropletFill,
  Minus,
  Plus,
  ShieldCheck,
  Zap,
} from "../../lib/icons";

export default function BankDashboard() {
  const {
    stats,
    inventory,
    triage,
    loading,
    error,
    refetch,
    adjustStock,
    allocateUnits,
  } = useBankDashboard();

  return (
    <AppShell title="Blood Bank Dashboard" active="/app/bank">
      {/* Error State */}
      {error && (
        <div className="mb-6">
          <ErrorState message={error} retry={refetch} />
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !stats && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      )}

      {/* Main Bank View */}
      {(!loading || stats) && (
        <>
          {/* Top Banner: Institution Identity & Capacity */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">Sanjeevani Blood Centre</h1>
                <Badge tone="success" icon={<ShieldCheck size={13} />}>
                  Licensed Bank
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time storage reserves, hospital triage queue, and dispatch logistics.
              </p>
            </div>

            {stats && (
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-border bg-card px-4 py-2 flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Building size={16} />
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground leading-none">Storage Capacity</p>
                    <p className="font-num font-bold text-sm text-foreground mt-0.5">
                      {stats.capacityPercentage}% utilized
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bank Key Metrics Deck */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <Card>
                <CardBody>
                  <Stat
                    label="Total stock available"
                    value={`${stats.totalUnits} units`}
                    tone="primary"
                    icon={<DropletFill size={14} />}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat
                    label="Units reserved"
                    value={`${stats.unitsReserved} units`}
                    hint="Allocated for hospitals"
                    icon={<ShieldCheck size={14} />}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat
                    label="Hospital triage queue"
                    value={stats.incomingRequestsCount}
                    tone="critical"
                    hint="Awaiting unit allocation"
                    icon={<Zap size={14} />}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat
                    label="Expiring in 5 days"
                    value={`${stats.expiringSoonCount} units`}
                    tone="urgent"
                    hint="Requires priority triage"
                    icon={<Clock size={14} />}
                  />
                </CardBody>
              </Card>
            </div>
          )}

          {/* 8-Group Live Blood Inventory Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Live inventory by group</h2>
                <p className="text-xs text-muted-foreground">Current reserves, reservations, and capacity limits</p>
              </div>
              <span className="text-xs text-muted-foreground font-num">8 groups monitored</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {inventory.map((row) => {
                const pct = Math.min(100, Math.round((row.units / (row.capacity || 1)) * 100));
                const isCritical = row.units <= 2;
                const isLow = row.units > 2 && row.units <= 5;

                return (
                  <Card key={row.group} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <BloodGroupChip group={row.group} size="md" />
                        {isCritical ? (
                          <Badge tone="critical">Critical low</Badge>
                        ) : isLow ? (
                          <Badge tone="urgent">Low stock</Badge>
                        ) : (
                          <Badge tone="success">Adequate</Badge>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between mt-2">
                        <span className="font-num text-3xl font-extrabold text-foreground">{row.units}</span>
                        <span className="text-xs text-muted-foreground font-num">/ {row.capacity} cap</span>
                      </div>

                      {/* Capacity bar */}
                      <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            isCritical ? "bg-critical" : isLow ? "bg-warning" : "bg-primary"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Reserved: <strong className="text-foreground font-num">{row.reserved}</strong></span>
                        <span>Near expiry: <strong className={row.nearExpiry > 0 ? "text-warning font-num" : "text-foreground font-num"}>{row.nearExpiry}</strong></span>
                      </div>
                    </div>

                    {/* Stock Quick Adjustment buttons */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground">Quick adjust</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustStock(row.group, -1)}
                          className="size-7 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          title="Reduce 1 unit"
                        >
                          <Minus size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustStock(row.group, 1)}
                          className="size-7 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-primary hover:bg-primary-soft cursor-pointer transition-colors"
                          title="Add 1 unit"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Hospital Emergency Triage Queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Hospital emergency requests queue</h2>
                <p className="text-xs text-muted-foreground">Incoming triage requirements pending blood unit allocation</p>
              </div>
              <span className="text-xs font-semibold text-critical font-num">
                {triage.filter((t) => t.status === "pending").length} pending triage
              </span>
            </div>

            {triage.length === 0 ? (
              <Card className="p-6">
                <EmptyState
                  icon={<CheckCircle size={26} />}
                  title="All triage requests fulfilled"
                  description="No hospital requests are currently waiting for inventory allocation."
                />
              </Card>
            ) : (
              <Card>
                <div className="divide-y divide-border">
                  {triage.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <BloodGroupChip group={item.bloodGroup} size="lg" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <UrgencyBadge urgency={item.urgency} pulse={item.urgency === "critical"} />
                            <span className="text-xs text-muted-foreground font-num">Needed: {item.requiredBy}</span>
                          </div>
                          <h4 className="mt-1 font-semibold text-base">{item.hospital}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Required: <strong className="text-foreground font-num">{item.unitsNeeded} units</strong> &bull; Allocated: <strong className="text-primary font-num">{item.unitsAllocated} units</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.status === "allocated" ? (
                          <span className="text-xs font-semibold text-success flex items-center gap-1.5 bg-success-soft px-3 py-1.5 rounded-xl">
                            <CheckCircle size={15} /> Units Allocated &amp; Ready
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={<Plus size={14} />}
                            onClick={() => allocateUnits(item.id, 1)}
                          >
                            Allocate 1 unit
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
