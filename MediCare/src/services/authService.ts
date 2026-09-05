import { apiClient, setToken, removeToken, setStoredUser } from "./apiClient";
import { setRole } from "../lib/session";
import { mockDb } from "../mocks/mockDb";
import type { Role, BloodGroup, UserProfile } from "../types/models";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: number;
  full_name: string | null;
}

export interface DonorSignupPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  blood_group: BloodGroup;
  age?: number;
  gender?: string;
  city?: string;
  area?: string;
  is_available?: boolean;
}

export interface RequesterSignupPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  city?: string;
  area?: string;
  relationship_to_patient?: string;
}

export interface BloodBankSignupPayload {
  blood_bank_name: string;
  official_email: string;
  phone: string;
  password: string;
  confirm_password: string;
  license_number?: string;
  blood_bank_type?: string;
  address?: string;
  city?: string;
  pincode?: string;
  contact_person_name?: string;
  contact_person_designation?: string;
}

async function handleAuthSuccess(
  data: LoginResponse
): Promise<{ data: LoginResponse; targetPath: string; profile: UserProfile }> {
  if (data && data.access_token) {
    setToken(data.access_token);
  }

  const backendRole = (data.role || "").toUpperCase();
  let role: Role = "requester";
  let targetPath = "/app/requester";

  if (backendRole === "DONOR") {
    role = "donor";
    targetPath = "/app/donor";
  } else if (
    backendRole === "HOSPITAL" ||
    backendRole === "BLOOD_BANK" ||
    backendRole === "ADMIN"
  ) {
    role = "bank";
    targetPath = "/app/bank";
  } else {
    role = "requester";
    targetPath = "/app/requester";
  }

  setRole(role);

  // Fetch full authentic user info from backend /api/auth/me
  let me: any = null;
  try {
    me = await apiClient.get<any>("/api/auth/me");
  } catch {
    /* fallback to data if me fails */
  }

  let bloodGroup: BloodGroup = "O+";
  let location = "Bengaluru";
  let org: string | undefined = undefined;
  let availableToDonate = true;
  let totalDonations = 0;
  let lastDonationDate: string | undefined = undefined;

  if (me?.donor_profile) {
    bloodGroup = (me.donor_profile.blood_group as BloodGroup) || "O+";
    availableToDonate = me.donor_profile.is_available ?? true;
    totalDonations = me.donor_profile.total_donations ?? 0;
    location =
      [me.donor_profile.area, me.donor_profile.city]
        .filter(Boolean)
        .join(", ") || "Bengaluru";
    if (me.donor_profile.last_donation_date) {
      lastDonationDate = me.donor_profile.last_donation_date.slice(0, 10);
    }
  } else if (me?.hospital_profile) {
    org = me.hospital_profile.name;
    location =
      [me.hospital_profile.address, me.hospital_profile.city]
        .filter(Boolean)
        .join(", ") || "Bengaluru";
  } else if (me?.requester_profile) {
    location =
      [me.requester_profile.area, me.requester_profile.city]
        .filter(Boolean)
        .join(", ") || "Bengaluru";
  }

  const profile: UserProfile = {
    id: `usr-${me?.id || data.user_id}`,
    name: me?.full_name || data.full_name || "User",
    email: me?.email || "",
    phone: me?.phone || "",
    role,
    bloodGroup,
    location,
    org,
    availableToDonate,
    totalDonations,
    lastDonationDate,
  };

  setStoredUser(profile);
  mockDb.updateUser(profile);

  if (role === "donor") {
    mockDb.addCandidate({
      id: `cand-${profile.id}`,
      kind: "donor",
      name: profile.name,
      bloodGroup: profile.bloodGroup,
      distanceKm: 1.5,
      etaMin: 12,
      eligible: profile.availableToDonate ?? true,
      unitsAvailable: 1,
      rating: 5.0,
      lastDonation: profile.lastDonationDate || "Recent",
      verified: true,
      responseRate: 1.0,
    });
  }

  return { data, targetPath, profile };
}

export const authService = {
  async login(
    email: string,
    pw: string
  ): Promise<{ data: LoginResponse; targetPath: string; profile: UserProfile }> {
    const data = await apiClient.post<LoginResponse>("/api/auth/login", {
      email,
      password: pw,
    });
    return await handleAuthSuccess(data);
  },

  async signupDonor(
    payload: DonorSignupPayload
  ): Promise<{ data: LoginResponse; targetPath: string; profile: UserProfile }> {
    const data = await apiClient.post<LoginResponse>(
      "/api/auth/signup/donor",
      payload
    );
    return await handleAuthSuccess(data);
  },

  async signupRequester(
    payload: RequesterSignupPayload
  ): Promise<{ data: LoginResponse; targetPath: string; profile: UserProfile }> {
    const data = await apiClient.post<LoginResponse>(
      "/api/auth/signup/requester",
      payload
    );
    return await handleAuthSuccess(data);
  },

  async signupBloodBank(
    payload: BloodBankSignupPayload
  ): Promise<{ data: LoginResponse; targetPath: string; profile: UserProfile }> {
    const data = await apiClient.post<LoginResponse>(
      "/api/auth/signup/bloodbank",
      payload
    );
    return await handleAuthSuccess(data);
  },

  async logout() {
    removeToken();
  },

  async getMe() {
    return await apiClient.get<any>("/api/auth/me");
  },
};
