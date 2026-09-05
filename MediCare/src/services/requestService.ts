import { apiClient, getToken } from "./apiClient";
import { mockDb } from "../mocks/mockDb";
import type { BloodRequest, CreateRequestPayload, MatchCandidate, RequestStatus } from "../types/models";

function mapBackendStatus(s: string): RequestStatus {
  const upper = (s || "").toUpperCase();
  switch (upper) {
    case "CREATED":
    case "MATCHING":
      return "matching";
    case "DONOR_NOTIFIED":
      return "contacted";
    case "DONOR_ACCEPTED":
      return "accepted";
    case "EN_ROUTE":
      return "en_route";
    case "BLOOD_RECEIVED":
      return "confirmed";
    case "COMPLETED":
      return "fulfilled";
    case "CANCELLED":
      return "cancelled";
    default:
      return "matching";
  }
}

function mapUiStatusToBackend(s: RequestStatus): string {
  switch (s) {
    case "matching":
      return "MATCHING";
    case "contacted":
      return "DONOR_NOTIFIED";
    case "accepted":
      return "DONOR_ACCEPTED";
    case "en_route":
      return "EN_ROUTE";
    case "confirmed":
      return "BLOOD_RECEIVED";
    case "fulfilled":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "MATCHING";
  }
}

export const requestService = {
  async getRequests(): Promise<BloodRequest[]> {
    const token = getToken();
    if (token) {
      try {
        const backendRequests = await apiClient.get<any[]>("/api/requests");
        if (Array.isArray(backendRequests) && backendRequests.length > 0) {
          const mapped: BloodRequest[] = backendRequests.map((r) => ({
            id: `req-${r.id}`,
            patientName: r.patient_reference || r.patient_name || `Patient #${r.id}`,
            bloodGroup: (r.blood_group || "O+") as any,
            units: r.units_required || 1,
            unitsSecured: r.units_fulfilled || 0,
            hospital: r.hospital_name || "Emergency Medical Hospital",
            location: `${r.area ? r.area + ", " : ""}${r.city || ""}`.trim() || "Hospital Medical Ward",
            city: r.city || undefined,
            area: r.area || undefined,
            latitude: r.latitude || undefined,
            longitude: r.longitude || undefined,
            urgency: ((r.urgency || "urgent").toLowerCase()) as any,
            requiredBy: r.required_by
              ? new Date(r.required_by).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Urgent",
            createdAt: "Recently",
            status: mapBackendStatus(r.status),
            note: r.notes || undefined,
          }));

          const mockOnes = await mockDb.getRequests();
          return [...mapped, ...mockOnes];
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.getRequests();
  },

  async getRequestById(id: string): Promise<BloodRequest | null> {
    const numericId = id.replace("req-", "");
    const token = getToken();
    if (token && !isNaN(Number(numericId))) {
      try {
        const r = await apiClient.get<any>(`/api/requests/${numericId}`);
        if (r && r.id) {
          return {
            id: `req-${r.id}`,
            patientName: r.patient_reference || r.patient_name || `Patient #${r.id}`,
            bloodGroup: (r.blood_group || "O+") as any,
            units: r.units_required || 1,
            unitsSecured: r.units_fulfilled || 0,
            hospital: r.hospital_name || "Emergency Medical Hospital",
            location: `${r.area ? r.area + ", " : ""}${r.city || ""}`.trim() || "Hospital Medical Ward",
            city: r.city || undefined,
            area: r.area || undefined,
            latitude: r.latitude || undefined,
            longitude: r.longitude || undefined,
            urgency: ((r.urgency || "urgent").toLowerCase()) as any,
            requiredBy: r.required_by
              ? new Date(r.required_by).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Urgent",
            createdAt: "Recently",
            status: mapBackendStatus(r.status),
            note: r.notes || undefined,
          };
        }
      } catch {
        /* fallback */
      }
    }
    return await mockDb.getRequestById(id);
  },

  async createRequest(payload: CreateRequestPayload): Promise<BloodRequest> {
    const token = getToken();
    if (token) {
      try {
        const res = await apiClient.post<any>("/api/requests", {
          blood_group: payload.bloodGroup,
          units_required: Number(payload.units),
          hospital_name: payload.hospital,
          urgency: (payload.urgency || "URGENT").toUpperCase(),
          patient_reference: payload.patientName,
          notes: payload.note,
          city: payload.city,
          area: payload.area,
          latitude: payload.latitude,
          longitude: payload.longitude,
        });

        if (res && res.id) {
          const newReq: BloodRequest = {
            id: `req-${res.id}`,
            patientName: payload.patientName,
            bloodGroup: payload.bloodGroup,
            units: payload.units,
            unitsSecured: 0,
            hospital: payload.hospital,
            location: payload.location,
            city: res.city || payload.city,
            area: res.area || payload.area,
            latitude: res.latitude || payload.latitude,
            longitude: res.longitude || payload.longitude,
            urgency: payload.urgency,
            requiredBy: payload.requiredBy,
            createdAt: "Just now",
            status: "matching",
            note: payload.note,
          };
          mockDb.upsertRequest(newReq);
          return newReq;
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.createRequest(payload);
  },

  async updateStatus(id: string, status: RequestStatus): Promise<BloodRequest | null> {
    const numericId = id.replace("req-", "");
    const token = getToken();
    if (token && !isNaN(Number(numericId))) {
      try {
        const backendStatus = mapUiStatusToBackend(status);
        const res = await apiClient.patch<any>(`/api/requests/${numericId}/status`, {
          status: backendStatus,
        });
        if (res && res.id) {
          const updatedReq: BloodRequest = {
            id: `req-${res.id}`,
            patientName: res.patient_reference || res.patient_name || `Patient #${res.id}`,
            bloodGroup: (res.blood_group || "O+") as any,
            units: res.units_required || 1,
            unitsSecured: res.units_fulfilled || 0,
            hospital: res.hospital_name || "Emergency Medical Hospital",
            location: `${res.area ? res.area + ", " : ""}${res.city || ""}`.trim() || "Hospital Medical Ward",
            city: res.city || undefined,
            area: res.area || undefined,
            latitude: res.latitude || undefined,
            longitude: res.longitude || undefined,
            urgency: ((res.urgency || "urgent").toLowerCase()) as any,
            requiredBy: res.required_by
              ? new Date(res.required_by).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Urgent",
            createdAt: "Recently",
            status: mapBackendStatus(res.status),
            note: res.notes || undefined,
            source: {
              name: status === "accepted" || status === "en_route" ? "Rohit Menon" : "Sanjeevani Blood Centre",
              kind: status === "accepted" || status === "en_route" ? "donor" : "bank",
            },
          };
          mockDb.upsertRequest(updatedReq);
          return updatedReq;
        }
      } catch (err) {
        console.warn("Backend updateStatus call failed, falling back to mockDb:", err);
      }
    }
    return await mockDb.updateRequestStatus(id, status);
  },

  async getCandidatesForRequest(requestId: string): Promise<MatchCandidate[]> {
    const numericId = requestId.replace("req-", "");
    const token = getToken();
    if (token && !isNaN(Number(numericId))) {
      try {
        const matches = await apiClient.get<any[]>(`/api/matches/request/${numericId}`);
        if (Array.isArray(matches) && matches.length > 0) {
          return matches.map((m) => ({
            id: `cand-${m.id}`,
            kind: "donor",
            name: m.donor?.name || `Donor #${m.donor_id}`,
            bloodGroup: (m.donor?.blood_group || "O-") as any,
            distanceKm: m.distance_km || 2.5,
            etaMin: m.eta_minutes || 15,
            eligible: true,
            unitsAvailable: 1,
            rating: 4.9,
            verified: true,
            responseRate: 0.95,
          }));
        }
      } catch {
        /* fallback */
      }
    }
    return await mockDb.getCandidates(requestId);
  },
};
