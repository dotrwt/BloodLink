import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Stat } from "../../components/ui/misc";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { cn } from "../../lib/cn";
import { setRole } from "../../lib/session";
import { INVENTORY, INCOMING_QUEUE, CURRENT_USER } from "../../lib/mock";
import type { BloodRequest, InventoryRow } from "../../lib/types";
import {
  AlertTriangle,
  Building,
  Check,
  Clock,
  Hospital,
  Package,
  ShieldCheck,
  TrendingDown,
  X,
} from "../../lib/icons";

function stockLevel(row: InventoryRow): "low" | "ok" | "high" {
  const ratio = row.units / row.capacity;
  if (row.units <= 4 || ratio < 0.25) return "low";
  if (ratio > 0.6) return "high";
  return "ok";
}

export default function BankDashboard() {
  setRole("bank");
  const [queue] = useState<BloodRequest[]>(INCOMING_QUEUE);
  const [handled, setHandled] = useState<Record<string, "reserved" | "declined">>({});

  const lowStock = INVENTORY.filter((r) => stockLevel(r) === "low");
  const nearExpiry = INVENTORY.reduce((s, r) => s + r.nearExpiry, 0);
  const totalUnits = INVENTORY.reduce((s, r) => s + r.units, 0);
  const critical = queue.filter((q) => q.urgency === "critical").length;

  return (
    <AppShell role="bank" title="Blood bank" active="/app/bank">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              {CURRENT_USER.bank.name}
              <ShieldCheck size={18} className="text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">{CURRENT_USER.bank.location}</p>
          </div>
        </div>
        <Button variant="outline" leftIcon={<Package size={16} />}>Update inventory</Button>
      </div>

      {/* Alerts strip */}
      {(lowStock.length > 0 || nearExpiry > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {lowStock.length > 0 && (
            <div className="rounded-2xl border border-critical/20 bg-critical-soft/50 p-4 flex gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-critical-soft text-critical shrink-0"><TrendingDown size={18} /></span>
              <div>
                <p className="font-semibold text-sm text-critical">Low stock: {lowStock.length} groups</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {lowStock.map((r) => r.group).join(", ")} below safe threshold.
                </p>
              </div>
            </div>
          )}
          {nearExpiry > 0 && (
            <div className="rounded-2xl border border-urgent/20 bg-urgent-soft/50 p-4 flex gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-urgent-soft text-urgent shrink-0"><AlertTriangle size={18} /></span>
              <div>
                <p className="font-semibold text-sm text-urgent">{nearExpiry} units nearing expiry</p>
                <p className="text-sm text-muted-foreground mt-0.5">Within 5 days. Prioritise for requests.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Card><CardBody><Stat label="Total units" value={totalUnits} icon={<Package size={14} />} /></CardBody></Card>
        <Card><CardBody><Stat label="Incoming" value={queue.length} tone="primary" icon={<Hospital size={14} />} /></CardBody></Card>
        <Card><CardBody><Stat label="Critical" value={critical} tone="critical" icon={<AlertTriangle size={14} />} /></CardBody></Card>
        <Card><CardBody><Stat label="Near expiry" value={nearExpiry} tone="urgent" icon={<Clock size={14} />} /></CardBody></Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
        {/* Inventory — dense, scannable */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Blood inventory</h2>
          <Card>
            <CardBody className="p-0">
              <div className="divide-y divide-border">
                {INVENTORY.map((row) => {
                  const level = stockLevel(row);
                  const pct = Math.round((row.units / row.capacity) * 100);
                  return (
                    <div key={row.group} className="flex items-center gap-4 px-4 sm:px-5 py-3.5">
                      <BloodGroupChip group={row.group} size="md" tone={level === "low" ? "critical" : "neutral"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-num font-semibold">
                            {row.units}<span className="text-muted-foreground font-normal"> / {row.capacity} units</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {row.reserved > 0 && <span className="text-xs text-muted-foreground">{row.reserved} reserved</span>}
                            {row.nearExpiry > 0 && <Badge tone="urgent">{row.nearExpiry} expiring</Badge>}
                            {level === "low" && <Badge tone="critical" icon={<TrendingDown size={11} />}>Low</Badge>}
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", level === "low" ? "bg-critical" : level === "high" ? "bg-success" : "bg-primary")}
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Incoming request queue */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Incoming requests</h2>
          <div className="space-y-3">
            {queue.map((q) => {
              const state = handled[q.id];
              const canFill = (INVENTORY.find((r) => r.group === q.bloodGroup)?.units ?? 0) >= q.units;
              return (
                <Card key={q.id} className={cn(q.urgency === "critical" && !state && "border-critical/25")}>
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <BloodGroupChip group={q.bloodGroup} size="lg" />
                      <div className="min-w-0 flex-1">
                        <UrgencyBadge urgency={q.urgency} size="sm" pulse={q.urgency === "critical"} />
                        <p className="font-semibold text-sm mt-1.5 leading-tight">{q.units} units</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{q.hospital}</p>
                        <p className="text-xs text-muted-foreground font-num flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> by {q.requiredBy}
                        </p>
                      </div>
                    </div>
                    {!canFill && !state && (
                      <p className="mt-3 text-xs text-critical bg-critical-soft rounded-lg px-2.5 py-1.5">
                        Insufficient stock for full request
                      </p>
                    )}
                    {state ? (
                      <div className="mt-3">
                        <Badge tone={state === "reserved" ? "success" : "neutral"} icon={state === "reserved" ? <Check size={12} /> : undefined}>
                          {state === "reserved" ? "Units reserved" : "Declined"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" fullWidth leftIcon={<Check size={15} />} onClick={() => setHandled((p) => ({ ...p, [q.id]: "reserved" }))}>
                          Reserve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setHandled((p) => ({ ...p, [q.id]: "declined" }))}>
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
