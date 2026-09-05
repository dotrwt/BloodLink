import { useState, useEffect, useCallback } from "react";
import { requestService } from "../services/requestService";
import type { BloodRequest, CreateRequestPayload } from "../types/models";

export function useRequests() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await requestService.getRequests();
        if (!ignore) {
          setRequests(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load requests");
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

  const createRequest = async (payload: CreateRequestPayload) => {
    const newReq = await requestService.createRequest(payload);
    setRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  return {
    requests,
    loading,
    error,
    refetch,
    createRequest,
  };
}
