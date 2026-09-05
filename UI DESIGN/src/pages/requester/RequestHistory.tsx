import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/misc";
import { BloodGroupChip, UrgencyBadge } from "../../components/ui/domain";
import { cn } from "../../lib/cn";
import { useRouter } from "../../lib/router";
import { REQUESTS } from "../../lib/mock";
import type { BloodRequest } from "../../lib/types";
import { ArrowRight, Hospital, List, Plus } from "../../lib/icons";

const STATUS: Record<BloodRequest["status"], { label: string; tone: "info" | "primary" | "success" | "neutral" }> = {
  matching: { label: "Matching", tone: "info" },
  contacted: { label: "Contacted", tone: "info" },
  accepted: { label: "Accepted", tone: "primary" },
  en_route: { label: "En route", tone: "primary" },
  confirmed: { label: "Confirmed", tone: "success" },
  fulfilled: { label: "Fulfilled", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

type Tab = "all" | "active" | "fulfilled";

export default function RequestHistory() {
  const { navigate } = useRouter();
  const [tab, setTab] = useState<Tab>("all");

  const filtered = REQUESTS.filter((r) =>
    tab === "all" ? true : tab === "fulfilled" ? r.status === "fulfilled" : r.status !== "fulfilled" && r.status !== "cancelled",
  );

  return (
    <AppShell role="requester" title="Request history" active="/app/requester/history">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:hidden">Request history</h1>
          <p className="text-sm text-muted-foreground mt-1">All requests you've raised.</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate("/app/requester/new")}>New request</Button>
      </div>

      <div className="inline-flex rounded-xl border border-border bg-card p-1 mb-5">
        {(["all", "active", "fulfilled"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 h-8 rounded-lg text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<List size={26} />}
            title="Nothing here yet"
            description="Requests you raise will be listed here with their outcome."
            action={<Button leftIcon={<Plus size={16} />} onClick={() => navigate("/app/requester/new")}>Create a request</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const s = STATUS[r.status];
            const target = r.status === "matching" ? `/app/requester/matches/${r.id}` : r.status === "fulfilled" ? `/app/requester/fulfilled/${r.id}` : `/app/requester/track/${r.id}`;
            return (
              <Card key={r.id} interactive onClick={() => navigate(target)}>
                <CardBody className="flex items-center gap-4">
                  <BloodGroupChip group={r.bloodGroup} size="lg" tone={r.status === "fulfilled" ? "neutral" : "critical"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{r.units} units · {r.patientName}</p>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Hospital size={13} /> {r.hospital}
                      <span className="mx-1">·</span>
                      <span className="font-num">{r.createdAt}</span>
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <UrgencyBadge urgency={r.urgency} size="sm" />
                    <ArrowRight size={18} className="text-muted-foreground" />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
