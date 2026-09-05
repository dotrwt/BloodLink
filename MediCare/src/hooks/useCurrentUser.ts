import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/userService";
import type { UserProfile } from "../types/models";

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await userService.getCurrentUser();
        if (!ignore) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load user profile");
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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await userService.updateProfile(updates);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  };

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

  return {
    user,
    loading,
    error,
    refetch,
    updateProfile,
    toggleAvailability,
  };
}
