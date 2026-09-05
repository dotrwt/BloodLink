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
  phone?: string;
  city?: string;
  area?: string;
  gender?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
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
  city?: string;
  area?: string;
  emergencyContact?: string;
  medicalNotes?: string;
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
  safeThreshold?: number;
}

export interface CreateRequestPayload {
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospital: string;
  location: string;
  city?: string;
  area?: string;
  emergencyContact?: string;
  medicalNotes?: string;
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
  livesHelped?: number;
  notes?: string;
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

// ============================================================================
// Database Schema Types (Direct 1:1 mapping with Database/schema.sql)
// ============================================================================

export type DbUserRole = "DONOR" | "REQUESTER" | "BLOOD_BANK";
export type DbUrgency = "CRITICAL" | "URGENT" | "NORMAL";
export type DbRequestStatus = "OPEN" | "MATCHING" | "PARTIALLY_FULFILLED" | "FULFILLED" | "CANCELLED";
export type DbResponseStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type DbDonationStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type DbBatchStatus = "AVAILABLE" | "RESERVED" | "EXPIRED" | "DISCARDED";
export type DbNotificationType =
  | "BLOOD_REQUEST"
  | "DONOR_RESPONSE"
  | "BANK_RESPONSE"
  | "REQUEST_UPDATE"
  | "URGENT_ALERT"
  | "SYSTEM";

export interface DbUser {
  user_id: number;
  email: string;
  phone: string;
  password_hash: string;
  role: DbUserRole;
  created_at: string;
  updated_at: string;
}

export interface DbDonor {
  donor_id: number;
  user_id: number;
  full_name: string;
  date_of_birth: string;
  gender?: string;
  blood_group: BloodGroup;
  city: string;
  area?: string;
  availability: boolean;
  last_donation_date?: string;
  consent_to_share: boolean;
}

export interface DbRequester {
  requester_id: number;
  user_id: number;
  full_name: string;
  city: string;
  area?: string;
  relationship_to_patient?: string;
}

export interface DbBloodBank {
  blood_bank_id: number;
  user_id: number;
  bank_name: string;
  official_email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  license_number: string;
  bank_type: string;
  authorized_person_name: string;
  authorized_person_designation?: string;
  authorized_person_contact?: string;
  authorized_person_email?: string;
}

export interface DbBloodRequest {
  request_id: number;
  requester_id: number;
  patient_name: string;
  hospital_name: string;
  blood_group: BloodGroup;
  units_required: number;
  emergency_contact: string;
  medical_notes?: string;
  city: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  urgency: DbUrgency;
  required_by: string;
  status: DbRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface DbDonorResponse {
  response_id: number;
  request_id: number;
  donor_id: number;
  status: DbResponseStatus;
  eta_minutes?: number;
  responded_at: string;
  completed_at?: string;
}

export interface DbDonation {
  donation_id: number;
  donor_id: number;
  request_id?: number | null;
  donation_date: string;
  units_donated: number;
  lives_helped: number;
  donation_status: DbDonationStatus;
  notes?: string;
  created_at: string;
}

export interface DbBloodInventory {
  inventory_id: number;
  blood_bank_id: number;
  blood_group: BloodGroup;
  total_units: number;
  reserved_units: number;
  safe_threshold: number;
  updated_at: string;
}

export interface DbInventoryBatch {
  batch_id: number;
  inventory_id: number;
  batch_number: string;
  units: number;
  collection_date: string;
  expiry_date: string;
  status: DbBatchStatus;
  created_at: string;
}

export interface DbBloodBankResponse {
  response_id: number;
  request_id: number;
  blood_bank_id: number;
  units_offered: number;
  status: DbResponseStatus;
  responded_at: string;
}

export interface DbNotification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: DbNotificationType;
  is_read: boolean;
  created_at: string;
}
