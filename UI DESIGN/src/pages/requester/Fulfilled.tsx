import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Divider } from "../../components/ui/misc";
import { BloodGroupChip } from "../../components/ui/domain";
import { Link, matchPath, useRouter } from "../../lib/router";
import { REQUESTS } from "../../lib/mock";
import { CheckCircle, Heart, Hospital, List, Plus } from "../../lib/icons";

export default function Fulfilled() {
  const { path, navigate } = useRouter();
  const params = matchPath("/app/requester/fulfilled/:id", path);
  const request = REQUESTS.find((r) => r.id === params?.id) ?? REQUESTS[0];

  return (
    <AppShell role="requester" title="Request fulfilled" active="/app/requester">
      <div className="max-w-lg mx-auto text-center py-6 animate-bl-fade-up">
        <div className="relative inline-flex mb-6">
          <span className="flex size-20 items-center justify-center rounded-full bg-success text-success-foreground">
            <CheckCircle size={40} />
          </span>
          <span className="absolute inset-0 rounded-full border-2 border-success/40 animate-bl-ping" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Request fulfilled</h1>
        <p className="mt-2.5 text-muted-foreground">
          {request.units} units of blood have been confirmed for {request.patientName}. Thank you for using BloodLink.
        </p>

        <Card className="mt-8 text-left">
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <BloodGroupChip group={request.bloodGroup} size="lg" />
              <div>
                <p className="font-semibold">{request.units} units · {request.patientName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Hospital size={14} /> {request.hospital}
                </p>
              </div>
              <span className="ml-auto flex size-9 items-center justify-center rounded-full bg-success-soft text-success">
                <CheckCircle size={20} />
              </span>
            </div>
            <Divider />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Row label="Source" value={request.source?.name ?? "Sanjeevani Blood Centre"} />
              <Row label="Confirmed" value="Just now" />
              <Row label="Units secured" value={`${request.units} / ${request.units}`} />
              <Row label="Time to fulfil" value="1h 12m" />
            </div>
          </CardBody>
        </Card>

        <div className="mt-6 rounded-2xl bg-critical-soft/50 border border-critical/15 p-4 flex items-center gap-3 text-left">
          <span className="flex size-10 items-center justify-center rounded-full bg-critical-soft text-critical shrink-0">
            <Heart size={20} />
          </span>
          <p className="text-sm text-muted-foreground">
            A life was helped today. Consider thanking your donor or bank — a note goes a long way.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" leftIcon={<List size={16} />} onClick={() => navigate("/app/requester/history")}>
            View history
          </Button>
          <Link to="/app/requester">
            <Button leftIcon={<Plus size={16} />} fullWidth>Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}
