import type { RankFactor } from "../../lib/blood";
import { cn } from "../../lib/cn";

/** Shows the weighted factors behind a candidate's rank. */
export function RankingRationale({ factors }: { factors: RankFactor[] }) {
  // each factor's raw weight cap so bars are comparable
  const caps: Record<RankFactor["key"], number> = {
    compatibility: 0.3,
    availability: 0.22,
    distance: 0.2,
    eligibility: 0.13,
    urgency: 0.15,
  };
  return (
    <div className="space-y-2.5">
      {factors.map((f) => {
        const pct = Math.round((f.score / caps[f.key]) * 100);
        return (
          <div key={f.key} className="grid grid-cols-[7rem_1fr] items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    pct >= 80 ? "bg-success" : pct >= 45 ? "bg-primary" : "bg-urgent",
                  )}
                  style={{ width: `${Math.max(6, pct)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-40 shrink-0 truncate" title={f.detail}>
                {f.detail}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
