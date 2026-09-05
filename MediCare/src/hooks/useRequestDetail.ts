import { useState, useEffect, useCallback } from "react";
import { requestService } from "../services/requestService";
import type { BloodRequest, RequestStatus } from "../types/models";

export function useRequestDetail(id: string | undefined) {
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!id) {
        setRequest(null);
        setLoading(false);
        return;
      }
      try {
        const data = await requestService.getRequestById(id);
        if (!ignore) {
          if (!data) {
            const all = await requestService.getRequests();
            setRequest(all[0] || null);
          } else {
            setRequest(data);
          }
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load request details");
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
  }, [id, reloadKey]);

  const refetch = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  const updateStatus = async (status: RequestStatus) => {
    if (!request) return;
    // Optimistically update request status immediately for instant UI feedback
    setRequest((prev) => (prev ? { ...prev, status } : null));
    try {
      const updated = await requestService.updateStatus(request.id, status);
      if (updated) {
        setRequest((prev) => (prev ? { ...prev, ...updated, status } : updated));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return {
    request,
    loading,
    error,
    refetch,
    updateStatus,
  };
}
