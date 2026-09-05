import type {
  UserProfile,
  BloodRequest,
  MatchCandidate,
  NearbyEmergency,
  DashboardStats,
  LandingMetrics,
  AppNotification,
  Hospital,
  CreateRequestPayload,
  RequestStatus,
} from "../types/models";

// In-Memory Database Collections
let currentUser: UserProfile = {
  id: "usr-01",
  name: "Ananya Rao",
  email: "ananya.rao@example.com",
  role: "requester",
  bloodGroup: "O+",
  location: "Indiranagar, Bengaluru",
  org: "Family / patient advocate",
  availableToDonate: true,
  totalDonations: 3,
  lastDonationDate: "2026-06-10",
};

let requestsDb: BloodRequest[] = [
  {
    id: "req-201",
    patientName: "Meera Rao",
    bloodGroup: "A+",
    units: 3,
    unitsSecured: 1,
    hospital: "Manipal Hospital, Old Airport Rd",
    location: "HAL, Bengaluru",
    urgency: "critical",
    requiredBy: "Today, 6:00 PM",
    createdAt: "12 min ago",
    status: "matching",
    note: "Post-surgical bleeding, ICU. Blood needed before evening rounds.",
  },
  {
    id: "req-202",
    patientName: "Imran Khan",
    bloodGroup: "O-",
    units: 2,
    unitsSecured: 2,
    hospital: "Narayana Health City",
    location: "Bommasandra, Bengaluru",
    urgency: "urgent",
    requiredBy: "Tomorrow, 9:00 AM",
    createdAt: "2 hours ago",
    status: "en_route",
    note: "Scheduled transfusion for thalassemia.",
    source: { name: "Rohit Menon", kind: "donor" },
  },
  {
    id: "req-203",
    patientName: "Lakshmi S.",
    bloodGroup: "B+",
    units: 1,
    unitsSecured: 1,
    hospital: "Fortis, Bannerghatta",
    location: "Bannerghatta, Bengaluru",
    urgency: "routine",
    requiredBy: "18 Sep, 11:00 AM",
    createdAt: "Yesterday",
    status: "fulfilled",
    source: { name: "Sanjeevani Blood Centre", kind: "bank" },
  },
  {
    id: "req-204",
    patientName: "Karthik Verma",
    bloodGroup: "AB+",
    units: 2,
    unitsSecured: 2,
    hospital: "Columbia Asia Referral Hospital",
    location: "Yeshwanthpur, Bengaluru",
    urgency: "routine",
    requiredBy: "20 Sep, 2:00 PM",
    createdAt: "3 days ago",
    status: "fulfilled",
    source: { name: "Red Cross Blood Bank", kind: "bank" },
  },
];

const candidatesDb: MatchCandidate[] = [
  {
    id: "cand-1",
    kind: "bank",
    name: "Sanjeevani Blood Centre",
    bloodGroup: "A+",
    distanceKm: 3.2,
    etaMin: 18,
    eligible: true,
    unitsAvailable: 12,
    verified: true,
    rating: 4.9,
    responseRate: 0.98,
  },
  {
    id: "cand-2",
    kind: "donor",
    name: "Dr. Vikram Sethi",
    bloodGroup: "A+",
    distanceKm: 1.8,
    etaMin: 12,
    eligible: true,
    rating: 5.0,
    lastDonation: "4 months ago",
    verified: true,
    responseRate: 0.95,
  },
  {
    id: "cand-3",
    kind: "donor",
    name: "Priya Nair",
    bloodGroup: "O-",
    distanceKm: 2.6,
    etaMin: 16,
    eligible: true,
    rating: 4.8,
    lastDonation: "6 months ago",
    verified: true,
    responseRate: 0.9,
  },
  {
    id: "cand-4",
    kind: "bank",
    name: "Rotary TTK Blood Bank",
    bloodGroup: "A+",
    distanceKm: 5.1,
    etaMin: 28,
    eligible: true,
    unitsAvailable: 8,
    verified: true,
    rating: 4.7,
    responseRate: 0.92,
  },
  {
    id: "cand-5",
    kind: "donor",
    name: "Arjun Reddy",
    bloodGroup: "A+",
    distanceKm: 4.0,
    etaMin: 22,
    eligible: false,
    eligibleNote: "Donated 3 weeks ago; eligible in 5 weeks",
    rating: 4.6,
    lastDonation: "21 days ago",
    responseRate: 0.85,
  },
];

const nearbyEmergenciesDb: NearbyEmergency[] = [
  { id: "e1", group: "O+", urgency: "critical", hospital: "Manipal Hospital", dist: 2.1, by: "6:00 PM", units: 3, isPledged: false },
  { id: "e2", group: "A+", urgency: "urgent", hospital: "Fortis, Bannerghatta", dist: 4.6, by: "Tonight", units: 2, isPledged: false },
  { id: "e3", group: "AB+", urgency: "routine", hospital: "Columbia Asia", dist: 7.2, by: "Tomorrow", units: 1, isPledged: false },
];

let notificationsDb: AppNotification[] = [
  {
    id: "n1",
    role: "all",
    kind: "emergency",
    title: "Critical need nearby: O- (2 units)",
    body: "Manipal Hospital has raised a critical request 2.1 km from you.",
    time: "4 min ago",
    unread: true,
  },
  {
    id: "n2",
    role: "requester",
    kind: "status",
    title: "Match accepted: Rohit Menon (O-)",
    body: "Donor accepted request req-202. ETA at Narayana Health City is ~24 min.",
    time: "32 min ago",
    unread: true,
  },
  {
    id: "n3",
    role: "all",
    kind: "reminder",
    title: "Eligible to donate in 3 days",
    body: "Your 90-day cooldown period ends on 19 September.",
    time: "2 hours ago",
    unread: false,
  },
  {
    id: "n4",
    role: "all",
    kind: "system",
    title: "Bengaluru inventory alert",
    body: "B- and O- reserves are below safe minimum across 6 partner banks.",
    time: "Yesterday",
    unread: false,
  },
];

const hospitalsDb: Hospital[] = [
  { id: "h1", name: "Manipal Hospital, Old Airport Rd", city: "Bengaluru", address: "98 HAL Old Airport Rd" },
  { id: "h2", name: "Narayana Health City", city: "Bengaluru", address: "Bommasandra Industrial Area" },
  { id: "h3", name: "Fortis Hospital, Bannerghatta", city: "Bengaluru", address: "Bannerghatta Main Rd" },
  { id: "h4", name: "Columbia Asia Referral Hospital", city: "Bengaluru", address: "Yeshwanthpur" },
  { id: "h5", name: "St. John's Medical College Hospital", city: "Bengaluru", address: "Sarjapur Rd" },
];

// Async delay simulator
const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDb = {
  // User Profile
  async getUser(): Promise<UserProfile> {
    await delay();
    return { ...currentUser };
  },

  async updateUser(updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay();
    currentUser = { ...currentUser, ...updates };
    return { ...currentUser };
  },

  async setAvailability(available: boolean): Promise<boolean> {
    await delay();
    currentUser.availableToDonate = available;
    return currentUser.availableToDonate;
  },

  // Requests
  async getRequests(): Promise<BloodRequest[]> {
    await delay();
    return [...requestsDb];
  },

  async getRequestById(id: string): Promise<BloodRequest | null> {
    await delay();
    const found = requestsDb.find((r) => r.id === id);
    return found ? { ...found } : null;
  },

  async createRequest(payload: CreateRequestPayload): Promise<BloodRequest> {
    await delay();
    const newReq: BloodRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      patientName: payload.patientName,
      bloodGroup: payload.bloodGroup,
      units: payload.units,
      unitsSecured: 0,
      hospital: payload.hospital,
      location: payload.location,
      urgency: payload.urgency,
      requiredBy: payload.requiredBy,
      createdAt: "Just now",
      status: "matching",
      note: payload.note,
    };
    requestsDb = [newReq, ...requestsDb];
    return newReq;
  },

  async updateRequestStatus(id: string, status: RequestStatus): Promise<BloodRequest | null> {
    await delay();
    const idx = requestsDb.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    requestsDb[idx] = { ...requestsDb[idx], status };
    return { ...requestsDb[idx] };
  },

  // Candidates
  async getCandidates(requestId?: string): Promise<MatchCandidate[]> {
    await delay();
    if (requestId) {
      return [...candidatesDb];
    }
    return [...candidatesDb];
  },

  // Nearby Emergencies
  async getNearbyEmergencies(): Promise<NearbyEmergency[]> {
    await delay();
    return [...nearbyEmergenciesDb];
  },

  async pledgeEmergency(id: string): Promise<NearbyEmergency | null> {
    await delay();
    const item = nearbyEmergenciesDb.find((e) => e.id === id);
    if (!item) return null;
    item.isPledged = true;
    return { ...item };
  },

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    await delay();
    const active = requestsDb.filter((r) => r.status !== "fulfilled" && r.status !== "cancelled");
    const fulfilled = requestsDb.filter((r) => r.status === "fulfilled");
    const secured = active.reduce((acc, r) => acc + r.unitsSecured, 0);
    const needed = active.reduce((acc, r) => acc + r.units, 0);

    return {
      activeRequestsCount: active.length,
      unitsSecuredDisplay: `${secured} / ${needed || 6}`,
      fulfilledCount: fulfilled.length,
      avgResponseTime: "11m",
      totalDonorsAvailable: 24,
    };
  },

  async getLandingMetrics(): Promise<LandingMetrics> {
    await delay();
    return {
      donorsOnCall: "18k+",
      verifiedBanks: "240+",
      medianResponseTime: "9 min",
      featuredEmergency: {
        hospital: "Manipal Hospital, Old Airport Rd",
        group: "A+",
        units: 3,
        urgency: "critical",
        distance: "2.1 km",
        postedAgo: "12 min ago",
      },
      topMatches: [
        { name: "Sanjeevani Blood Centre", kind: "bank", meta: "12 units · 18 min", score: 94 },
        { name: "Rohit Menon · O-", kind: "donor", meta: "2.1 km · 14 min", score: 91 },
      ],
    };
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    await delay();
    return [...notificationsDb];
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await delay();
    notificationsDb = notificationsDb.map((n) => (n.id === id ? { ...n, unread: false } : n));
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await delay();
    notificationsDb = notificationsDb.map((n) => ({ ...n, unread: false }));
  },

  // Hospitals
  async getHospitals(): Promise<Hospital[]> {
    await delay();
    return [...hospitalsDb];
  },
};
