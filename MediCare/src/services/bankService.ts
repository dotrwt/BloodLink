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
            capacityPercentage: 78,
          };
        }
      } catch {
        /* fallback to mock */
      }
    }
    return await mockDb.getBankStats();
  },

  async getInventory(): Promise<InventoryRow[]> {
    return await mockDb.getBankInventory();
  },

  async updateInventoryStock(group: BloodGroup, delta: number): Promise<InventoryRow[]> {
    return await mockDb.updateInventoryStock(group, delta);
  },

  async getTriageQueue(): Promise<BankTriageItem[]> {
    return await mockDb.getBankTriage();
  },

  async allocateUnits(id: string, units: number): Promise<BankTriageItem | null> {
    return await mockDb.allocateTriageUnits(id, units);
  },
};
