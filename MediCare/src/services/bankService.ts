import { mockDb } from "../mocks/mockDb";
import { handleResponse } from "./apiClient";
import type { BankStats, BankTriageItem, BloodGroup, InventoryRow } from "../types/models";

export const bankService = {
  async getBankStats(): Promise<BankStats> {
    return handleResponse(mockDb.getBankStats());
  },

  async getInventory(): Promise<InventoryRow[]> {
    return handleResponse(mockDb.getBankInventory());
  },

  async updateInventoryStock(group: BloodGroup, delta: number): Promise<InventoryRow[]> {
    return handleResponse(mockDb.updateInventoryStock(group, delta));
  },

  async getTriageQueue(): Promise<BankTriageItem[]> {
    return handleResponse(mockDb.getBankTriage());
  },

  async allocateUnits(id: string, units: number): Promise<BankTriageItem | null> {
    return handleResponse(mockDb.allocateTriageUnits(id, units));
  },
};
