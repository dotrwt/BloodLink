import { mockDb } from "../mocks/mockDb";
import { handleResponse } from "./apiClient";
import type { DashboardStats, LandingMetrics } from "../types/models";

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return handleResponse(mockDb.getDashboardStats());
  },

  async getLandingMetrics(): Promise<LandingMetrics> {
    return handleResponse(mockDb.getLandingMetrics());
  },
};
