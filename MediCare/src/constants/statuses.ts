import type { RequestStatus, Urgency } from "../types/models";

export const REQUEST_STATUS: Record<string, RequestStatus> = {
  MATCHING: "matching",
  CONTACTED: "contacted",
  ACCEPTED: "accepted",
  EN_ROUTE: "en_route",
  CONFIRMED: "confirmed",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
} as const;

export const STATUS_LABELS: Record<RequestStatus, string> = {
  matching: "Finding matches",
  contacted: "Contacted",
  accepted: "Accepted",
  en_route: "En route",
  confirmed: "Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export const STATUS_TONES: Record<RequestStatus, "info" | "primary" | "success" | "neutral"> = {
  matching: "info",
  contacted: "info",
  accepted: "primary",
  en_route: "primary",
  confirmed: "success",
  fulfilled: "success",
  cancelled: "neutral",
};

export const URGENCY_LEVELS: Record<string, Urgency> = {
  CRITICAL: "critical",
  URGENT: "urgent",
  ROUTINE: "routine",
} as const;

export const URGENCY_META: Record<Urgency, { label: string; desc: string; tone: "critical" | "urgent" | "neutral" }> = {
  critical: {
    label: "Critical",
    desc: "Life-threatening, needed within hours",
    tone: "critical",
  },
  urgent: {
    label: "Urgent",
    desc: "Needed today",
    tone: "urgent",
  },
  routine: {
    label: "Routine",
    desc: "Planned / scheduled transfusion",
    tone: "neutral",
  },
};
