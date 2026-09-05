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
import {
  ArrowLeft,
  Building,
  Hospital,
  MapPin,
  Navigation,
  Search,
  Sliders,
  User,
  Users,
} from "../../lib/icons";
import type { CandidateKind } from "../../types/models";

type Filter = "all" | CandidateKind;
type SortOption = "score" | "distance" | "eta";

export default function MatchingResults() {
  const { path, navigate } = useRouter();
  const params = matchPath("/app/requester/matches/:id", path);
  const requestId = params?.id;

  const { request, loading: requestLoading, error: requestError, refetch: refetchRequest } = useRequestDetail(requestId);
  const { candidates, loading: candidatesLoading, error: candidatesError, refetch: refetchCandidates } = useCandidates(requestId);

  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("score");

  const ranked = useMemo(() => {
    if (!request || candidates.length === 0) return [];
    return rankCandidates(candidates, request.bloodGroup, request.urgency);
  }, [candidates, request]);

  const filtered = useMemo(() => {
    if (filter === "all") return ranked;
    return ranked.filter((c) => c.candidate.kind === filter);
  }, [ranked, filter]);

  const sortedAndFiltered = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "distance") {
      list.sort((a, b) => a.candidate.distanceKm - b.candidate.distanceKm);
    } else if (sortBy === "eta") {
      list.sort((a, b) => a.candidate.etaMin - b.candidate.etaMin);
    } else {
      list.sort((a, b) => b.score - a.score);
    }
    return list;
  }, [filtered, sortBy]);

  const donorCount = ranked.filter((c) => c.candidate.kind === "donor").length;
  const bankCount = ranked.filter((c) => c.candidate.kind === "bank").length;

  const isLoading = requestLoading || candidatesLoading;
  const error = requestError || candidatesError;

  return (
    <AppShell title="Matching sources" active="/app/requester">
      <Link
        to="/app/dashboard"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
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
        <Card className="mb-6 bg-card border-primary/30 shadow-xs">
          <CardBody className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <BloodGroupChip group={request.bloodGroup} size="xl" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <UrgencyBadge urgency={request.urgency} size="sm" pulse={request.urgency === "critical"} />
                  <span className="text-xs text-urgent font-bold font-num">Needed by {request.requiredBy}</span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {request.units} units for {request.patientName}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Hospital size={14} className="text-primary" /> {request.hospital}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {request.location}</span>
                </p>
              </div>
            </div>
            <Link to={`/app/requester/track/${request.id}`} className="self-start sm:self-auto shrink-0">
              <Button variant="outline" size="sm" rightIcon={<Navigation size={14} />}>
                Track live dispatch
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Filter and sorting toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            {isLoading ? "Finding compatible sources…" : `${sortedAndFiltered.length} sources ready`}
          </h2>
          <p className="text-xs text-muted-foreground">
            Ranked in real-time by ABO compatibility, transit ETA, and readiness
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter pills */}
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            {[
              { key: "all", label: "All", count: ranked.length, icon: Users },
              { key: "bank", label: "Banks", count: bankCount, icon: Building },
              { key: "donor", label: "Donors", count: donorCount, icon: User },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key as Filter)}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  filter === t.key
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon size={13} />
                <span>{t.label}</span>
                <span className={cn("font-num rounded-full px-1 text-[10px]", filter === t.key ? "bg-white/20" : "bg-muted")}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="inline-flex items-center gap-1 text-xs border border-border bg-card px-2.5 h-10 rounded-xl">
            <Sliders size={13} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="score">Sort: Best Match</option>
              <option value="distance">Sort: Nearest Distance</option>
              <option value="eta">Sort: Fastest Transit ETA</option>
            </select>
          </div>
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

          {!isLoading && sortedAndFiltered.length === 0 && (
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
            sortedAndFiltered.map((item, i) => (
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
        <aside className="space-y-4 sticky top-20">
          <Card className="shadow-2xs">
            <CardBody className="p-4 sm:p-5">
              <h3 className="font-bold text-sm mb-3 text-foreground">Compatibility Assistant</h3>
              {request && <CompatibilityExplainer recipient={request.bloodGroup} allowSelect={false} />}
            </CardBody>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
