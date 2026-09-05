import { apiClient, getToken } from "./apiClient";
import { mockDb } from "../mocks/mockDb";
import type { DonorStats, DonorDonationRecord, NearbyEmergency } from "../types/models";

export const donorService = {
  async getDonorStats(): Promise<DonorStats> {
    const token = getToken();
    if (token) {
      try {
        const res = await apiClient.get<any>("/api/dashboard/donor");
        if (res && typeof res.total_donations === "number") {
          return {
            donationsCount: res.total_donations,
            livesImpacted: (res.total_donations || 1) * 3,
            nextEligibleDate: res.next_eligible_date ? new Date(res.next_eligible_date).toLocaleDateString() : "Today (Eligible)",
            isEligible: res.is_eligible ?? true,
            nearbyAlertsCount: res.pending_requests_count || 0,
          };
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.getDonorStats();
  },

  async getDonationHistory(): Promise<DonorDonationRecord[]> {
    return await mockDb.getDonorDonations();
  },

  async getNearbyEmergencies(): Promise<NearbyEmergency[]> {
    return await mockDb.getNearbyEmergencies();
  },

  async pledgeDonation(emergencyId: string): Promise<NearbyEmergency | null> {
    return await mockDb.pledgeEmergency(emergencyId);
  },
};
