import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/misc";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { MatchCandidateCard } from "../../components/domain/MatchCandidateCard";
import { CompatibilityExplainer } from "../../components/domain/CompatibilityExplainer";
import { cn } from "../../lib/cn";
import { Link, matchPath, useRouter } from "../../lib/router";
import { rankCandidates } from "../../lib/blood";
import { CANDIDATES, REQUESTS } from "../../lib/mock";
import { ArrowLeft, Building, Hospital, MapPin, Search, User, Users } from "../../lib/icons";
import type { CandidateKind } from "../../lib/types";

type Filter = "all" | CandidateKind;

export default function MatchingResults() {
  const { path, navigate } = useRouter();
  const params = matchPath("/app/requester/matches/:id", path);
  const request = REQUESTS.find((r) => r.id === params?.id) ?? REQUESTS[0];

  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 1200);
    return () => clearTimeout(t);
  }, [request.id]);

  const ranked = useMemo(
    () => rankCandidates(CANDIDATES, request.bloodGroup, request.urgency),
    [request.bloodGroup, request.urgency],
  );
  const shown = ranked.filter((r) => (filter === "all" ? true : r.candidate.kind === filter));
  const donorCount = ranked.filter((r) => r.candidate.kind === "donor").length;
  const bankCount = ranked.filter((r) => r.candidate.kind === "bank").length;

  function select(id: string) {
    navigate(`/app/requester/track/${request.id}?source=${id}`);
  }

  return (
    <AppShell role="requester" title="Matching results" active="/app/requester/new">
      <Link to="/app/requester" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      {/* Request summary — hierarchy: group + urgency dominate */}
      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-center gap-4">
          <BloodGroupChip group={request.bloodGroup} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <UrgencyBadge urgency={request.urgency} pulse={request.urgency === "critical"} />
              <span className="text-sm text-muted-foreground font-num">Required by {request.requiredBy}</span>
            </div>
            <h1 className="mt-1.5 text-xl font-bold">{request.units} units · {request.patientName}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Hospital size={14} /> {request.hospital}
              <span className="mx-1">·</span>
              <MapPin size={14} /> {request.location}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-[1fr_18rem] gap-6 items-start">
        <div>
          {/* Filter bar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="inline-flex rounded-xl border border-border bg-card p-1">
              {([["all", "All", ranked.length], ["donor", "Donors", donorCount], ["bank", "Banks", bankCount]] as const).map(
                ([f, label, count]) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as Filter)}
                    className={cn(
                      "px-3.5 h-8 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5",
                      filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f === "donor" && <User size={14} />}
                    {f === "bank" && <Building size={14} />}
                    {label}
                    <span className={cn("font-num text-xs", filter === f ? "opacity-80" : "opacity-60")}>{count}</span>
                  </button>
                ),
              )}
            </div>
            <span className="text-xs text-muted-foreground">Ranked by best fit</span>
          </div>

          {phase === "loading" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Scanning compatible donors and banks nearby…
              </p>
              {[0, 1, 2].map((i) => (
                <Card key={i}><CardBody className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((j) => <Skeleton key={j} className="h-10" />)}
                  </div>
                </CardBody></Card>
              ))}
            </div>
          )}

          {phase === "error" && (
            <Card><ErrorState onRetry={() => setPhase("loading")} /></Card>
          )}

          {phase === "ready" && shown.length === 0 && (
            <Card>
              <EmptyState
                icon={<Users size={26} />}
                title="No matches in this filter"
                description={filter === "all"
                  ? "No compatible sources found nearby right now. Try widening your search radius or check back shortly."
                  : `No ${filter === "donor" ? "donors" : "blood banks"} available. Try another filter.`}
                action={filter !== "all" ? <Button variant="outline" size="sm" onClick={() => setFilter("all")}>Show all</Button> : <Button variant="outline" size="sm" leftIcon={<Search size={15} />}>Widen radius</Button>}
              />
            </Card>
          )}

          {phase === "ready" && shown.length > 0 && (
            <div className="space-y-4">
              {shown.map((r, i) => (
                <MatchCandidateCard
                  key={r.candidate.id}
                  ranked={r}
                  rank={i + 1}
                  recipient={request.bloodGroup}
                  onSelect={select}
                />
              ))}
            </div>
          )}
        </div>

        {/* Side rail */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Card>
            <CardBody>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Why these matches
              </p>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  ["Compatibility", "Exact group first, then compatible"],
                  ["Availability", "Donor eligibility & bank stock"],
                  ["Distance", "Closer sources rank higher"],
                  ["Urgency fit", "Faster ETA weighted when critical"],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong className="text-foreground">{t}</strong> — {d}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CompatibilityExplainer recipient={request.bloodGroup} compact />
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
