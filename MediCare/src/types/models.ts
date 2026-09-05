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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  bloodGroup: BloodGroup;
  location: string;
  org?: string;
  availableToDonate: boolean;
  totalDonations?: number;
  lastDonationDate?: string;
}

export interface MatchCandidate {
  id: string;
  kind: CandidateKind;
  name: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  etaMin: number;
  eligible: boolean;
  eligibleNote?: string;
  unitsAvailable?: number;
  rating?: number;
  lastDonation?: string;
  verified?: boolean;
  responseRate?: number;
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
  requiredBy: string;
  createdAt: string;
  status: RequestStatus;
  note?: string;
  source?: { name: string; kind: CandidateKind };
}

export interface InventoryRow {
  group: BloodGroup;
  units: number;
  reserved: number;
  nearExpiry: number;
  capacity: number;
}

export interface CreateRequestPayload {
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospital: string;
  location: string;
  urgency: Urgency;
  requiredBy: string;
  note?: string;
}

export interface NearbyEmergency {
  id: string;
  group: BloodGroup;
  urgency: Urgency;
  hospital: string;
  dist: number;
  by: string;
  units: number;
  isPledged?: boolean;
}

export interface DashboardStats {
  activeRequestsCount: number;
  unitsSecuredDisplay: string;
  fulfilledCount: number;
  avgResponseTime: string;
  totalDonorsAvailable: number;
}

export interface DonorStats {
  donationsCount: number;
  livesImpacted: number;
  nextEligibleDate: string;
  isEligible: boolean;
  nearbyAlertsCount: number;
}

export interface DonorDonationRecord {
  id: string;
  date: string;
  hospital: string;
  units: number;
  bloodGroup: BloodGroup;
  status: "completed" | "verified";
  certificateUrl?: string;
}

export interface BankStats {
  totalUnits: number;
  unitsReserved: number;
  incomingRequestsCount: number;
  expiringSoonCount: number;
  capacityPercentage: number;
}

export interface BankTriageItem {
  id: string;
  hospital: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsAllocated: number;
  urgency: Urgency;
  requiredBy: string;
  status: "pending" | "allocated" | "dispatched";
}

export interface LandingMatch {
  name: string;
  kind: "bank" | "donor";
  meta: string;
  score: number;
}

export interface LandingMetrics {
  donorsOnCall: string;
  verifiedBanks: string;
  medianResponseTime: string;
  featuredEmergency: {
    hospital: string;
    group: BloodGroup;
    units: number;
    urgency: Urgency;
    distance: string;
    postedAgo: string;
  };
  topMatches?: LandingMatch[];
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

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
