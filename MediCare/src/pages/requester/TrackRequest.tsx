import { useEffect, useRef, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar, ErrorState, Skeleton } from "../../components/ui/misc";
import { StatusStepper } from "../../components/ui/domain";
import { Link, matchPath, useRouter } from "../../lib/router";
import { useRequestDetail } from "../../hooks/useRequestDetail";
import type { RequestStatus } from "../../types/models";
import {
  ArrowLeft,
  Building,
  CheckCircle,
  Clock,
  Hospital,
  MapPin,
  Phone,
  Play,
  RotateCcw,
  ShieldCheck,
  User,
} from "../../lib/icons";

const SEQ: RequestStatus[] = ["matching", "contacted", "accepted", "en_route", "confirmed", "fulfilled"];

export default function TrackRequest() {
  const { path, navigate } = useRouter();
  const params = matchPath("/app/requester/track/:id", path);
  const requestId = params?.id;

  const { request, loading, error, refetch, updateStatus } = useRequestDetail(requestId);

  const [auto, setAuto] = useState(false);
  const timer = useRef<number | null>(null);

  const status = request?.status || "contacted";

  useEffect(() => {
    if (!auto) return;
    if (status === "fulfilled" || status === "confirmed") return;
    timer.current = window.setTimeout(() => {
      const next = SEQ[Math.min(SEQ.indexOf(status) + 1, SEQ.length - 1)];
      updateStatus(next);
    }, 3200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status, auto, updateStatus]);

  if (loading) {
    return (
      <AppShell title="Track request" active="/app/requester">
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (error || !request) {
    return (
      <AppShell title="Track request" active="/app/requester">
        <ErrorState message={error || "Request not found"} retry={refetch} />
      </AppShell>
    );
  }

  const source = request.source || { name: "Sanjeevani Blood Centre", kind: "bank" as const };
  const isBank = source.kind === "bank";

  const statusCopy: Record<RequestStatus, { title: string; body: string }> = {
    matching: { title: "Finding matches", body: "Searching for compatible sources." },
    contacted: { title: `${source.name} has been contacted`, body: "Waiting for confirmation." },
    accepted: { title: `${source.name} accepted`, body: isBank ? "Units are being prepared for dispatch." : "The donor is preparing to head over." },
    en_route: { title: isBank ? "Units dispatched" : `${source.name} is en route`, body: "Estimated arrival in ~18 minutes." },
    confirmed: { title: "Blood confirmed at hospital", body: "The unit has been received. You can mark this request fulfilled." },
    fulfilled: { title: "Fulfilled", body: "This request is complete." },
    cancelled: { title: "Cancelled", body: "This request has been cancelled." },
  };

  function advance() {
    const i = SEQ.indexOf(status);
    if (i < SEQ.length - 1) updateStatus(SEQ[i + 1]);
  }

  function reset() {
    updateStatus("contacted");
  }

  return (
    <AppShell title="Track request" active="/app/requester">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Link to="/app/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <span className="text-xs text-muted-foreground font-num">ID: {request.id}</span>
      </div>

      {/* Main tracking card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge tone="neutral" className="bg-white/15 text-primary-foreground border-white/20">
              Live tracking
            </Badge>
            <span className="text-xs text-primary-foreground/80 font-num">Updated just now</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            {statusCopy[status].title}
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/85">
            {statusCopy[status].body}
          </p>
        </div>

        <CardBody className="p-6">
          <StatusStepper status={status} />

          {/* Source information card */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={source.name} size="lg" icon={isBank ? <Building size={20} /> : <User size={20} />} />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {isBank ? "Partner Blood Bank" : "Verified Volunteer Donor"}
                </p>
                <p className="font-semibold text-base">{source.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-success"><ShieldCheck size={13} /> Verified</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" leftIcon={<Phone size={14} />}>
                Call coordinator
              </Button>
            </div>
          </div>

          {/* Interactive demo advancement */}
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Simulate status:</span>
              <Button size="sm" variant="outline" onClick={advance} disabled={status === "fulfilled"}>
                Next step
              </Button>
              <Button
                size="sm"
                variant={auto ? "primary" : "ghost"}
                leftIcon={<Play size={12} />}
                onClick={() => setAuto((v) => !v)}
              >
                {auto ? "Auto playing" : "Auto play"}
              </Button>
              <Button size="sm" variant="ghost" leftIcon={<RotateCcw size={12} />} onClick={reset}>
                Reset
              </Button>
            </div>

            {status === "confirmed" && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<CheckCircle size={14} />}
                onClick={() => {
                  updateStatus("fulfilled");
                  navigate(`/app/requester/fulfilled/${request.id}`);
                }}
              >
                Mark as fulfilled
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Hospital details */}
      <Card>
        <CardHeader title="Delivery Destination" />
        <CardBody className="pt-0 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 text-foreground font-medium">
            <Hospital size={15} /> {request.hospital}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={15} /> {request.location}
          </p>
          <p className="flex items-center gap-2">
            <Clock size={15} /> Required by: {request.requiredBy}
          </p>
        </CardBody>
      </Card>
    </AppShell>
  );
}
