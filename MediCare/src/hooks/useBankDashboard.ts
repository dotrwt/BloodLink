import { useState, useEffect, useCallback } from "react";
import { bankService } from "../services/bankService";
import type { BankStats, BankTriageItem, BloodGroup, InventoryRow } from "../types/models";

export function useBankDashboard() {
  const [stats, setStats] = useState<BankStats | null>(null);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [triage, setTriage] = useState<BankTriageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [statsData, inventoryData, triageData] = await Promise.all([
          bankService.getBankStats(),
          bankService.getInventory(),
          bankService.getTriageQueue(),
        ]);
        if (!ignore) {
          setStats(statsData);
          setInventory(inventoryData);
          setTriage(triageData);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load blood bank dashboard");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  const adjustStock = async (group: BloodGroup, delta: number) => {
    try {
      const updated = await bankService.updateInventoryStock(group, delta);
      setInventory(updated);
      const updatedStats = await bankService.getBankStats();
      setStats(updatedStats);
    } catch (err) {
      console.error("Failed to adjust inventory stock", err);
    }
  };

  const allocateUnits = async (id: string, units: number) => {
    try {
      await bankService.allocateUnits(id, units);
      const [updatedTriage, updatedInventory, updatedStats] = await Promise.all([
        bankService.getTriageQueue(),
        bankService.getInventory(),
        bankService.getBankStats(),
      ]);
      setTriage(updatedTriage);
      setInventory(updatedInventory);
      setStats(updatedStats);
    } catch (err) {
      console.error("Failed to allocate triage units", err);
    }
  };

  return {
    stats,
    inventory,
    triage,
    loading,
    error,
    refetch,
    adjustStock,
    allocateUnits,
  };
}
