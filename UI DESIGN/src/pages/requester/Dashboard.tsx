import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, Stat } from "../../components/ui/misc";
import { BloodGroupChip, StatusStepper, UrgencyBadge } from "../../components/ui/domain";
import { Link, useRouter } from "../../lib/router";
import { setRole } from "../../lib/session";
import { REQUESTS, CURRENT_USER } from "../../lib/mock";
import type { BloodRequest } from "../../lib/types";
import {
  Activity,
  ArrowRight,
  Clock,
  Hospital,
  MapPin,
  Plus,
} from "../../lib/icons";

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

export default function RequesterDashboard() {
  const { navigate } = useRouter();
  setRole("requester");
  const active = REQUESTS.filter((r) => r.status !== "fulfilled" && r.status !== "cancelled");
  const fulfilled = REQUESTS.filter((r) => r.status === "fulfilled");

  return (
    <AppShell role="requester" title="Dashboard" active="/app/requester">
      {/* Greeting + primary action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hello, {CURRENT_USER.requester.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            You have {active.length} active {active.length === 1 ? "request" : "requests"} in progress.
          </p>
        </div>
        <Link to="/app/requester/new">
          <Button size="lg" leftIcon={<Plus size={18} />}>New blood request</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          <Stat key="a" label="Active" value={active.length} tone="primary" icon={<Activity size={14} />} />,
          <Stat key="b" label="Units secured" value="4 / 6" hint="across active requests" icon={<Activity size={14} />} />,
          <Stat key="c" label="Fulfilled" value={fulfilled.length} tone="success" icon={<Activity size={14} />} />,
          <Stat key="d" label="Avg. response" value="11m" hint="last 30 days" icon={<Clock size={14} />} />,
        ].map((s, i) => (
          <Card key={i}><CardBody>{s}</CardBody></Card>
        ))}
      </div>

      {/* Active requests */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Active requests</h2>
        <Link to="/app/requester/history" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {active.length === 0 ? (
        <Card>
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
        <div className="space-y-4">
          {active.map((r) => (
            <Card key={r.id} interactive onClick={() => navigate(r.status === "matching" ? `/app/requester/matches/${r.id}` : `/app/requester/track/${r.id}`)}>
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
                      <p className="flex items-center gap-1.5"><Hospital size={14} /> {r.hospital}</p>
                      <p className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> {r.location}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> by {r.requiredBy}</span>
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Secured</p>
                    <p className="font-num text-xl font-bold">
                      <span className={r.unitsSecured >= r.units ? "text-success" : "text-foreground"}>{r.unitsSecured}</span>
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
                      navigate(r.status === "matching" ? `/app/requester/matches/${r.id}` : `/app/requester/track/${r.id}`);
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
    </AppShell>
  );
}
