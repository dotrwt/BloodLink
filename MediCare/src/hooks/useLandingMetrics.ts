import { useState, useEffect } from "react";
import { statsService } from "../services/statsService";
import type { LandingMetrics } from "../types/models";

export function useLandingMetrics() {
  const [metrics, setMetrics] = useState<LandingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await statsService.getLandingMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load landing metrics", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { metrics, loading };
}
