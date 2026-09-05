import { useMemo, useState } from "react";
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
import { useRequestDetail } from "../../hooks/useRequestDetail";
import { useCandidates } from "../../hooks/useCandidates";
import { ArrowLeft, Building, Hospital, MapPin, Search, User, Users } from "../../lib/icons";
import type { CandidateKind } from "../../types/models";

type Filter = "all" | CandidateKind;

export default function MatchingResults() {
  const { path, navigate } = useRouter();
  const params = matchPath("/app/requester/matches/:id", path);
  const requestId = params?.id;

  const { request, loading: requestLoading, error: requestError, refetch: refetchRequest } = useRequestDetail(requestId);
  const { candidates, loading: candidatesLoading, error: candidatesError, refetch: refetchCandidates } = useCandidates(requestId);

  const [filter, setFilter] = useState<Filter>("all");

  const ranked = useMemo(() => {
    if (!request || candidates.length === 0) return [];
    return rankCandidates(candidates, request.bloodGroup, request.urgency);
  }, [candidates, request]);

  const filtered = useMemo(() => {
    if (filter === "all") return ranked;
    return ranked.filter((c) => c.candidate.kind === filter);
  }, [ranked, filter]);

  const donorCount = ranked.filter((c) => c.candidate.kind === "donor").length;
  const bankCount = ranked.filter((c) => c.candidate.kind === "bank").length;

  const isLoading = requestLoading || candidatesLoading;
  const error = requestError || candidatesError;

  return (
    <AppShell title="Matching sources" active="/app/requester">
      <Link to="/app/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      {error && (
        <div className="mb-6">
          <ErrorState
            message={error}
            retry={() => {
              refetchRequest();
              refetchCandidates();
            }}
          />
        </div>
      )}

      {/* Summary card for the active request */}
      {request && (
        <Card className="mb-6 bg-card border-primary/25">
          <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <BloodGroupChip group={request.bloodGroup} size="xl" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <UrgencyBadge urgency={request.urgency} pulse={request.urgency === "critical"} />
                  <span className="text-xs text-muted-foreground font-num">Needed by {request.requiredBy}</span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight">
                  {request.units} units for {request.patientName}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><Hospital size={14} /> {request.hospital}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {request.location}</span>
                </p>
              </div>
            </div>
            <Link to={`/app/requester/track/${request.id}`} className="self-start sm:self-auto">
              <Button variant="outline" size="sm">Track request</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Filter and counts bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold">
            {isLoading ? "Finding compatible sources…" : `${filtered.length} sources ranked`}
          </h2>
          <p className="text-xs text-muted-foreground">
            Ranked by ABO compatibility, travel distance, and donor readiness
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {[
            { key: "all", label: "All", count: ranked.length, icon: Users },
            { key: "bank", label: "Blood banks", count: bankCount, icon: Building },
            { key: "donor", label: "Donors", count: donorCount, icon: User },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key as Filter)}
              className={cn(
                "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                filter === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon size={13} />
              {t.label}
              <span className={cn("font-num rounded-full px-1 text-[10px]", filter === t.key ? "bg-white/20" : "bg-muted")}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
        {/* Results column */}
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <Card>
              <EmptyState
                icon={<Search size={28} />}
                title="No sources match this filter"
                description="Try switching to 'All' or widen your search radius to see more candidates."
                action={
                  <Button size="sm" variant="outline" onClick={() => setFilter("all")}>
                    Show all sources
                  </Button>
                }
              />
            </Card>
          )}

          {!isLoading &&
            filtered.map((item, i) => (
              <MatchCandidateCard
                key={item.candidate.id}
                ranked={item}
                recipient={request?.bloodGroup || "O+"}
                rank={i + 1}
                onSelect={() => navigate(`/app/requester/track/${request?.id || requestId}`)}
              />
            ))}
        </div>

        {/* Compatibility Explainer Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardBody>
              <h3 className="font-semibold text-sm mb-3">ABO / Rh compatibility</h3>
              {request && <CompatibilityExplainer recipient={request.bloodGroup} />}
            </CardBody>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
