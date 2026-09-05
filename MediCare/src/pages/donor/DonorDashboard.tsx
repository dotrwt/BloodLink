import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { EmptyState, ErrorState, Skeleton, Stat } from "../../components/ui/misc";
import { useDonorDashboard } from "../../hooks/useDonorDashboard";
import { Link } from "../../lib/router";
import { cn } from "../../lib/cn";
import {
  Award,
  Check,
  CheckCircle,
  Clock,
  DropletFill,
  Heart,
  MapPin,
  ShieldCheck,
  Zap,
} from "../../lib/icons";

export default function DonorDashboard() {
  const {
    stats,
    emergencies,
    history,
    user,
    loading,
    error,
    refetch,
    toggleAvailability,
    pledgeDonation,
  } = useDonorDashboard();

  return (
    <AppShell title="Donor Dashboard" active="/app/donor">
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
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      )}

      {/* Main Donor View */}
      {(!loading || stats) && (
        <>
          {/* Top Banner: Greeting, Blood Group & Availability Switch */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome, {user?.name ? user.name.split(" ")[0] : "Donor"}
                </h1>
                {user?.bloodGroup && <BloodGroupChip group={user.bloodGroup} size="sm" />}
                <Badge tone="success" icon={<ShieldCheck size={13} />}>
                  Verified Volunteer
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your donations save lives. You are currently medically eligible to donate.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Availability Toggle */}
              {user && (
                <button
                  type="button"
                  onClick={toggleAvailability}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm",
                    user.availableToDonate
                      ? "bg-primary-soft/70 border-primary/40 text-primary hover:bg-primary-soft"
                      : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      user.availableToDonate ? "bg-primary animate-pulse" : "bg-muted-foreground"
                    )}
                  />
                  {user.availableToDonate ? "Available for emergency dispatch" : "Standby (Unavailable)"}
                </button>
              )}
            </div>
          </div>

          {/* Donor Stats Deck */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <Card>
                <CardBody>
                  <Stat
                    label="Donations completed"
                    value={stats.donationsCount}
                    tone="primary"
                    icon={<DropletFill size={14} />}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat
                    label="Lives impacted"
                    value={`${stats.livesImpacted}+`}
                    tone="success"
                    hint="~3 lives per unit"
                    icon={<Heart size={14} />}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat
                    label="Next eligible date"
                    value={stats.nextEligibleDate}
                    tone="primary"
                    icon={<Clock size={14} />}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat
                    label="Active nearby alerts"
                    value={stats.nearbyAlertsCount}
                    tone="critical"
                    hint="Within 10 km"
                    icon={<Zap size={14} />}
                  />
                </CardBody>
              </Card>
            </div>
          )}

          {/* Urgent Nearby Emergencies Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Urgent requests near you</h2>
                <p className="text-xs text-muted-foreground">Hospitals requiring immediate donor response</p>
              </div>
              <span className="text-xs font-semibold text-primary font-num">
                {emergencies.filter((e) => !e.isPledged).length} open
              </span>
            </div>

            {emergencies.length === 0 ? (
              <Card className="p-6">
                <EmptyState
                  icon={<DropletFill size={26} />}
                  title="No urgent emergencies nearby"
                  description="All local hospital blood requirements are presently fulfilled."
                />
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {emergencies.map((em) => (
                  <Card key={em.id} className="p-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <BloodGroupChip group={em.group} size="md" />
                        <UrgencyBadge urgency={em.urgency} pulse={em.urgency === "critical"} />
                      </div>
                      <h4 className="font-semibold text-base leading-snug">{em.hospital}</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                        <span className="flex items-center gap-1"><MapPin size={13} /> {em.dist} km</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><Clock size={13} /> By {em.by}</span>
                      </p>
                      <p className="text-xs font-medium text-foreground mt-2.5">
                        <span className="font-num font-bold text-sm text-primary">{em.units}</span> units requested
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                      {em.isPledged ? (
                        <span className="text-xs font-semibold text-success flex items-center gap-1.5 bg-success-soft px-2.5 py-1 rounded-lg">
                          <Check size={14} /> Pledged to donate
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<DropletFill size={13} />}
                          onClick={() => pledgeDonation(em.id)}
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

          {/* Donation Records / Milestones History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Your donation milestones</h2>
                <p className="text-xs text-muted-foreground">Verified clinical donation history</p>
              </div>
              <Link to="/app/profile" className="text-xs font-medium text-primary hover:underline">
                View certificates
              </Link>
            </div>

            {history.length === 0 ? (
              <Card className="p-6">
                <EmptyState
                  icon={<Award size={26} />}
                  title="No donation history yet"
                  description="When you complete your first donation, your verified certificate will appear here."
                />
              </Card>
            ) : (
              <Card>
                <div className="divide-y divide-border">
                  {history.map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-success-soft text-success shrink-0">
                          <DropletFill size={18} />
                        </span>
                        <div>
                          <p className="font-medium text-sm leading-snug">{record.hospital}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {record.date} &bull; {record.units} unit ({record.bloodGroup})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-success flex items-center gap-1">
                          <CheckCircle size={14} /> Verified
                        </span>
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
