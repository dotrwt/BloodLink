import { useEffect, useRef, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ErrorState, Skeleton } from "../../components/ui/misc";
import { StatusStepper, BloodGroupChip } from "../../components/ui/domain";
import { Link, matchPath, useRouter } from "../../lib/router";
import { useRequestDetail } from "../../hooks/useRequestDetail";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { LiveDonorMap } from "../../components/domain/LiveDonorMap";
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
  Truck,
  User,
  X,
} from "../../lib/icons";

const SEQ: RequestStatus[] = ["matching", "contacted", "accepted", "en_route", "confirmed", "fulfilled"];

export default function TrackRequest() {
  const { path, navigate } = useRouter();
  const params = matchPath("/app/requester/track/:id", path);
  const requestId = params?.id;

  const { request, loading, error, refetch, updateStatus } = useRequestDetail(requestId);
  const { user } = useCurrentUser();

  const [auto, setAuto] = useState(false);
  const [coordinatorModal, setCoordinatorModal] = useState(false);
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
          <Skeleton className="h-24 rounded-2xl" />
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

  const statusCopy: Record<RequestStatus, { title: string; body: string; badge: string }> = {
    matching: { title: "Searching nearby network", body: "Locating matching donors and partner blood banks within 15 km.", badge: "Step 1/5: Matching" },
    contacted: { title: `${source.name} contacted`, body: "Coordinator is reviewing units and medical eligibility.", badge: "Step 2/5: Contacted" },
    accepted: { title: `${source.name} accepted request`, body: isBank ? "Units reserved and packed in cold chain container (2-6°C)." : "Donor accepted and is preparing to travel.", badge: "Step 3/5: Accepted" },
    en_route: { title: isBank ? "Blood units dispatched" : `${source.name} is en route`, body: "Transit in progress. Estimated arrival at hospital: 14-18 minutes.", badge: "Step 4/5: En Route" },
    confirmed: { title: "Blood delivered & confirmed", body: "Units successfully verified by hospital receiving desk. Ready for cross-match.", badge: "Step 5/5: Delivered" },
    fulfilled: { title: "Request fulfilled", body: "This emergency request has been successfully closed.", badge: "Completed" },
    cancelled: { title: "Request cancelled", body: "This request has been cancelled.", badge: "Cancelled" },
  };

  function advance() {
    const i = SEQ.indexOf(status);
    if (i < SEQ.length - 1) {
      updateStatus(SEQ[i + 1]);
    }
  }

  function reset() {
    updateStatus("matching");
  }

  const effectiveCity = request.city || user?.city || "";
  const effectiveArea = request.area || user?.area || "";
  const effectiveAddress =
    request.location && request.location.length > 3
      ? request.location
      : effectiveArea && effectiveCity
      ? `${effectiveArea}, ${effectiveCity}`
      : effectiveCity || request.hospital || "Emergency Care Ward";

  return (
    <AppShell title="Live dispatch tracking" active="/app/requester">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <span className="text-xs text-muted-foreground font-num bg-card border border-border px-2.5 py-1 rounded-lg">
          Request ID: {request.id}
        </span>
      </div>

      {/* Main Tracking Hero Card */}
      <Card className="mb-6 overflow-hidden shadow-sm border-border">
        {/* Dynamic header banner */}
        <div className="bg-primary text-primary-foreground p-5 sm:p-7 relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{ background: "radial-gradient(40% 40% at 85% 20%, rgba(255,255,255,0.4), transparent 70%)" }}
          />

          <div className="relative flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-primary-foreground text-xs font-bold border border-white/20">
              <span className="size-2 rounded-full bg-critical animate-bl-ping" />
              Live Emergency Tracking
            </span>
            <span className="text-xs text-primary-foreground/80 font-num font-medium">
              {statusCopy[status].badge}
            </span>
          </div>

          <h1 className="relative mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            {statusCopy[status].title}
          </h1>
          <p className="relative mt-1 text-sm text-primary-foreground/90 max-w-xl leading-relaxed">
            {statusCopy[status].body}
          </p>

          {/* Quick units indicator */}
          <div className="relative mt-4 flex items-center gap-3 pt-4 border-t border-white/15">
            <BloodGroupChip group={request.bloodGroup} size="sm" tone="critical" />
            <span className="text-xs font-bold text-primary-foreground">
              {request.units} units for {request.patientName}
            </span>
            <span className="text-xs text-primary-foreground/80 hidden sm:inline">
              · Destination: {request.hospital}
            </span>
          </div>
        </div>

        <CardBody className="p-5 sm:p-6">
          {/* Stepper */}
          <div className="overflow-x-auto py-2">
            <StatusStepper status={status} onStepClick={updateStatus} />
          </div>

          {/* Live Donor GPS Location Map when request is accepted or in transit */}
          {(status === "accepted" ||
            status === "en_route" ||
            status === "confirmed" ||
            !isBank) && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="relative flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-critical opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2.5 bg-critical"></span>
                  </span>
                  Live Donor Location &amp; Delivery Route
                </h3>
                <span className="text-xs text-primary font-medium">Updated live</span>
              </div>
              <LiveDonorMap
                donorName={source.name}
                donorBloodGroup={request.bloodGroup}
                donorPhone="+91 98765 43210"
                donorCity={effectiveCity}
                donorArea={effectiveArea || "Central Ward"}
                hospitalName={request.hospital}
                hospitalAddress={effectiveAddress}
                requesterCity={effectiveCity}
                requesterArea={effectiveArea}
                destinationCoords={
                  request.latitude && request.longitude
                    ? [request.latitude, request.longitude]
                    : undefined
                }
                status={status}
              />
            </div>
          )}

          {/* Active Source Card */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary shrink-0 shadow-xs">
                {isBank ? <Building size={22} /> : <User size={22} />}
              </span>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  {isBank ? "Partner Blood Bank" : "Verified Volunteer Donor"}
                </p>
                <h3 className="font-bold text-base text-foreground mt-0.5">{source.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1 text-success font-semibold">
                    <ShieldCheck size={13} /> Verified Source
                  </span>
                  <span>&bull;</span>
                  <span className="font-num text-foreground">ETA ~14-18 mins</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                size="md"
                variant="outline"
                leftIcon={<Phone size={15} />}
                onClick={() => setCoordinatorModal(true)}
                className="w-full sm:w-auto shadow-xs"
              >
                Contact coordinator
              </Button>
            </div>
          </div>

          {/* Interactive Simulation & Progression Bar */}
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground">Simulate dispatch:</span>

              <Button size="sm" variant="outline" onClick={advance} disabled={status === "fulfilled"}>
                Next step →
              </Button>
              <Button
                size="sm"
                variant={auto ? "primary" : "ghost"}
                leftIcon={<Play size={12} />}
                onClick={() => setAuto((v) => !v)}
              >
                {auto ? "Auto advancing" : "Auto play"}
              </Button>
              <Button size="sm" variant="ghost" leftIcon={<RotateCcw size={12} />} onClick={reset}>
                Reset
              </Button>
            </div>

            {(status === "confirmed" || status === "en_route") && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<CheckCircle size={14} />}
                onClick={() => {
                  updateStatus("fulfilled");
                  navigate(`/app/requester/fulfilled/${request.id}`);
                }}
                className="shadow-xs"
              >
                Mark fulfilled & generate receipt
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Delivery Destination & Clinical Notes */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="shadow-2xs">
          <CardHeader title="Hospital Destination" />
          <CardBody className="pt-0 space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Hospital size={16} className="text-primary shrink-0" /> {request.hospital}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 text-primary" /> {effectiveAddress}
            </p>
            <p className="flex items-center gap-2 text-urgent font-medium font-num">
              <Clock size={15} className="shrink-0" /> Required by: {request.requiredBy}
            </p>
          </CardBody>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader title="Patient Medical Record" />
          <CardBody className="pt-0 space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">
              Patient: {request.patientName} ({request.bloodGroup})
            </p>
            <p className="leading-relaxed">
              {request.note || request.medicalNotes || "Emergency whole blood request raised via BloodLink network. Cross-match specimen pre-tested."}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Coordinator Contact Modal */}
      {coordinatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
            onClick={() => setCoordinatorModal(false)}
          />

          <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6 z-10 animate-bl-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Phone size={16} />
                </span>
                <h3 className="font-bold text-base text-foreground">Emergency Coordinator Desk</h3>
              </div>
              <button
                type="button"
                onClick={() => setCoordinatorModal(false)}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lead Coordinator:</span>
                  <span className="font-bold text-foreground">Rajeev Sen (Logistics Officer)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Direct Hotline:</span>
                  <a
                    href="tel:+919876511111"
                    className="font-num font-bold text-primary hover:underline"
                  >
                    +91 98765 11111
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hospital Receiving Desk:</span>
                  <span className="font-num font-semibold text-foreground">Ext. 4022</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ambulance Carrier:</span>
                  <span className="font-num font-semibold text-foreground">KA-01-EA-4920</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-success-soft text-success text-xs font-semibold flex items-center gap-2">
                <Truck size={16} className="shrink-0" />
                <span>Units packed in 2–6°C certified cold chain storage box. Transit active.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setCoordinatorModal(false)}>
                Close
              </Button>
              <a href="tel:+919876511111" className="inline-block">
                <Button size="sm" leftIcon={<Phone size={14} />}>
                  Call Now (+91 98765 11111)
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
