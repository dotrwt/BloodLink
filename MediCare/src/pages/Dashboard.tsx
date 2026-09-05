import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState, Stat } from "../components/ui/misc";
import { BloodGroupChip, StatusStepper, UrgencyBadge } from "../components/ui/domain";
import { Link, useRouter } from "../lib/router";
import { setRole } from "../lib/session";
import { REQUESTS, CURRENT_USER } from "../lib/mock";
import { cn } from "../lib/cn";
import type { BloodRequest } from "../lib/types";
import {
  Activity,
  ArrowRight,
  Clock,
  DropletFill,
  Heart,
  Hospital,
  MapPin,
  Plus,
  ShieldCheck,
  Zap,
} from "../lib/icons";

const STATUS_TONE = {
  matching: "info",
  contacted: "info",
  accepted: "primary",
  en_route: "primary",
  confirmed: "success",
  fulfilled: "success",
  cancelled: "neutral",
} as const;

const STATUS_LABEL: Record<BloodRequest["status"], string> = {
  matching: "Finding matches",
  contacted: "Contacted",
  accepted: "Accepted",
  en_route: "En route",
  confirmed: "Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

const NEARBY_EMERGENCIES = [
  { id: "e1", group: "O+" as const, urgency: "critical" as const, hospital: "Manipal Hospital", dist: 2.1, by: "6:00 PM", units: 3 },
  { id: "e2", group: "A+" as const, urgency: "urgent" as const, hospital: "Fortis, Bannerghatta", dist: 4.6, by: "Tonight", units: 2 },
  { id: "e3", group: "AB+" as const, urgency: "routine" as const, hospital: "Columbia Asia", dist: 7.2, by: "Tomorrow", units: 1 },
];

export default function Dashboard() {
  const { navigate } = useRouter();
  setRole("requester");

  const [availableToDonate, setAvailableToDonate] = useState(true);
  const [pledged, setPledged] = useState<Record<string, boolean>>({});

  const active = REQUESTS.filter((r) => r.status !== "fulfilled" && r.status !== "cancelled");
  const fulfilled = REQUESTS.filter((r) => r.status === "fulfilled");

  function handlePledge(id: string) {
    setPledged((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <AppShell title="Dashboard" active="/app/dashboard">
      {/* Top Banner: Greeting, Availability & Primary CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hello, {CURRENT_USER.requester.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            You have {active.length} active {active.length === 1 ? "request" : "requests"} in progress.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Donor Availability Quick Toggle */}
          <button
            type="button"
            onClick={() => setAvailableToDonate((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
              availableToDonate
                ? "bg-primary-soft/60 border-primary/40 text-primary"
                : "bg-muted border-border text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                availableToDonate ? "bg-primary animate-pulse" : "bg-muted-foreground"
              )}
            />
            {availableToDonate ? "Available to donate" : "Unavailable to donate"}
          </button>

          <Link to="/app/requester/new">
            <Button size="md" leftIcon={<Plus size={18} />}>
              New blood request
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          <Stat key="a" label="Active requests" value={active.length} tone="primary" icon={<Activity size={14} />} />,
          <Stat key="b" label="Units secured" value="4 / 6" hint="across active requests" icon={<ShieldCheck size={14} />} />,
          <Stat key="c" label="Fulfilled" value={fulfilled.length} tone="success" icon={<Zap size={14} />} />,
          <Stat key="d" label="Avg. response" value="11m" hint="last 30 days" icon={<Clock size={14} />} />,
        ].map((s, i) => (
          <Card key={i}><CardBody>{s}</CardBody></Card>
        ))}
      </div>

      {/* Active Requests Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Active emergency requests</h2>
          <p className="text-xs text-muted-foreground">Requests currently being matched and tracked</p>
        </div>
        <Link
          to="/app/requester/history"
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {active.length === 0 ? (
        <Card className="mb-8">
          <EmptyState
            icon={<Plus size={26} />}
            title="No active requests"
            description="When someone needs blood, create a request and we'll find compatible sources nearby."
            action={
              <Button leftIcon={<Plus size={16} />} onClick={() => navigate("/app/requester/new")}>
                Create a request
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {active.map((r) => (
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
              <CardBody>
                <div className="flex items-start gap-4">
                  <BloodGroupChip group={r.bloodGroup} size="xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <UrgencyBadge urgency={r.urgency} pulse={r.urgency === "critical"} />
                      <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    </div>
                    <h3 className="mt-2 font-semibold text-lg leading-tight">
                      {r.units} units · {r.patientName}
                    </h3>
                    <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Hospital size={14} /> {r.hospital}
                      </p>
                      <p className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} /> {r.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> by {r.requiredBy}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Secured</p>
                    <p className="font-num text-xl font-bold">
                      <span className={r.unitsSecured >= r.units ? "text-success" : "text-foreground"}>
                        {r.unitsSecured}
                      </span>
                      <span className="text-muted-foreground">/{r.units}</span>
                    </p>
                  </div>
                </div>

                {r.status !== "matching" && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <StatusStepper status={r.status} />
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={r.status === "matching" ? "primary" : "outline"}
                    rightIcon={<ArrowRight size={15} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        r.status === "matching"
                          ? `/app/requester/matches/${r.id}`
                          : `/app/requester/track/${r.id}`
                      );
                    }}
                  >
                    {r.status === "matching" ? "View matches" : "Track request"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Nearby Urgent Blood Requirements */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Nearby urgent requirements</h2>
            <p className="text-xs text-muted-foreground">Hospitals in your vicinity requiring donor pledges</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {NEARBY_EMERGENCIES.map((em) => (
            <Card key={em.id} className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <BloodGroupChip group={em.group} size="md" />
                  <UrgencyBadge urgency={em.urgency} pulse={em.urgency === "critical"} />
                </div>
                <h4 className="font-semibold text-base">{em.hospital}</h4>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {em.dist} km</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> Need: {em.by}</span>
                </p>
                <p className="text-xs font-medium text-foreground mt-2">
                  {em.units} units requested
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                {pledged[em.id] ? (
                  <span className="text-xs font-semibold text-success flex items-center gap-1">
                    <Heart size={14} className="fill-success text-success" /> Pledged
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<DropletFill size={13} />}
                    onClick={() => handlePledge(em.id)}
                  >
                    I can donate
                  </Button>
                )}
                <span className="text-xs text-muted-foreground font-num">ETA ~15m</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
