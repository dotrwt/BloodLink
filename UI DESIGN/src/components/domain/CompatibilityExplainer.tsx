import { BLOOD_GROUPS, compatibleDonors } from "../../lib/blood";
import type { BloodGroup } from "../../lib/types";
import { cn } from "../../lib/cn";
import { Check, Droplet } from "../../lib/icons";
import { BloodGroupChip } from "../ui/domain";

/**
 * Visual explanation of who can donate to a given recipient — not just a
 * text sentence. Shows the recipient prominently and highlights the
 * compatible donor groups.
 */
export function CompatibilityExplainer({
  recipient,
  compact,
}: {
  recipient: BloodGroup;
  compact?: boolean;
}) {
  const donors = compatibleDonors(recipient);

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          Patient needs
        </span>
        <BloodGroupChip group={recipient} size={compact ? "md" : "lg"} />
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {donors.length === 1 ? (
          <>Only <strong className="text-foreground font-num">{donors[0]}</strong> donors are compatible — the universal window is narrow.</>
        ) : (
          <>Compatible with <strong className="text-foreground">{donors.length} donor groups</strong>. Matching prioritises exact matches first.</>
        )}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {BLOOD_GROUPS.map((g) => {
          const ok = donors.includes(g);
          const exact = g === recipient;
          return (
            <div
              key={g}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-colors",
                exact
                  ? "border-critical/40 bg-critical-soft"
                  : ok
                    ? "border-success/30 bg-success-soft"
                    : "border-border bg-muted/40 opacity-55",
              )}
            >
              <span
                className={cn(
                  "font-num font-bold text-sm",
                  exact ? "text-critical" : ok ? "text-success" : "text-muted-foreground",
                )}
              >
                {g}
              </span>
              {ok ? (
                <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold", exact ? "text-critical" : "text-success")}>
                  {exact ? <><Droplet size={10} /> exact</> : <><Check size={10} /> ok</>}
                </span>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
