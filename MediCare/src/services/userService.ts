import { apiClient, getToken, getStoredUser, setStoredUser } from "./apiClient";
import { getRole } from "../lib/session";
import { mockDb } from "../mocks/mockDb";
import type { UserProfile, Role, BloodGroup } from "../types/models";

export const userService = {
  async getCurrentUser(): Promise<UserProfile> {
    const token = getToken();
    const stored = getStoredUser();

    if (token) {
      try {
        const u = await apiClient.get<any>("/api/auth/me");
        if (u && u.id) {
          let role: Role = "requester";
          const r = (u.role || "").toUpperCase();
          if (r === "DONOR") role = "donor";
          else if (r === "HOSPITAL" || r === "BLOOD_BANK" || r === "ADMIN") role = "bank";
          else if (r === "REQUESTER") role = "requester";

          let bloodGroup: BloodGroup = "O+";
          let availableToDonate = true;
          let totalDonations = 0;
          let lastDonationDate: string | undefined = undefined;
          let location = "Bengaluru";
          let org: string | undefined = undefined;

          if (u.donor_profile) {
            bloodGroup = (u.donor_profile.blood_group as BloodGroup) || "O+";
            availableToDonate = u.donor_profile.is_available ?? true;
            totalDonations = u.donor_profile.total_donations ?? 0;
            location =
              [u.donor_profile.area, u.donor_profile.city].filter(Boolean).join(", ") ||
              u.donor_profile.city ||
              "Bengaluru";
            if (u.donor_profile.last_donation_date) {
              lastDonationDate = u.donor_profile.last_donation_date.slice(0, 10);
            }
          } else if (u.hospital_profile) {
            org = u.hospital_profile.name;
            location =
              [u.hospital_profile.address, u.hospital_profile.city].filter(Boolean).join(", ") ||
              u.hospital_profile.city ||
              "Bengaluru";
          } else if (u.requester_profile) {
            location =
              [u.requester_profile.area, u.requester_profile.city].filter(Boolean).join(", ") ||
              u.requester_profile.city ||
              "Bengaluru";
          }

          const profile: UserProfile = {
            id: `usr-${u.id}`,
            name: u.full_name || u.email.split("@")[0].replace(/[._]/g, " "),
            email: u.email,
            phone: u.phone || undefined,
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
          return profile;
        }
      } catch {
        /* fallback to stored */
      }
    }

    if (stored) {
      return stored as UserProfile;
    }

    // Role-specific isolated default profile if not logged in
    const activeRole = getRole();
    if (activeRole === "donor") {
      return {
        id: "usr-donor-guest",
        name: "Rahul Sharma",
        email: "rahul@bloodbridge.demo",
        role: "donor",
        bloodGroup: "O-",
        location: "Gwalior, MP",
        availableToDonate: true,
        totalDonations: 4,
        lastDonationDate: "2026-06-15",
      };
    } else if (activeRole === "bank") {
      return {
        id: "usr-bank-guest",
        name: "Apollo Blood Bank",
        email: "apollo@bloodbridge.demo",
        role: "bank",
        bloodGroup: "O+",
        location: "Gwalior, MP",
        org: "Apollo Hospital & Blood Centre",
        availableToDonate: false,
        totalDonations: 0,
      };
    }

    return await mockDb.getUser();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const updated = await mockDb.updateUser(updates);
    setStoredUser(updated);
    return updated;
  },

  async setAvailability(available: boolean): Promise<boolean> {
    const token = getToken();
    if (token) {
      try {
        await apiClient.put(`/api/donors/me/availability?is_available=${available}`);
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.setAvailability(available);
  },
};
