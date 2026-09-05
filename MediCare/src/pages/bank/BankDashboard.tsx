import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/misc";
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
  Truck,
  X,
  Zap,
} from "../../lib/icons";
import type { BankTriageItem } from "../../types/models";

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

  const [triageModalItem, setTriageModalItem] = useState<BankTriageItem | null>(null);
  const [allocationNotice, setAllocationNotice] = useState<string | null>(null);

  function handleConfirmAllocation() {
    if (!triageModalItem) return;
    allocateUnits(triageModalItem.id, 1);
    setAllocationNotice(`Allocated 1 unit of ${triageModalItem.bloodGroup} to ${triageModalItem.hospital}. Cold chain transit initialized.`);
    setTriageModalItem(null);
    setTimeout(() => setAllocationNotice(null), 5000);
  }

  return (
    <AppShell title="Blood Bank Logistics" active="/app/bank">
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
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      )}

      {/* Main Bank View */}
      {(!loading || stats) && (
        <>
          {/* Allocation Success Toast */}
          {allocationNotice && (
            <div className="mb-5 p-3.5 rounded-2xl bg-success-soft border border-success/30 text-success text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-bl-fade-up">
              <span className="flex items-center gap-2">
                <CheckCircle size={16} /> {allocationNotice}
              </span>
              <button
                type="button"
                onClick={() => setAllocationNotice(null)}
                className="text-xs text-success hover:underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Banner: Institution Identity & Capacity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Sanjeevani Blood Centre
                </h1>
                <Badge tone="success" icon={<ShieldCheck size={12} />}>
                  Licensed Bank #KA-481
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Real-time storage reserves, hospital triage queue, and cold chain dispatch logistics.
              </p>
            </div>

            {stats && (
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-border bg-card px-4 py-2.5 flex items-center gap-3 shadow-2xs">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Building size={16} />
                  </span>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider leading-none">
                      Storage Utilization
                    </p>
                    <p className="font-num font-bold text-sm text-foreground mt-1">
                      {stats.capacityPercentage}% utilized
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bank Key Metrics Deck */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Total Stock</span>
                  <DropletFill size={14} className="text-primary" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.totalUnits} <span className="text-sm font-semibold text-muted-foreground">units</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tested & cleared</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Reserved</span>
                  <ShieldCheck size={14} className="text-primary" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.unitsReserved} <span className="text-sm font-semibold text-muted-foreground">units</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Allocated for surgery</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Triage Queue</span>
                  <Zap size={14} className="text-critical" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-critical">
                  {stats.incomingRequestsCount}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting allocation</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Expiring in 5d</span>
                  <Clock size={14} className="text-urgent" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-urgent">
                  {stats.expiringSoonCount} <span className="text-sm font-semibold text-muted-foreground">units</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Priority dispatch</p>
              </div>
            </div>
          )}

          {/* 8-Group Live Blood Inventory Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Live inventory by group
                </h2>
                <p className="text-xs text-muted-foreground">Current reserves, reservations, and capacity limits</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground font-num">8 groups monitored</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {inventory.map((row) => {
                const pct = Math.min(100, Math.round((row.units / (row.capacity || 1)) * 100));
                const isCritical = row.units <= 2;
                const isLow = row.units > 2 && row.units <= 5;

                return (
                  <Card key={row.group} className="p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <BloodGroupChip group={row.group} size="md" />
                        {isCritical ? (
                          <Badge tone="critical" size="sm">Critical low</Badge>
                        ) : isLow ? (
                          <Badge tone="urgent" size="sm">Low stock</Badge>
                        ) : (
                          <Badge tone="success" size="sm">Adequate</Badge>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between mt-2">
                        <span className="font-num text-2xl sm:text-3xl font-extrabold text-foreground">{row.units}</span>
                        <span className="text-xs text-muted-foreground font-num">/ {row.capacity} cap</span>
                      </div>

                      {/* Capacity bar */}
                      <div className="mt-2.5 w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            isCritical ? "bg-critical" : isLow ? "bg-urgent" : "bg-primary"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Reserved: <strong className="text-foreground font-num">{row.reserved}</strong></span>
                        <span>Near expiry: <strong className={row.nearExpiry > 0 ? "text-urgent font-num" : "text-foreground font-num"}>{row.nearExpiry}</strong></span>
                      </div>
                    </div>

                    {/* Quick Adjustment buttons */}
                    <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground">Adjust</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustStock(row.group, -1)}
                          className="size-7 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors active:scale-90"
                          title="Deduct 1 unit"
                        >
                          <Minus size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustStock(row.group, 1)}
                          className="size-7 rounded-lg border border-border bg-card hover:bg-primary-soft flex items-center justify-center text-primary cursor-pointer transition-colors active:scale-90"
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
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Hospital emergency triage queue
                </h2>
                <p className="text-xs text-muted-foreground">Incoming requirements awaiting inventory allocation & courier release</p>
              </div>
              <span className="text-xs font-bold text-critical font-num">
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
              <Card className="shadow-2xs">
                <div className="divide-y divide-border">
                  {triage.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <BloodGroupChip group={item.bloodGroup} size="lg" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <UrgencyBadge urgency={item.urgency} size="sm" pulse={item.urgency === "critical"} />
                            <span className="text-xs text-urgent font-bold font-num">Required by {item.requiredBy}</span>
                          </div>
                          <h4 className="mt-1 font-bold text-sm sm:text-base text-foreground">{item.hospital}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Needed: <strong className="text-foreground font-num">{item.unitsNeeded} units</strong> &bull; Allocated: <strong className="text-primary font-num">{item.unitsAllocated} units</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        {item.status === "allocated" ? (
                          <span className="text-xs font-bold text-success flex items-center gap-1.5 bg-success-soft px-3 py-1.5 rounded-xl">
                            <CheckCircle size={15} /> Allocated &amp; Dispatched
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={<Plus size={14} />}
                            onClick={() => setTriageModalItem(item)}
                            className="shadow-xs"
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

          {/* Allocation Confirmation Modal */}
          {triageModalItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
                onClick={() => setTriageModalItem(null)}
              />

              <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6 z-10 animate-bl-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Truck size={16} />
                    </span>
                    <h3 className="font-bold text-base text-foreground">Allocate Blood Units</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTriageModalItem(null)}
                    className="flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="py-4 space-y-3.5 text-xs">
                  <div className="rounded-xl bg-muted/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Requesting Facility:</span>
                      <span className="font-bold text-foreground">{triageModalItem.hospital}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Blood Group & Quantity:</span>
                      <div className="flex items-center gap-1.5">
                        <BloodGroupChip group={triageModalItem.bloodGroup} size="sm" />
                        <span className="font-bold font-num text-foreground">1 Unit (450 ml)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Required By:</span>
                      <span className="text-urgent font-bold font-num">{triageModalItem.requiredBy}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-primary-soft/40 border border-primary/20 text-xs text-primary flex items-start gap-2">
                    <CheckCircle size={15} className="shrink-0 mt-0.5 text-primary" />
                    <p>
                      This will deduct 1 unit from your available storage and issue cold chain dispatch documentation for ambulance pickup.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => setTriageModalItem(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="md"
                    rightIcon={<CheckCircle size={15} />}
                    onClick={handleConfirmAllocation}
                    className="shadow-xs"
                  >
                    Confirm & Allocate Unit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
