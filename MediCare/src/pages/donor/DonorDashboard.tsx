import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/misc";
import { useDonorDashboard } from "../../hooks/useDonorDashboard";
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
  X,
  Zap,
} from "../../lib/icons";
import type { NearbyEmergency } from "../../types/models";

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

  const [selectedEmergency, setSelectedEmergency] = useState<NearbyEmergency | null>(null);
  const [pledgeToast, setPledgeToast] = useState<string | null>(null);

  function handleConfirmPledge() {
    if (!selectedEmergency) return;
    pledgeDonation(selectedEmergency.id);
    setPledgeToast(`Your pledge to donate at ${selectedEmergency.hospital} has been dispatched!`);
    setSelectedEmergency(null);
    setTimeout(() => setPledgeToast(null), 5000);
  }

  return (
    <AppShell title="Donor Hub" active="/app/donor">
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
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      )}

      {/* Main Donor View */}
      {(!loading || stats) && (
        <>
          {/* Pledge Success Toast */}
          {pledgeToast && (
            <div className="mb-5 p-3.5 rounded-2xl bg-success-soft border border-success/30 text-success text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-bl-fade-up">
              <span className="flex items-center gap-2">
                <CheckCircle size={16} /> {pledgeToast}
              </span>
              <button
                type="button"
                onClick={() => setPledgeToast(null)}
                className="text-xs text-success hover:underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Banner: Greeting, Blood Group & Availability Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Welcome, {user?.name ? user.name.split(" ")[0] : "Donor"}
                </h1>
                {user?.bloodGroup && <BloodGroupChip group={user.bloodGroup} size="sm" />}
                <Badge tone="success" icon={<ShieldCheck size={12} />}>
                  Verified Volunteer
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Every unit can save up to 3 lives. You are medically cleared for whole blood donation.
              </p>
            </div>

            {/* Tactile Emergency Dispatch Availability Switch */}
            {user && (
              <button
                type="button"
                onClick={toggleAvailability}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-2xs select-none active:scale-95",
                  user.availableToDonate
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    user.availableToDonate ? "bg-white animate-bl-pulse" : "bg-muted-foreground"
                  )}
                />
                <span>
                  {user.availableToDonate ? "On Call (10 km Radius)" : "Standby (Paused)"}
                </span>
              </button>
            )}
          </div>

          {/* Donor Stats Deck */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Donations</span>
                  <DropletFill size={14} className="text-primary" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.donationsCount}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Verified certificates</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Lives Impacted</span>
                  <Heart size={14} className="text-critical" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.livesImpacted}+
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">~3 lives per unit</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Next Eligible</span>
                  <Clock size={14} className="text-success" />
                </div>
                <div className="mt-1.5 font-num font-bold text-lg text-success">
                  {stats.nextEligibleDate}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Cooldown complete</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Nearby Alerts</span>
                  <Zap size={14} className="text-urgent" />
                </div>
                <div className="mt-1.5 font-num font-extrabold text-2xl text-foreground">
                  {stats.nearbyAlertsCount}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Within 10 km</p>
              </div>
            </div>
          )}

          {/* Urgent Nearby Emergencies Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Urgent requests near you
                </h2>
                <p className="text-xs text-muted-foreground">Hospitals requiring immediate volunteer donor pledges</p>
              </div>
              <span className="text-xs font-bold text-primary font-num">
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {emergencies.map((em) => (
                  <Card key={em.id} className="p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <BloodGroupChip group={em.group} size="md" />
                        <UrgencyBadge urgency={em.urgency} size="sm" pulse={em.urgency === "critical"} />
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate">
                        {em.hospital}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                        <span className="flex items-center gap-1 font-num"><MapPin size={12} /> {em.dist} km</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-num text-urgent font-medium"><Clock size={12} /> Needed by {em.by}</span>
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-2">
                        <span className="font-num font-bold text-primary">{em.units}</span> units requested
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between">
                      {em.isPledged ? (
                        <span className="text-xs font-bold text-success flex items-center gap-1.5 bg-success-soft px-2.5 py-1 rounded-lg">
                          <Check size={14} /> Pledged to donate
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<DropletFill size={13} />}
                          onClick={() => setSelectedEmergency(em)}
                          className="shadow-2xs"
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

          {/* Donation History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Your donation journey
                </h2>
                <p className="text-xs text-muted-foreground">Historical records, verification certificates and hospital feedback</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground font-num">
                {history.length} records verified
              </span>
            </div>

            <Card className="shadow-2xs">
              <div className="divide-y divide-border">
                {history.map((h) => (
                  <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-success-soft text-success shrink-0">
                        <Award size={18} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-foreground">{h.hospital}</h4>
                          <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                            <Check size={12} /> {h.status === "verified" ? "Verified" : "Completed"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {h.units} unit of {h.bloodGroup} &bull; Record ID: <span className="font-num">{h.id}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-semibold text-foreground font-num">{h.date}</span>
                      <p className="text-[11px] text-muted-foreground">Delivered to ICU patient</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Pledge Confirmation Modal */}
          {selectedEmergency && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
                onClick={() => setSelectedEmergency(null)}
              />

              <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6 z-10 animate-bl-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-critical-soft text-critical">
                      <DropletFill size={16} />
                    </span>
                    <h3 className="font-bold text-base text-foreground">Confirm Donation Pledge</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEmergency(null)}
                    className="flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="py-4 space-y-3.5 text-xs">
                  <div className="rounded-xl bg-muted/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Hospital:</span>
                      <span className="font-bold text-foreground">{selectedEmergency.hospital}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Required Group:</span>
                      <BloodGroupChip group={selectedEmergency.group} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Distance / ETA:</span>
                      <span className="font-num font-semibold text-foreground">
                        {selectedEmergency.dist} km · ~15 mins transit
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Required By:</span>
                      <span className="text-urgent font-bold font-num">{selectedEmergency.by}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-3 space-y-1.5 text-muted-foreground">
                    <p className="font-bold text-foreground">Pre-Donation Checklist:</p>
                    <p className="flex items-center gap-1.5 text-foreground/80">
                      <Check size={13} className="text-success shrink-0" /> Rested at least 6 hours & consumed fluids
                    </p>
                    <p className="flex items-center gap-1.5 text-foreground/80">
                      <Check size={13} className="text-success shrink-0" /> No alcohol in past 24 hours
                    </p>
                    <p className="flex items-center gap-1.5 text-foreground/80">
                      <Check size={13} className="text-success shrink-0" /> Government ID ready for verification
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEmergency(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="md"
                    rightIcon={<Heart size={15} />}
                    onClick={handleConfirmPledge}
                    className="shadow-xs"
                  >
                    Confirm & Send Pledge
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
