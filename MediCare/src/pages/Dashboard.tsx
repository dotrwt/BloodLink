import { AppShell } from "../components/layout/AppShell";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState, ErrorState, Skeleton, Stat } from "../components/ui/misc";
import { BloodGroupChip, StatusStepper, UrgencyBadge } from "../components/ui/domain";
import { Link, useRouter } from "../lib/router";
import { useDashboard } from "../hooks/useDashboard";
import { STATUS_LABELS, STATUS_TONES } from "../constants/statuses";
import { cn } from "../lib/cn";
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

export default function Dashboard() {
  const { navigate } = useRouter();
  const {
    stats,
    requests,
    emergencies,
    user,
    loading,
    error,
    refetch,
    toggleAvailability,
    pledgeEmergency,
  } = useDashboard();

  const active = requests.filter((r) => r.status !== "fulfilled" && r.status !== "cancelled");

  return (
    <AppShell title="Dashboard" active="/app/dashboard">
      {/* Error State */}
      {error && (
        <div className="mb-6">
          <ErrorState message={error} retry={refetch} />
        </div>
      )}

      {/* Loading Skeleton */}
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
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      )}

      {/* Main Dynamic View */}
      {(!loading || stats) && (
        <>
          {/* Top Banner: Greeting, Availability & Primary CTA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Hello, {user?.name ? user.name.split(" ")[0] : "there"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                You have {active.length} active {active.length === 1 ? "request" : "requests"} in progress.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Donor Availability Quick Toggle */}
              {user && (
                <button
                  type="button"
                  onClick={toggleAvailability}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                    user.availableToDonate
                      ? "bg-primary-soft/60 border-primary/40 text-primary"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      user.availableToDonate ? "bg-primary animate-pulse" : "bg-muted-foreground"
                    )}
                  />
                  {user.availableToDonate ? "Available to donate" : "Unavailable to donate"}
                </button>
              )}

              <Link to="/app/requester/new">
                <Button size="md" leftIcon={<Plus size={18} />}>
                  New blood request
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Metrics Row (Dynamic from statsService) */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {[
                <Stat key="a" label="Active requests" value={stats.activeRequestsCount} tone="primary" icon={<Activity size={14} />} />,
                <Stat key="b" label="Units secured" value={stats.unitsSecuredDisplay} hint="across active requests" icon={<ShieldCheck size={14} />} />,
                <Stat key="c" label="Fulfilled" value={stats.fulfilledCount} tone="success" icon={<Zap size={14} />} />,
                <Stat key="d" label="Avg. response" value={stats.avgResponseTime} hint="last 30 days" icon={<Clock size={14} />} />,
              ].map((s, i) => (
                <Card key={i}><CardBody>{s}</CardBody></Card>
              ))}
            </div>
          )}

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

          {/* Empty State vs Requests List */}
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
                          <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
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

          {/* Nearby Urgent Blood Requirements (Dynamic from emergencyService) */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Nearby urgent requirements</h2>
                <p className="text-xs text-muted-foreground">Hospitals in your vicinity requiring donor pledges</p>
              </div>
            </div>

            {emergencies.length === 0 ? (
              <Card className="p-6">
                <EmptyState
                  icon={<DropletFill size={24} />}
                  title="No urgent emergencies nearby"
                  description="All nearby hospital requirements are currently fulfilled."
                />
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {emergencies.map((em) => (
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
                      {em.isPledged ? (
                        <span className="text-xs font-semibold text-success flex items-center gap-1">
                          <Heart size={14} className="fill-success text-success" /> Pledged
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<DropletFill size={13} />}
                          onClick={() => pledgeEmergency(em.id)}
                        >
                          I can donate
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground font-num">ETA ~15m</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
