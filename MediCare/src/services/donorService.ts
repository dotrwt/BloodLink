import { mockDb } from "../mocks/mockDb";
import { handleResponse } from "./apiClient";
import type { DonorStats, DonorDonationRecord, NearbyEmergency } from "../types/models";

export const donorService = {
  async getDonorStats(): Promise<DonorStats> {
    return handleResponse(mockDb.getDonorStats());
  },

  async getDonationHistory(): Promise<DonorDonationRecord[]> {
    return handleResponse(mockDb.getDonorDonations());
  },

  async getNearbyEmergencies(): Promise<NearbyEmergency[]> {
    return handleResponse(mockDb.getNearbyEmergencies());
  },

  async pledgeDonation(emergencyId: string): Promise<NearbyEmergency | null> {
    return handleResponse(mockDb.pledgeEmergency(emergencyId));
  },
};
