import { useState, useMemo } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/misc";
import { useBankDashboard } from "../../hooks/useBankDashboard";
import { cn } from "../../lib/cn";
import {
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  DropletFill,
  Filter,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  X,
  Zap,
} from "../../lib/icons";
import type { BankTriageItem, BloodGroup } from "../../types/models";

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

  // --- Inventory Filters & Controls ---
  const [invStatus, setInvStatus] = useState<"all" | "critical" | "low" | "adequate" | "expiring">("all");
  const [invRh, setInvRh] = useState<"all" | "negative" | "positive">("all");
  const [invGroup, setInvGroup] = useState<BloodGroup | "all">("all");
  const [invSearch, setInvSearch] = useState("");
  const [invSort, setInvSort] = useState<"default" | "lowest" | "highest" | "expiring" | "utilization">("default");

  // --- Triage Filters ---
  const [triageUrgency, setTriageUrgency] = useState<"all" | "critical" | "urgent" | "routine">("all");
  const [triageStatus, setTriageStatus] = useState<"all" | "pending" | "allocated">("all");
  const [triageSearch, setTriageSearch] = useState("");

  const allGroups: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

  // Inventory count badges
  const criticalCount = useMemo(() => inventory.filter((r) => r.units <= 2).length, [inventory]);
  const lowCount = useMemo(() => inventory.filter((r) => r.units > 2 && r.units <= 5).length, [inventory]);
  const adequateCount = useMemo(() => inventory.filter((r) => r.units > 5).length, [inventory]);
  const expiringCount = useMemo(() => inventory.filter((r) => r.nearExpiry > 0).length, [inventory]);

  const isInventoryFiltered =
    invStatus !== "all" ||
    invRh !== "all" ||
    invGroup !== "all" ||
    invSearch.trim() !== "" ||
    invSort !== "default";

  function resetInventoryFilters() {
    setInvStatus("all");
    setInvRh("all");
    setInvGroup("all");
    setInvSearch("");
    setInvSort("default");
  }

  // Filtered and sorted inventory
  const filteredInventory = useMemo(() => {
    return inventory
      .filter((row) => {
        // 1. Specific Blood Group Pill
        if (invGroup !== "all" && row.group !== invGroup) return false;

        // 2. Search Text
        if (invSearch.trim()) {
          const q = invSearch.toLowerCase().trim();
          const isNeg = row.group.includes("-");
          const isPos = row.group.includes("+");
          const matchKeywords = `${row.group} ${isNeg ? "negative neg -" : isPos ? "positive pos +" : ""}`.toLowerCase();
          if (!matchKeywords.includes(q)) return false;
        }

        // 3. Status Filter
        if (invStatus === "critical" && row.units > 2) return false;
        if (invStatus === "low" && (row.units <= 2 || row.units > 5)) return false;
        if (invStatus === "adequate" && row.units <= 5) return false;
        if (invStatus === "expiring" && row.nearExpiry <= 0) return false;

        // 4. Rh Factor Filter
        if (invRh === "negative" && !row.group.includes("-")) return false;
        if (invRh === "positive" && !row.group.includes("+")) return false;

        return true;
      })
      .sort((a, b) => {
        if (invSort === "lowest") return a.units - b.units;
        if (invSort === "highest") return b.units - a.units;
        if (invSort === "expiring") return b.nearExpiry - a.nearExpiry;
        if (invSort === "utilization") {
          const pctA = a.units / (a.capacity || 1);
          const pctB = b.units / (b.capacity || 1);
          return pctB - pctA;
        }
        return 0; // standard original order
      });
  }, [inventory, invGroup, invSearch, invStatus, invRh, invSort]);

  // Filtered triage items
  const filteredTriage = useMemo(() => {
    return triage.filter((item) => {
      if (triageUrgency !== "all" && item.urgency !== triageUrgency) return false;
      if (triageStatus !== "all" && item.status !== triageStatus) return false;
      if (triageSearch.trim()) {
        const q = triageSearch.toLowerCase().trim();
        const match =
          item.hospital.toLowerCase().includes(q) ||
          item.bloodGroup.toLowerCase().includes(q) ||
          item.requiredBy.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [triage, triageUrgency, triageStatus, triageSearch]);

  const isTriageFiltered = triageUrgency !== "all" || triageStatus !== "all" || triageSearch.trim() !== "";

  function resetTriageFilters() {
    setTriageUrgency("all");
    setTriageStatus("all");
    setTriageSearch("");
  }

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
                className="text-xs text-success hover:underline ml-2 cursor-pointer"
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

          {/* 8-Group Live Blood Inventory Grid with Filter Bar */}
          <div className="mb-10">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                    Live inventory by group
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-soft text-primary font-num">
                    {filteredInventory.length} / {inventory.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current reserves, reservations, and capacity limits with real-time stock triage
                </p>
              </div>

              {isInventoryFiltered && (
                <button
                  type="button"
                  onClick={resetInventoryFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-primary-soft/60 hover:bg-primary-soft px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw size={13} />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            {/* Interactive Filter Controls Bar */}
            <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-2xs mb-5 space-y-3.5">
              {/* Top Controls: Search, Rh Filter & Sorting */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Search by Blood Group */}
                <div className="relative sm:col-span-5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={invSearch}
                    onChange={(e) => setInvSearch(e.target.value)}
                    placeholder="Search group (e.g. O-, A+, Negative)..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  {invSearch && (
                    <button
                      type="button"
                      onClick={() => setInvSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Rh Factor Selector */}
                <div className="sm:col-span-4 flex items-center p-1 rounded-xl bg-muted/60 border border-border/50 text-xs">
                  <button
                    type="button"
                    onClick={() => setInvRh("all")}
                    className={cn(
                      "flex-1 py-1.5 px-2 text-center font-semibold rounded-lg transition-all cursor-pointer",
                      invRh === "all"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All Rh
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvRh("negative")}
                    className={cn(
                      "flex-1 py-1.5 px-2 text-center font-semibold rounded-lg transition-all cursor-pointer",
                      invRh === "negative"
                        ? "bg-critical-soft text-critical shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Rh-Negative rare blood groups"
                  >
                    Rh- (Rare)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvRh("positive")}
                    className={cn(
                      "flex-1 py-1.5 px-2 text-center font-semibold rounded-lg transition-all cursor-pointer",
                      invRh === "positive"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Rh+
                  </button>
                </div>

                {/* Sort Order Dropdown */}
                <div className="sm:col-span-3">
                  <select
                    value={invSort}
                    onChange={(e) => setInvSort(e.target.value as any)}
                    className="w-full py-2 px-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="lowest">Lowest Reserves (Shortage first)</option>
                    <option value="highest">Highest Reserves</option>
                    <option value="expiring">Near Expiry First</option>
                    <option value="utilization">Storage Utilization %</option>
                  </select>
                </div>
              </div>

              {/* Status Tabs Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
                  <Filter size={12} /> Status:
                </span>

                <button
                  type="button"
                  onClick={() => setInvStatus("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                    invStatus === "all"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span>All</span>
                  <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-num", invStatus === "all" ? "bg-white/20" : "bg-border")}>
                    {inventory.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInvStatus("critical")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                    invStatus === "critical"
                      ? "bg-critical text-critical-foreground shadow-2xs"
                      : "bg-critical-soft text-critical hover:bg-critical-soft/80"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  <span>Critical Low (≤2)</span>
                  <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-num", invStatus === "critical" ? "bg-white/20" : "bg-critical/20")}>
                    {criticalCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInvStatus("low")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                    invStatus === "low"
                      ? "bg-urgent text-urgent-foreground shadow-2xs"
                      : "bg-urgent-soft text-urgent hover:bg-urgent-soft/80"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  <span>Low Stock (3-5)</span>
                  <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-num", invStatus === "low" ? "bg-white/20" : "bg-urgent/20")}>
                    {lowCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInvStatus("adequate")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                    invStatus === "adequate"
                      ? "bg-success text-success-foreground shadow-2xs"
                      : "bg-success-soft text-success hover:bg-success-soft/80"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  <span>Adequate (&gt;5)</span>
                  <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-num", invStatus === "adequate" ? "bg-white/20" : "bg-success/20")}>
                    {adequateCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInvStatus("expiring")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5",
                    invStatus === "expiring"
                      ? "bg-urgent text-urgent-foreground shadow-2xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Clock size={12} />
                  <span>Near Expiry</span>
                  <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-num", invStatus === "expiring" ? "bg-white/20" : "bg-border")}>
                    {expiringCount}
                  </span>
                </button>
              </div>

              {/* Quick Blood Group Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/60">
                <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mr-1">
                  Quick Group:
                </span>
                <button
                  type="button"
                  onClick={() => setInvGroup("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    invGroup === "all"
                      ? "bg-foreground text-background shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  All (8)
                </button>
                {allGroups.map((grp) => {
                  const isSelected = invGroup === grp;
                  const row = inventory.find((r) => r.group === grp);
                  const isCrit = (row?.units ?? 0) <= 2;

                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setInvGroup(isSelected ? "all" : grp)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold font-num transition-all cursor-pointer flex items-center gap-1",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30"
                          : isCrit
                          ? "bg-critical-soft text-critical hover:bg-critical/20"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{grp}</span>
                      {row && <span className="text-[10px] opacity-75">({row.units})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inventory Grid / Empty State */}
            {filteredInventory.length === 0 ? (
              <Card className="p-8 text-center shadow-2xs">
                <div className="max-w-sm mx-auto flex flex-col items-center">
                  <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                    <AlertTriangle size={22} />
                  </div>
                  <h3 className="font-bold text-base text-foreground">No matching blood groups</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    No blood groups match your selected filter criteria. Try adjusting your status, search keyword, or Rh filter.
                  </p>
                  <Button variant="secondary" size="sm" leftIcon={<RotateCcw size={14} />} onClick={resetInventoryFilters}>
                    Reset Inventory Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredInventory.map((row) => {
                  const pct = Math.min(100, Math.round((row.units / (row.capacity || 1)) * 100));
                  const isCritical = row.units <= 2;
                  const isLow = row.units > 2 && row.units <= 5;

                  return (
                    <Card
                      key={row.group}
                      className={cn(
                        "p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs transition-all hover:shadow-sm",
                        isCritical && "border-critical/30 bg-critical-soft/10"
                      )}
                    >
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
            )}
          </div>

          {/* Hospital Emergency Triage Queue with Filters */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                    Hospital emergency triage queue
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-critical-soft text-critical font-num">
                    {triage.filter((t) => t.status === "pending").length} pending
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Incoming requirements awaiting inventory allocation & courier release
                </p>
              </div>

              {isTriageFiltered && (
                <button
                  type="button"
                  onClick={resetTriageFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-primary-soft/60 hover:bg-primary-soft px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw size={13} />
                  <span>Reset triage filters</span>
                </button>
              )}
            </div>

            {/* Triage Filter Bar */}
            <div className="p-3 rounded-2xl bg-card border border-border/80 shadow-2xs mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Triage Search */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={triageSearch}
                  onChange={(e) => setTriageSearch(e.target.value)}
                  placeholder="Search by hospital, blood group, or required time..."
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {triageSearch && (
                  <button
                    type="button"
                    onClick={() => setTriageSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Urgency Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setTriageUrgency("all")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                    triageUrgency === "all"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  All Urgencies
                </button>
                <button
                  type="button"
                  onClick={() => setTriageUrgency("critical")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                    triageUrgency === "critical"
                      ? "bg-critical text-critical-foreground shadow-2xs"
                      : "bg-critical-soft text-critical hover:bg-critical-soft/80"
                  )}
                >
                  Critical
                </button>
                <button
                  type="button"
                  onClick={() => setTriageUrgency("urgent")}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                    triageUrgency === "urgent"
                      ? "bg-urgent text-urgent-foreground shadow-2xs"
                      : "bg-urgent-soft text-urgent hover:bg-urgent-soft/80"
                  )}
                >
                  Urgent
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/50 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setTriageStatus("all")}
                  className={cn(
                    "py-1 px-2 font-semibold rounded-lg transition-all cursor-pointer",
                    triageStatus === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setTriageStatus("pending")}
                  className={cn(
                    "py-1 px-2 font-semibold rounded-lg transition-all cursor-pointer",
                    triageStatus === "pending" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setTriageStatus("allocated")}
                  className={cn(
                    "py-1 px-2 font-semibold rounded-lg transition-all cursor-pointer",
                    triageStatus === "allocated" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Allocated
                </button>
              </div>
            </div>

            {filteredTriage.length === 0 ? (
              <Card className="p-6">
                <EmptyState
                  icon={<CheckCircle size={26} />}
                  title={triage.length === 0 ? "All triage requests fulfilled" : "No matching triage requests"}
                  description={
                    triage.length === 0
                      ? "No hospital requests are currently waiting for inventory allocation."
                      : "No triage requests match your selected filters. Try clearing your search or status selection."
                  }
                  action={
                    isTriageFiltered ? (
                      <Button variant="secondary" size="sm" leftIcon={<RotateCcw size={14} />} onClick={resetTriageFilters}>
                        Reset Filters
                      </Button>
                    ) : undefined
                  }
                />
              </Card>
            ) : (
              <Card className="shadow-2xs">
                <div className="divide-y divide-border">
                  {filteredTriage.map((item) => (
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
