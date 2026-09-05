import { useState, type ReactNode } from "react";
import type { RankedCandidate } from "../../lib/blood";
import type { BloodGroup } from "../../lib/types";
import { matchQuality } from "../../lib/blood";
import { cn } from "../../lib/cn";
import {
  Building,
  CheckCircle,
  ChevronDown,
  Clock,
  Droplet,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  User,
  X,
  Zap,
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
  const [modalOpen, setModalOpen] = useState(false);
  const { candidate: c, score, factors } = ranked;
  const quality = matchQuality(c.bloodGroup, recipient);
  const isBank = c.kind === "bank";

  function handleConfirmDispatch() {
    setModalOpen(false);
    onSelect(c.id);
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-xs">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Rank marker */}
            <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold font-num",
                  rank === 1
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {rank}
              </span>
            </div>

            {isBank ? (
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary shrink-0">
                <Building size={20} />
              </div>
            ) : (
              <Avatar name={c.name} />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-foreground leading-tight truncate">{c.name}</h3>
                {c.verified && (
                  <span className="text-primary" title="Document Verified">
                    <ShieldCheck size={16} />
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 flex-wrap text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium">
                  {isBank ? <Building size={13} /> : <User size={13} />}
                  {isBank ? "Partner Blood Bank" : "Volunteer Donor"}
                </span>
                {c.rating != null && (
                  <span className="inline-flex items-center gap-1 font-num font-semibold text-foreground">
                    <Star size={13} className="text-urgent fill-urgent" /> {c.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Match score */}
            <div className="text-right shrink-0">
              <div className="font-num text-2xl font-extrabold leading-none text-primary">{score}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                match score
              </div>
            </div>
          </div>

          {/* Key facts row */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 rounded-xl bg-muted/40">
            <Fact
              label="Offers Group"
              value={<BloodGroupChip group={c.bloodGroup} size="sm" tone="outline" />}
            />
            <Fact
              label="Compatibility"
              value={
                quality === "exact" ? (
                  <Badge tone="critical" icon={<Droplet size={11} />}>Exact ABO</Badge>
                ) : (
                  <Badge tone="success">Compatible</Badge>
                )
              }
            />
            <Fact
              label={isBank ? "Inventory" : "Readiness"}
              value={
                isBank ? (
                  <span className="font-num font-bold text-sm text-foreground">{c.unitsAvailable} units in stock</span>
                ) : c.eligible ? (
                  <Badge tone="success">Eligible now</Badge>
                ) : (
                  <Badge tone="urgent">Cooling off</Badge>
                )
              }
            />
            <Fact
              label="Distance · Transit"
              value={
                <span className="font-num font-semibold text-xs sm:text-sm inline-flex items-center gap-1 text-foreground">
                  <MapPin size={12} className="text-muted-foreground" />
                  {c.distanceKm.toFixed(1)} km
                  <span className="text-muted-foreground mx-0.5">·</span>
                  <Clock size={12} className="text-muted-foreground" />
                  ~{c.etaMin}m
                </span>
              }
            />
          </div>

          {!c.eligible && !isBank && c.eligibleNote && (
            <p className="mt-3 text-xs text-urgent bg-urgent-soft rounded-lg px-3 py-2">
              {c.eligibleNote}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2.5 pt-2 border-t border-border/60">
            <Button
              size="sm"
              leftIcon={isBank ? <Navigation size={14} /> : <Phone size={14} />}
              onClick={() => setModalOpen(true)}
              className="flex-1 sm:flex-none shadow-xs"
            >
              {isBank ? "Reserve & contact" : "Contact donor"}
            </Button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              aria-expanded={open}
            >
              Why ranked #{rank}
              <ChevronDown
                size={14}
                className={cn("transition-transform duration-200", open && "rotate-180")}
              />
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border bg-muted/20 px-5 py-4 animate-bl-fade-up">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Ranking Algorithm Breakdown
            </p>
            <RankingRationale factors={factors} />
          </div>
        )}
      </div>

      {/* Interactive Contact & Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 z-10 animate-bl-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  {isBank ? <Building size={18} /> : <User size={18} />}
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {isBank ? "Licensed Blood Bank" : "Verified Volunteer Donor"} · Rated {c.rating?.toFixed(1) || "5.0"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Compatibility confirmation strip */}
              <div className="rounded-2xl bg-muted/40 p-4 flex items-center justify-between gap-4">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Recipient</p>
                  <div className="mt-1"><BloodGroupChip group={recipient} size="sm" /></div>
                </div>
                <span className="text-xs font-bold text-muted-foreground">←</span>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Source</p>
                  <div className="mt-1"><BloodGroupChip group={c.bloodGroup} size="sm" tone="outline" /></div>
                </div>
                <div className="text-right">
                  <Badge tone={quality === "exact" ? "critical" : "success"}>
                    {quality === "exact" ? "Exact Match" : "Compatible"}
                  </Badge>
                  <p className="text-xs text-muted-foreground font-num mt-1">~{c.etaMin}m transit ETA</p>
                </div>
              </div>

              {/* Verified Contact Details */}
              <div className="rounded-xl border border-border p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coordinator Hotline:</span>
                  <a
                    href="tel:+919876500000"
                    className="font-num font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Phone size={13} /> +91 98765 00000
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Travel Distance:</span>
                  <span className="font-num font-semibold text-foreground">{c.distanceKm.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verified ID Status:</span>
                  <span className="text-success font-semibold inline-flex items-center gap-1">
                    <ShieldCheck size={13} /> Active & Cleared
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary-soft/40 border border-primary/20 text-xs text-primary flex items-start gap-2">
                <Zap size={15} className="shrink-0 mt-0.5" />
                <p>
                  Confirming will notify {c.name} immediately and advance your request to active live tracking.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="md"
                rightIcon={<CheckCircle size={16} />}
                onClick={handleConfirmDispatch}
                className="shadow-xs"
              >
                Confirm & Start Live Tracking
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className="flex items-center h-6">{value}</div>
    </div>
  );
}
