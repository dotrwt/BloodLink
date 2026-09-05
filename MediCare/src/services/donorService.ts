import { apiClient, getToken } from "./apiClient";
import { mockDb } from "../mocks/mockDb";
import type { DonorStats, DonorDonationRecord, NearbyEmergency, BloodGroup } from "../types/models";

export const donorService = {
  async getDonorStats(): Promise<DonorStats> {
    const token = getToken();
    if (token) {
      try {
        const res = await apiClient.get<any>("/api/dashboard/donor");
        if (res && typeof res.total_donations === "number") {
          return {
            donationsCount: res.total_donations,
            livesImpacted: Math.max(3, (res.total_donations || 1) * 3),
            nextEligibleDate: res.next_eligible_date
              ? new Date(res.next_eligible_date).toLocaleDateString()
              : "Today (Eligible)",
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
    const token = getToken();
    if (token) {
      try {
        const donations = await apiClient.get<any[]>("/api/donations");
        if (Array.isArray(donations) && donations.length > 0) {
          return donations.map((d) => ({
            id: `don-${d.id}`,
            date: d.donation_date ? d.donation_date.slice(0, 10) : "2026-06-15",
            hospital: d.hospital?.name || "Verified Blood Centre",
            bloodGroup: (d.blood_group || "O-") as BloodGroup,
            units: d.units_donated || 1,
            status: "completed",
            certificateAvailable: true,
          }));
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.getDonorDonations();
  },

  async getNearbyEmergencies(): Promise<NearbyEmergency[]> {
    const token = getToken();
    if (token) {
      try {
        const reqs = await apiClient.get<any[]>("/api/requests");
        if (Array.isArray(reqs) && reqs.length > 0) {
          const mapped: NearbyEmergency[] = reqs
            .filter((r) => r.status === "CREATED" || r.status === "MATCHING" || r.status === "DONOR_NOTIFIED")
            .map((r) => ({
              id: `req-${r.id}`,
              group: r.blood_group as BloodGroup,
              units: r.units_required || 1,
              hospital: r.hospital_name || "Emergency Care Center",
              dist: 2.3,
              urgency: ((r.urgency || "urgent").toLowerCase()) as any,
              by: r.required_by
                ? new Date(r.required_by).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Within 2 hrs",
              isPledged: false,
            }));

          if (mapped.length > 0) {
            return mapped;
          }
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.getNearbyEmergencies();
  },

  async pledgeDonation(emergencyId: string): Promise<NearbyEmergency | null> {
    const numericId = emergencyId.replace("req-", "");
    const token = getToken();
    if (token && !isNaN(Number(numericId))) {
      try {
        await apiClient.patch(`/api/requests/${numericId}/status`, {
          status: "DONOR_ACCEPTED",
        });
      } catch {
        /* fallback */
      }
    }
    return await mockDb.pledgeEmergency(emergencyId);
  },
};
