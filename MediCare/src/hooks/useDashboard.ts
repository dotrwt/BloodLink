import { useState, useEffect, useCallback } from "react";
import { statsService } from "../services/statsService";
import { requestService } from "../services/requestService";
import { emergencyService } from "../services/emergencyService";
import { userService } from "../services/userService";
import type { DashboardStats, BloodRequest, NearbyEmergency, UserProfile } from "../types/models";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [emergencies, setEmergencies] = useState<NearbyEmergency[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [statsData, requestsData, emergenciesData, userData] = await Promise.all([
          statsService.getDashboardStats(),
          requestService.getRequests(),
          emergencyService.getNearbyEmergencies(),
          userService.getCurrentUser(),
        ]);
        if (!ignore) {
          setStats(statsData);
          setRequests(requestsData);
          setEmergencies(emergenciesData);
          setUser(userData);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
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
      console.error("Failed to update availability", err);
    }
  };

  const pledgeEmergency = async (id: string) => {
    try {
      await emergencyService.pledgeEmergency(id);
      setEmergencies((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isPledged: true } : e))
      );
    } catch (err) {
      console.error("Failed to pledge emergency donation", err);
    }
  };

  return {
    stats,
    requests,
    emergencies,
    user,
    loading,
    error,
    refetch,
    toggleAvailability,
    pledgeEmergency,
  };
}
