import { useState, useEffect, useCallback } from "react";
import { donorService } from "../services/donorService";
import { userService } from "../services/userService";
import type { DonorStats, DonorDonationRecord, NearbyEmergency, UserProfile } from "../types/models";

export function useDonorDashboard() {
  const [stats, setStats] = useState<DonorStats | null>(null);
  const [emergencies, setEmergencies] = useState<NearbyEmergency[]>([]);
  const [history, setHistory] = useState<DonorDonationRecord[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [statsData, emergenciesData, historyData, userData] = await Promise.all([
          donorService.getDonorStats(),
          donorService.getNearbyEmergencies(),
          donorService.getDonationHistory(),
          userService.getCurrentUser(),
        ]);
        if (!ignore) {
          setStats(statsData);
          setEmergencies(emergenciesData);
          setHistory(historyData);
          setUser(userData);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load donor dashboard");
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

  const toggleAvailability = async () => {
    if (!user) return;
    try {
      const nextVal = !user.availableToDonate;
      await userService.setAvailability(nextVal);
      setUser((prev) => (prev ? { ...prev, availableToDonate: nextVal } : prev));
    } catch (err) {
      console.error("Failed to toggle availability", err);
    }
  };

  const pledgeDonation = async (emergencyId: string) => {
    try {
      await donorService.pledgeDonation(emergencyId);
      setEmergencies((prev) =>
        prev.map((e) => (e.id === emergencyId ? { ...e, isPledged: true } : e))
      );
    } catch (err) {
      console.error("Failed to pledge donation", err);
    }
  };

  return {
    stats,
    emergencies,
    history,
    user,
    loading,
    error,
    refetch,
    toggleAvailability,
    pledgeDonation,
  };
}
