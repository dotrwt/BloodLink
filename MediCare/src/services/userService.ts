import { mockDb } from "../mocks/mockDb";
import { handleResponse } from "./apiClient";
import type { UserProfile } from "../types/models";

export const userService = {
  async getCurrentUser(): Promise<UserProfile> {
    return handleResponse(mockDb.getUser());
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return handleResponse(mockDb.updateUser(updates));
  },

  async setAvailability(available: boolean): Promise<boolean> {
    return handleResponse(mockDb.setAvailability(available));
  },
};
