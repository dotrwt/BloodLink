export type Role = "donor" | "requester" | "bank";

export type BloodGroup = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

export type Urgency = "critical" | "urgent" | "routine";

export type RequestStatus =
  | "matching"
  | "contacted"
  | "accepted"
  | "en_route"
  | "confirmed"
  | "fulfilled"
  | "cancelled";

export type CandidateKind = "donor" | "bank";

export interface MatchCandidate {
  id: string;
  kind: CandidateKind;
  name: string;
  bloodGroup: BloodGroup; // the group offered
  distanceKm: number;
  etaMin: number;
  /** donor-only: eligible to donate now */
  eligible: boolean;
  eligibleNote?: string;
  /** bank-only: units currently available of the requested group */
  unitsAvailable?: number;
  rating?: number;
  lastDonation?: string;
  verified?: boolean;
  responseRate?: number; // 0..1
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  unitsSecured: number;
  hospital: string;
  location: string;
  urgency: Urgency;
  requiredBy: string; // ISO-ish label
  createdAt: string;
  status: RequestStatus;
  note?: string;
  source?: { name: string; kind: CandidateKind };
}

export interface InventoryRow {
  group: BloodGroup;
  units: number;
  reserved: number;
  nearExpiry: number; // units within 5 days
  capacity: number;
}

export interface AppNotification {
  id: string;
  role: Role | "all";
  kind: "emergency" | "status" | "system" | "reminder";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}
