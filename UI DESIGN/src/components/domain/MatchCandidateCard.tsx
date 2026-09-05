import { useState, type ReactNode } from "react";
import type { RankedCandidate } from "../../lib/blood";
import type { BloodGroup } from "../../lib/types";
import { matchQuality } from "../../lib/blood";
import { cn } from "../../lib/cn";
import {
  Building,
  ChevronDown,
  Clock,
  Droplet,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  User,
} from "../../lib/icons";
import { Avatar } from "../ui/misc";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { BloodGroupChip } from "../ui/domain";
import { RankingRationale } from "./RankingRationale";

export function MatchCandidateCard({
  ranked,
  rank,
  recipient,
  onSelect,
}: {
  ranked: RankedCandidate;
  rank: number;
  recipient: BloodGroup;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { candidate: c, score, factors } = ranked;
  const quality = matchQuality(c.bloodGroup, recipient);
  const isBank = c.kind === "bank";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-[0_2px_16px_-8px_rgba(0,0,0,0.18)]">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* rank marker */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-bold font-num",
                rank === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {rank}
            </span>
          </div>

          {isBank ? (
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary shrink-0">
              <Building size={20} />
            </div>
          ) : (
            <Avatar name={c.name} />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold leading-tight truncate">{c.name}</h3>
              {c.verified && (
                <span className="text-primary" title="Verified">
                  <ShieldCheck size={16} />
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                {isBank ? <Building size={13} /> : <User size={13} />}
                {isBank ? "Blood bank" : "Donor"}
              </span>
              {c.rating != null && (
                <span className="inline-flex items-center gap-1 font-num">
                  <Star size={13} className="text-urgent" /> {c.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* match score */}
          <div className="text-right shrink-0">
            <div className="font-num text-2xl font-bold leading-none text-primary">{score}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
              match score
            </div>
          </div>
        </div>

        {/* key facts row — hierarchy: group, compatibility, availability, distance/eta */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Fact
            label="Offers"
            value={<BloodGroupChip group={c.bloodGroup} size="sm" tone="outline" />}
          />
          <Fact
            label="Compatibility"
            value={
              quality === "exact" ? (
                <Badge tone="critical" icon={<Droplet size={12} />}>Exact</Badge>
              ) : (
                <Badge tone="success">Compatible</Badge>
              )
            }
          />
          <Fact
            label={isBank ? "In stock" : "Status"}
            value={
              isBank ? (
                <span className="font-num font-semibold text-sm">{c.unitsAvailable} units</span>
              ) : c.eligible ? (
                <Badge tone="success">Eligible</Badge>
              ) : (
                <Badge tone="urgent">Cooldown</Badge>
              )
            }
          />
          <Fact
            label="Distance · ETA"
            value={
              <span className="font-num font-semibold text-sm inline-flex items-center gap-1">
                <MapPin size={13} className="text-muted-foreground" />
                {c.distanceKm.toFixed(1)}km
                <span className="text-muted-foreground mx-0.5">·</span>
                <Clock size={13} className="text-muted-foreground" />
                {c.etaMin}m
              </span>
            }
          />
        </div>

        {!c.eligible && !isBank && c.eligibleNote && (
          <p className="mt-3 text-xs text-urgent bg-urgent-soft rounded-lg px-3 py-2">
            {c.eligibleNote}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            leftIcon={isBank ? <Navigation size={15} /> : <Phone size={15} />}
            onClick={() => onSelect(c.id)}
            className="flex-1 sm:flex-none"
          >
            {isBank ? "Reserve & contact" : "Contact donor"}
          </Button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg"
            aria-expanded={open}
          >
            Why ranked #{rank}
            <ChevronDown
              size={15}
              className={cn("transition-transform", open && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-muted/30 px-5 py-4 animate-bl-fade-up">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Ranking rationale
          </p>
          <RankingRationale factors={factors} />
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
        {label}
      </div>
      <div className="flex items-center h-6">{value}</div>
    </div>
  );
}
