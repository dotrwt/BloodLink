import { apiClient, getToken } from "./apiClient";
import { mockDb } from "../mocks/mockDb";
import type { BankStats, BankTriageItem, BloodGroup, InventoryRow } from "../types/models";

export const bankService = {
  async getBankStats(): Promise<BankStats> {
    const token = getToken();
    if (token) {
      try {
        const res = await apiClient.get<any>("/api/dashboard/bloodbank");
        if (res && typeof res.total_units_available === "number") {
          return {
            totalUnits: res.total_units_available,
            unitsReserved: res.total_units_reserved || 0,
            incomingRequestsCount: res.incoming_requests_count || 3,
            expiringSoonCount: res.expiring_soon_count || 0,
            capacityPercentage: Math.min(100, Math.round(((res.total_units_available || 0) / 120) * 100)) || 78,
          };
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.getBankStats();
  },

  async getInventory(): Promise<InventoryRow[]> {
    const token = getToken();
    if (token) {
      try {
        const invList = await apiClient.get<any[]>("/api/inventory");
        if (Array.isArray(invList) && invList.length > 0) {
          return invList.map((item) => ({
            group: item.blood_group as BloodGroup,
            units: item.units_available ?? 0,
            reserved: item.units_reserved ?? 0,
            nearExpiry: 0,
            capacity: 35,
            safeThreshold: item.safe_threshold ?? 5,
          }));
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.getBankInventory();
  },

  async updateInventoryStock(group: BloodGroup, delta: number): Promise<InventoryRow[]> {
    const token = getToken();
    if (token) {
      try {
        const invList = await apiClient.get<any[]>("/api/inventory");
        const found = invList?.find((i) => i.blood_group === group);
        if (found && found.id) {
          const newUnits = Math.max(0, (found.units_available || 0) + delta);
          await apiClient.patch(`/api/inventory/${found.id}`, {
            units_available: newUnits,
          });
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.updateInventoryStock(group, delta);
  },

  async getTriageQueue(): Promise<BankTriageItem[]> {
    const token = getToken();
    if (token) {
      try {
        const reqs = await apiClient.get<any[]>("/api/requests");
        if (Array.isArray(reqs) && reqs.length > 0) {
          const triageItems: BankTriageItem[] = reqs
            .filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED")
            .map((r) => ({
              id: `req-${r.id}`,
              hospital: r.hospital_name || "Emergency Medical Hospital",
              bloodGroup: r.blood_group as BloodGroup,
              unitsNeeded: r.units_required || 1,
              unitsAllocated: r.units_fulfilled || 0,
              urgency: ((r.urgency || "urgent").toLowerCase()) as any,
              requiredBy: r.required_by
                ? new Date(r.required_by).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Within 2h",
              status: (r.units_fulfilled || 0) >= (r.units_required || 1) ? "allocated" : "pending",
            }));

          if (triageItems.length > 0) {
            return triageItems;
          }
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.getBankTriage();
  },

  async allocateUnits(id: string, units: number): Promise<BankTriageItem | null> {
    const numericId = id.replace("req-", "");
    const token = getToken();
    if (token && !isNaN(Number(numericId))) {
      try {
        await apiClient.patch(`/api/requests/${numericId}/status`, {
          status: "EN_ROUTE",
        });
      } catch {
        /* fallback */
      }
    }
    return await mockDb.allocateTriageUnits(id, units);
  },
};
