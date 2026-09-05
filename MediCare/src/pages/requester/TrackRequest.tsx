import { useEffect, useRef, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar, Divider } from "../../components/ui/misc";
import { BloodGroupChip, StatusStepper, UrgencyBadge } from "../../components/ui/domain";
import { Link, matchPath, useRouter } from "../../lib/router";
import { CANDIDATES, REQUESTS } from "../../lib/mock";
import type { RequestStatus } from "../../lib/types";
import {
  ArrowLeft,
  Building,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Truck,
} from "../../lib/icons";

const SEQ: RequestStatus[] = ["contacted", "accepted", "en_route", "confirmed"];

export default function TrackRequest() {
  const { path, navigate } = useRouter();
  const params = matchPath("/app/requester/track/:id", path);
  const request = REQUESTS.find((r) => r.id === params?.id) ?? REQUESTS[0];

  const sourceId = new URLSearchParams(path.split("?")[1] ?? "").get("source");
  const source =
    CANDIDATES.find((c) => c.id === sourceId) ??
    CANDIDATES.find((c) => c.name === request.source?.name) ??
    CANDIDATES[0];

  const [status, setStatus] = useState<RequestStatus>(
    request.status === "matching" ? "contacted" : request.status,
  );
  const [auto, setAuto] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!auto) return;
    if (status === "confirmed") return;
    timer.current = window.setTimeout(() => {
      const next = SEQ[Math.min(SEQ.indexOf(status) + 1, SEQ.length - 1)];
      setStatus(next);
    }, 3200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status, auto]);

  const isBank = source.kind === "bank";

  const statusCopy: Record<RequestStatus, { title: string; body: string }> = {
    matching: { title: "Finding matches", body: "Searching for compatible sources." },
    contacted: { title: `${source.name} has been contacted`, body: "Waiting for them to accept the request." },
    accepted: { title: `${source.name} accepted`, body: isBank ? "Units are being prepared for dispatch." : "The donor is preparing to head over." },
    en_route: { title: isBank ? "Units dispatched" : `${source.name} is en route`, body: `Estimated arrival in ~${source.etaMin} minutes.` },
    confirmed: { title: "Blood confirmed at hospital", body: "The unit has been received. You can mark this request fulfilled." },
    fulfilled: { title: "Fulfilled", body: "This request is complete." },
    cancelled: { title: "Cancelled", body: "" },
  };
  const copy = statusCopy[status];

  return (
    <AppShell role="requester" title="Track request" active="/app/requester">
      <Link to="/app/requester" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      {/* Live status banner */}
      <div className="rounded-2xl bg-primary text-primary-foreground p-5 mb-5 flex items-center gap-4">
        <span className="relative flex size-12 items-center justify-center rounded-2xl bg-white/15 shrink-0">
          {status === "confirmed" ? <CheckCircle size={26} /> : status === "en_route" ? <Truck size={26} /> : <Clock size={26} />}
          {status !== "confirmed" && (
            <span className="absolute inset-0 rounded-2xl border-2 border-white/40 animate-bl-pulse" />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-lg leading-tight">{copy.title}</p>
          <p className="text-primary-foreground/85 text-sm mt-0.5">{copy.body}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Request status"
              action={<Badge tone={status === "confirmed" ? "success" : "primary"}>{status === "confirmed" ? "Confirmed" : "Live"}</Badge>}
            />
            <CardBody>
              <div className="hidden sm:block"><StatusStepper status={status} /></div>
              <div className="sm:hidden"><StatusStepper status={status} orientation="vertical" /></div>

              <Divider className="my-5" />
              <div className="flex items-center gap-3 text-sm">
                {auto && status !== "confirmed" ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2 rounded-full bg-primary animate-bl-pulse" />
                    Updating live…
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {status === "confirmed" ? "All steps complete." : "Live updates paused."}
                  </span>
                )}
                <div className="ml-auto flex gap-2">
                  {status !== "confirmed" && (
                    <Button size="sm" variant="outline" onClick={() => { setAuto(false); const next = SEQ[Math.min(SEQ.indexOf(status) + 1, SEQ.length - 1)]; setStatus(next); }}>
                      Advance step
                    </Button>
                  )}
                  {status === "confirmed" && (
                    <Button size="sm" rightIcon={<CheckCircle size={15} />} onClick={() => navigate(`/app/requester/fulfilled/${request.id}`)}>
                      Mark fulfilled
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Map placeholder with ETA */}
          <Card>
            <CardHeader title={isBank ? "Dispatch route" : "Donor location"} subtitle={`${source.distanceKm.toFixed(1)} km · ETA ~${source.etaMin} min`} />
            <CardBody>
              <div
                className="relative h-48 rounded-xl border border-border overflow-hidden"
                style={{ background: "repeating-linear-gradient(45deg, #eef1ee 0 12px, #f4f6f4 12px 24px)" }}
              >
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <path d="M40 150 C 120 120, 160 60, 300 50" fill="none" stroke="#0d6b63" strokeWidth="3" strokeDasharray="7 6" />
                </svg>
                <span className="absolute" style={{ left: 28, top: 138 }}>
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    {isBank ? <Building size={16} /> : <Navigation size={16} />}
                  </span>
                </span>
                <span className="absolute" style={{ right: 24, top: 34 }}>
                  <span className="flex size-8 items-center justify-center rounded-full bg-critical text-critical-foreground shadow">
                    <MapPin size={16} />
                  </span>
                </span>
                <span className="absolute bottom-3 right-3 rounded-lg bg-card/95 px-2.5 py-1 text-xs font-num font-semibold shadow border border-border">
                  ETA {source.etaMin} min
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Source + request info */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Card>
            <CardHeader title="Selected source" />
            <CardBody>
              <div className="flex items-center gap-3">
                {isBank ? (
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary"><Building size={22} /></span>
                ) : (
                  <Avatar name={source.name} size={44} />
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate flex items-center gap-1.5">
                    {source.name}
                    {source.verified && <ShieldCheck size={15} className="text-primary" />}
                  </p>
                  <p className="text-sm text-muted-foreground">{isBank ? "Blood bank" : "Donor"} · {source.bloodGroup}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Info label="Distance" value={`${source.distanceKm.toFixed(1)} km`} />
                <Info label="ETA" value={`${source.etaMin} min`} />
              </div>
              <Button variant="outline" fullWidth className="mt-4" leftIcon={<Phone size={16} />}>
                Call {isBank ? "bank" : "donor"}
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Request" />
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <BloodGroupChip group={request.bloodGroup} size="lg" />
                <div>
                  <p className="font-semibold">{request.units} units · {request.patientName}</p>
                  <UrgencyBadge urgency={request.urgency} size="sm" />
                </div>
              </div>
              <Divider />
              <Info label="Hospital" value={request.hospital} />
              <Info label="Required by" value={request.requiredBy} />
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm mt-0.5">{value}</p>
    </div>
  );
}
