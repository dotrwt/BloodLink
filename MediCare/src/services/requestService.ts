import { mockDb } from "../mocks/mockDb";
import { handleResponse } from "./apiClient";
import type { BloodRequest, CreateRequestPayload, MatchCandidate, RequestStatus } from "../types/models";

export const requestService = {
  async getRequests(): Promise<BloodRequest[]> {
    return handleResponse(mockDb.getRequests());
  },

  async getRequestById(id: string): Promise<BloodRequest | null> {
    return handleResponse(mockDb.getRequestById(id));
  },

  async createRequest(payload: CreateRequestPayload): Promise<BloodRequest> {
    return handleResponse(mockDb.createRequest(payload));
  },

  async updateStatus(id: string, status: RequestStatus): Promise<BloodRequest | null> {
    return handleResponse(mockDb.updateRequestStatus(id, status));
  },

  async getCandidatesForRequest(requestId: string): Promise<MatchCandidate[]> {
    return handleResponse(mockDb.getCandidates(requestId));
  },
};
