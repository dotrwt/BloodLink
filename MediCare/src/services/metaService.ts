import { mockDb } from "../mocks/mockDb";
import { handleResponse } from "./apiClient";
import type { Hospital } from "../types/models";
import { BLOOD_GROUP_OPTIONS, URGENCY_OPTIONS } from "../constants/options";

export const metaService = {
  async getHospitals(): Promise<Hospital[]> {
    return handleResponse(mockDb.getHospitals());
  },

  async getBloodGroupOptions() {
    return BLOOD_GROUP_OPTIONS;
  },

  async getUrgencyOptions() {
    return URGENCY_OPTIONS;
  },
};
