import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { BloodGroupChip } from "../../components/ui/domain";
import { Link, matchPath, useRouter } from "../../lib/router";
import { useRequestDetail } from "../../hooks/useRequestDetail";
import { Skeleton } from "../../components/ui/misc";
import { CheckCircle, Heart, Plus } from "../../lib/icons";

export default function Fulfilled() {
  const { path } = useRouter();
  const params = matchPath("/app/requester/fulfilled/:id", path);
  const requestId = params?.id;
  const { request, loading } = useRequestDetail(requestId);

  return (
    <AppShell title="Request fulfilled" active="/app/requester">
      <div className="max-w-xl mx-auto py-8">
        {loading || !request ? (
          <Skeleton className="h-96 rounded-3xl" />
        ) : (
          <Card className="text-center p-8 rounded-3xl">
            <CardBody className="space-y-6">
              <span className="inline-flex size-20 items-center justify-center rounded-full bg-success-soft text-success mx-auto">
                <CheckCircle size={44} />
              </span>

              <div>
                <h1 className="text-3xl font-bold tracking-tight">Request fulfilled</h1>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  The units requested for <strong className="text-foreground">{request.patientName}</strong> have been
                  confirmed at {request.hospital}.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/60 p-4 inline-flex items-center gap-4 text-left mx-auto">
                <BloodGroupChip group={request.bloodGroup} size="lg" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                  <p className="font-semibold text-base">{request.units} units of {request.bloodGroup}</p>
                  <p className="text-xs text-muted-foreground">Fulfilled via {request.source?.name || "BloodLink Network"}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-border">
                <Link to="/app/requester/new" className="w-full sm:w-auto">
                  <Button fullWidth size="lg" leftIcon={<Plus size={16} />}>New request</Button>
                </Link>
                <Link to="/app/dashboard" className="w-full sm:w-auto">
                  <Button fullWidth size="lg" variant="outline">Back to dashboard</Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Heart size={13} className="text-critical fill-critical" /> Thank you for keeping emergency blood moving.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
