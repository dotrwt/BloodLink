import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { BloodGroupChip, StatusStepper, UrgencyBadge } from "../../components/ui/domain";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/misc";
import { CompatibilityExplainer } from "../../components/domain/CompatibilityExplainer";
import { useDashboard } from "../../hooks/useDashboard";
import { STATUS_LABELS, STATUS_TONES } from "../../constants/statuses";
import { Link, useRouter } from "../../lib/router";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Clock,
  DropletFill,
  Heart,
  Hospital,
  MapPin,
  Plus,
  ShieldCheck,
  Zap,
} from "../../lib/icons";

export default function RequesterDashboard() {
  const { navigate } = useRouter();
  const {
    stats,
    requests,
    emergencies,
    user,
    loading,
    error,
    refetch,
    pledgeEmergency,
  } = useDashboard();

  const [showCompatibility, setShowCompatibility] = useState(false);
  const [pledgeNotice, setPledgeNotice] = useState<string | null>(null);

  const active = requests.filter(
    (r) => r.status !== "fulfilled" && r.status !== "cancelled"
  );

  const criticalRequest = active.find((r) => r.urgency === "critical");

  function handlePledge(id: string, hospitalName: string) {
    pledgeEmergency(id);
    setPledgeNotice(`Thank you! Your pledge for ${hospitalName} has been recorded.`);
    setTimeout(() => setPledgeNotice(null), 4000);
  }

  return (
    <AppShell title="Requester Dashboard" active="/app/requester">
      {/* Error state */}
      {error && (
        <div className="mb-6">
          <ErrorState message={error} retry={refetch} />
        </div>
      )}

      {/* Skeletons while loading */}
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
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      )}

      {/* Main Dynamic View */}
      {(!loading || stats) && (
        <>
          {/* Active Emergency High-Priority Notification Banner */}
          {criticalRequest && (
            <div className="mb-5 rounded-2xl border border-critical/30 bg-critical-soft p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-bl-scale-in">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-critical text-critical-foreground shrink-0 animate-bl-pulse">
                  <Zap size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-critical">Critical Emergency In Progress</span>
                    <span className="text-xs text-muted-foreground font-num">· Needed by {criticalRequest.requiredBy}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground leading-snug mt-0.5">
                    {criticalRequest.units} units {criticalRequest.bloodGroup} for {criticalRequest.patientName} at {criticalRequest.hospital}
                  </p>
                </div>
              </div>
              <Link to={`/app/requester/matches/${criticalRequest.id}`} className="self-start sm:self-auto shrink-0">
                <Button size="sm" variant="danger" rightIcon={<ArrowRight size={14} />}>
                  Review matches now
                </Button>
              </Link>
            </div>
          )}

          {/* Feedback notice on pledge */}
          {pledgeNotice && (
            <div className="mb-4 p-3 rounded-xl bg-success-soft border border-success/30 text-success text-xs font-bold flex items-center justify-between animate-bl-fade-up">
              <span className="flex items-center gap-1.5">
                <Heart size={14} className="fill-success" /> {pledgeNotice}
              </span>
              <button
                type="button"
                onClick={() => setPledgeNotice(null)}
                className="text-success hover:underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Greeting & Primary Emergency Request CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Hello, {user?.name ? user.name.split(" ")[0] : "there"}
                </h1>
                <Badge tone="primary" icon={<ShieldCheck size={12} />}>
                  Patient Advocate
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {active.length === 0
                  ? "No requests in progress. Ready to assist anytime."
                  : `You have ${active.length} active emergency ${active.length === 1 ? "request" : "requests"} being matched.`}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link to="/app/requester/new" className="w-full sm:w-auto">
                <Button size="md" leftIcon={<Plus size={18} />} className="shadow-xs w-full sm:w-auto">
                  New blood request
                </Button>
              </Link>
            </div>
          </div>

          {/* Compact Responsive Metrics Row */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Active Requests</span>
                  <Activity size={14} className="text-primary" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.activeRequestsCount}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Live in matching</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Units Secured</span>
                  <ShieldCheck size={14} className="text-success" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.unitsSecuredDisplay}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Across active</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Fulfilled</span>
                  <Zap size={14} className="text-primary" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.fulfilledCount}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Safely delivered</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Avg. Response</span>
                  <Clock size={14} className="text-urgent" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.avgResponseTime}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Donor pickup</p>
              </div>
            </div>
          )}

          {/* Active Requests Section */}
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Active emergency requests
              </h2>
              <p className="text-xs text-muted-foreground">
                Live matching and en-route coordinator updates
              </p>
            </div>
            <Link
              to="/app/requester/history"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all ({requests.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {/* Empty State vs Requests List */}
          {active.length === 0 ? (
            <Card className="mb-8">
              <EmptyState
                icon={<Plus size={26} />}
                title="No active requests"
                description="When someone needs blood, create a request and we'll instantly rank compatible sources nearby."
                action={
                  <Button leftIcon={<Plus size={16} />} onClick={() => navigate("/app/requester/new")}>
                    Create a request
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-3.5 mb-8">
              {active.map((r) => {
                const percent = Math.min(100, Math.round((r.unitsSecured / r.units) * 100));
                return (
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
                    className="shadow-2xs hover:shadow-xs transition-all duration-200"
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <BloodGroupChip group={r.bloodGroup} size="lg" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <UrgencyBadge urgency={r.urgency} size="sm" pulse={r.urgency === "critical"} />
                            <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                            <span className="text-[11px] text-muted-foreground font-num ml-auto hidden sm:inline">
                              ID: {r.id}
                            </span>
                          </div>

                          <h3 className="mt-2 font-bold text-base sm:text-lg leading-tight text-foreground">
                            {r.units} units required · {r.patientName}
                          </h3>

                          <div className="mt-1.5 space-y-1 text-xs sm:text-sm text-muted-foreground">
                            <p className="flex items-center gap-1.5 font-medium text-foreground/90 truncate">
                              <Hospital size={14} className="text-primary shrink-0" /> {r.hospital}
                            </p>
                            <div className="flex items-center gap-3 text-xs flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="shrink-0" /> {r.location}
                              </span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1 font-num text-urgent font-medium">
                                <Clock size={12} className="shrink-0" /> Needed by {r.requiredBy}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar of units secured */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-foreground">
                                {r.unitsSecured} of {r.units} units secured
                              </span>
                              <span className="font-num font-bold text-primary">{percent}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {r.status !== "matching" && (
                        <div className="mt-4 pt-3 border-t border-border/80">
                          <StatusStepper status={r.status} />
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/60">
                        <span className="text-xs text-muted-foreground font-num">
                          Created {r.createdAt}
                        </span>
                        <Button
                          size="sm"
                          variant={r.status === "matching" ? "primary" : "outline"}
                          rightIcon={<ArrowRight size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              r.status === "matching"
                                ? `/app/requester/matches/${r.id}`
                                : `/app/requester/track/${r.id}`
                            );
                          }}
                        >
                          {r.status === "matching" ? "View live matches" : "Track dispatch"}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Compatibility Lookup Tool Widget */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowCompatibility((v) => !v)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <DropletFill size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Interactive Blood Compatibility Checker</h3>
                  <p className="text-xs text-muted-foreground">Test recipient-to-donor compatibility matrix on the fly</p>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform duration-200 ${showCompatibility ? "rotate-180" : ""}`}
              />
            </button>

            {showCompatibility && (
              <div className="mt-2 rounded-2xl border border-border bg-card p-5 animate-bl-fade-up">
                <CompatibilityExplainer allowSelect={true} />
              </div>
            )}
          </div>

          {/* Nearby Urgent Blood Requirements */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Nearby urgent hospital requirements
                </h2>
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {emergencies.map((em) => (
                  <Card key={em.id} className="p-4 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <BloodGroupChip group={em.group} size="md" />
                        <UrgencyBadge urgency={em.urgency} size="sm" pulse={em.urgency === "critical"} />
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{em.hospital}</h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1 font-num"><MapPin size={12} /> {em.dist} km</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-num text-urgent font-medium"><Clock size={12} /> Need: {em.by}</span>
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-2">
                        {em.units} units requested
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      {em.isPledged ? (
                        <span className="text-xs font-bold text-success flex items-center gap-1">
                          <Heart size={14} className="fill-success text-success" /> Pledged
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<DropletFill size={13} />}
                          onClick={() => handlePledge(em.id, em.hospital)}
                        >
                          I can donate
                        </Button>
                      )}
                      <span className="text-[11px] text-muted-foreground font-num">ETA ~15m</span>
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
