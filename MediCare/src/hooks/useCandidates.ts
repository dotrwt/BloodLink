import { useState, useEffect, useCallback } from "react";
import { requestService } from "../services/requestService";
import type { MatchCandidate } from "../types/models";

export function useCandidates(requestId: string | undefined) {
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!requestId) {
        setCandidates([]);
        setLoading(false);
        return;
      }
      try {
        const data = await requestService.getCandidatesForRequest(requestId);
        if (!ignore) {
          setCandidates(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load matching candidates");
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
  }, [requestId, reloadKey]);

  const refetch = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return {
    candidates,
    loading,
    error,
    refetch,
  };
}
