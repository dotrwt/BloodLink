import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Stat } from "../../components/ui/misc";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { cn } from "../../lib/cn";
import { setRole } from "../../lib/session";
import { CURRENT_USER, DONOR_HISTORY } from "../../lib/mock";
import { isCompatible } from "../../lib/blood";
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  DropletFill,
  Heart,
  MapPin,
  X,
} from "../../lib/icons";

const NEARBY = [
  { id: "e1", group: "O+" as const, urgency: "critical" as const, hospital: "Manipal Hospital", dist: 2.1, by: "6:00 PM", units: 3 },
  { id: "e2", group: "A+" as const, urgency: "urgent" as const, hospital: "Fortis, Bannerghatta", dist: 4.6, by: "Tonight", units: 2 },
  { id: "e3", group: "AB+" as const, urgency: "routine" as const, hospital: "Columbia Asia", dist: 7.2, by: "Tomorrow", units: 1 },
];

export default function DonorDashboard() {
  setRole("donor");
  const donor = CURRENT_USER.donor;
  const [available, setAvailable] = useState(true);
  const [responses, setResponses] = useState<Record<string, "accepted" | "declined">>({});

  // donor can help requests their group is compatible for
  const emergencies = NEARBY.filter((e) => isCompatible(donor.bloodGroup, e.group));

  return (
    <AppShell role="donor" title="Donor dashboard" active="/app/donor">
      {/* Availability + eligibility hero */}
      <div className="grid lg:grid-cols-[1fr_1fr] gap-4 mb-8">
        <Card className={cn(available ? "border-primary/30 bg-primary-soft/30" : "")}>
          <CardBody className="flex items-center gap-4">
            <span className={cn("flex size-14 items-center justify-center rounded-2xl shrink-0", available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              <DropletFill size={28} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg leading-tight">
                {available ? "You're available to donate" : "You're currently unavailable"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {available ? "You'll be alerted about nearby emergencies." : "Turn on to receive emergency alerts."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => setAvailable((v) => !v)}
              className={cn("relative h-7 w-12 rounded-full transition-colors shrink-0", available ? "bg-primary" : "bg-input")}
            >
              <span className={cn("absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform", available ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <BloodGroupChip group={donor.bloodGroup} size="xl" />
            <div>
              <Badge tone="success" icon={<CheckCircle size={13} />}>Eligible to donate</Badge>
              <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin size={14} /> {donor.location}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar size={14} /> Last donated 4 months ago
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Card><CardBody><Stat label="Donations" value="12" tone="primary" icon={<DropletFill size={14} />} /></CardBody></Card>
        <Card><CardBody><Stat label="Lives helped" value="9" tone="success" icon={<Heart size={14} />} /></CardBody></Card>
        <Card><CardBody><Stat label="Next eligible" value="Now" hint="90-day window met" icon={<Clock size={14} />} /></CardBody></Card>
      </div>

      {/* Nearby emergencies — one-tap actions */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Nearby emergencies</h2>
        <span className="text-sm text-muted-foreground">{emergencies.length} you can help</span>
      </div>
      <div className="space-y-3 mb-8">
        {emergencies.map((e) => {
          const resp = responses[e.id];
          return (
            <Card key={e.id} className={cn(e.urgency === "critical" && !resp && "border-critical/25")}>
              <CardBody className="flex items-center gap-4">
                <BloodGroupChip group={e.group} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <UrgencyBadge urgency={e.urgency} size="sm" pulse={e.urgency === "critical"} />
                    <span className="text-sm font-num text-muted-foreground">{e.dist} km</span>
                  </div>
                  <p className="font-semibold mt-1 leading-tight">{e.units} units · {e.hospital}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock size={13} /> by {e.by}</p>
                </div>
                {resp ? (
                  <Badge tone={resp === "accepted" ? "success" : "neutral"}>
                    {resp === "accepted" ? "Accepted" : "Declined"}
                  </Badge>
                ) : (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setResponses((p) => ({ ...p, [e.id]: "declined" }))}>
                      <X size={16} />
                    </Button>
                    <Button size="sm" leftIcon={<Check size={15} />} onClick={() => setResponses((p) => ({ ...p, [e.id]: "accepted" }))}>
                      Respond
                    </Button>
                  </div>
                )}
              </CardBody>
              {resp === "accepted" && (
                <div className="border-t border-border px-5 py-3 flex items-center justify-between animate-bl-fade-up">
                  <span className="text-sm text-success font-medium flex items-center gap-1.5">
                    <CheckCircle size={15} /> Thank you! The requester has been notified.
                  </span>
                  <Button size="sm" variant="outline" leftIcon={<MapPin size={14} />}>Share ETA</Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* History */}
      <Card>
        <CardHeader title="Donation history" subtitle="Your recent contributions." />
        <CardBody className="pt-2">
          <div className="divide-y divide-border">
            {DONOR_HISTORY.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <DropletFill size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.location}</p>
                  <p className="text-xs text-muted-foreground font-num">{d.date} · {d.recipient}</p>
                </div>
                <Badge tone="neutral">{d.units} unit</Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </AppShell>
  );
}
