import { mockDb } from "../mocks/mockDb";
import { handleResponse } from "./apiClient";
import type { NearbyEmergency } from "../types/models";

export const emergencyService = {
  async getNearbyEmergencies(): Promise<NearbyEmergency[]> {
    return handleResponse(mockDb.getNearbyEmergencies());
  },

  async pledgeEmergency(id: string): Promise<NearbyEmergency | null> {
    return handleResponse(mockDb.pledgeEmergency(id));
  },
};
