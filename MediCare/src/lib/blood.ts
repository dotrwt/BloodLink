import type { BloodGroup, MatchCandidate, Urgency } from "./types";

export const BLOOD_GROUPS: BloodGroup[] = [
  "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+",
];

/** Which donor groups can give red cells to a given recipient group. */
const CAN_RECEIVE_FROM: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

/** Can `donor` blood be given to `recipient`? */
export function isCompatible(donor: BloodGroup, recipient: BloodGroup): boolean {
  return CAN_RECEIVE_FROM[recipient].includes(donor);
}

/** Donor groups that can help a recipient, ordered O- first. */
export function compatibleDonors(recipient: BloodGroup): BloodGroup[] {
  return CAN_RECEIVE_FROM[recipient];
}

/** Recipients a donor group can help. */
export function canDonateTo(donor: BloodGroup): BloodGroup[] {
  return BLOOD_GROUPS.filter((r) => isCompatible(donor, r));
}

/** Perfect (exact) match reads clearest to a requester; otherwise "compatible". */
export function matchQuality(
  donor: BloodGroup,
  recipient: BloodGroup,
): "exact" | "compatible" | "incompatible" {
  if (donor === recipient) return "exact";
  return isCompatible(donor, recipient) ? "compatible" : "incompatible";
}

export function urgencyWeight(u: Urgency): number {
  return u === "critical" ? 1 : u === "urgent" ? 0.65 : 0.35;
}

export interface RankFactor {
  key: "compatibility" | "availability" | "distance" | "eligibility" | "urgency";
  label: string;
  /** 0..1 contribution, already weighted */
  score: number;
  /** short human explanation */
  detail: string;
}

export interface RankedCandidate {
  candidate: MatchCandidate;
  score: number; // 0..100
  factors: RankFactor[];
}

/**
 * Rank candidates by compatibility, availability, distance, eligibility and
 * urgency fit. Returns a transparent factor breakdown so the requester can see
 * *why* a source is ranked where it is.
 */
export function rankCandidates(
  candidates: MatchCandidate[],
  recipient: BloodGroup,
  urgency: Urgency,
): RankedCandidate[] {
  const uw = urgencyWeight(urgency);

  const ranked = candidates
    .filter((c) => isCompatible(c.bloodGroup, recipient))
    .map((c) => {
      const quality = matchQuality(c.bloodGroup, recipient);
      const compatScore = quality === "exact" ? 1 : 0.82;

      const availScore =
        c.kind === "bank"
          ? Math.min(1, (c.unitsAvailable ?? 0) / 4)
          : c.eligible
            ? 1
            : 0.15;

      // closer is better; 0km => 1, 25km+ => ~0
      const distScore = Math.max(0, 1 - c.distanceKm / 25);

      const eligScore = c.kind === "donor" ? (c.eligible ? 1 : 0.2) : 1;

      // urgency fit: fast ETA matters more when critical
      const etaScore = Math.max(0, 1 - c.etaMin / 90);
      const urgencyFit = uw * etaScore + (1 - uw) * 0.6;

      const factors: RankFactor[] = [
        {
          key: "compatibility",
          label: "Compatibility",
          score: compatScore * 0.3,
          detail:
            quality === "exact"
              ? `Exact match (${c.bloodGroup})`
              : `${c.bloodGroup} is compatible with ${recipient}`,
        },
        {
          key: "availability",
          label: "Availability",
          score: availScore * 0.22,
          detail:
            c.kind === "bank"
              ? `${c.unitsAvailable ?? 0} units in stock`
              : c.eligible
                ? "Available to donate now"
                : "Not currently available",
        },
        {
          key: "distance",
          label: "Distance",
          score: distScore * 0.2,
          detail: `${c.distanceKm.toFixed(1)} km away`,
        },
        {
          key: "eligibility",
          label: "Eligibility",
          score: eligScore * 0.13,
          detail:
            c.kind === "donor"
              ? c.eligible
                ? "Passed eligibility screen"
                : (c.eligibleNote ?? "Recently donated")
              : "Verified institution",
        },
        {
          key: "urgency",
          label: "Urgency fit",
          score: urgencyFit * 0.15,
          detail: `~${c.etaMin} min ETA${urgency === "critical" ? " — prioritised" : ""}`,
        },
      ];

      const score = Math.round(
        factors.reduce((s, f) => s + f.score, 0) * 100,
      );
      return { candidate: c, score, factors };
    })
    .sort((a, b) => b.score - a.score);

  return ranked;
}
