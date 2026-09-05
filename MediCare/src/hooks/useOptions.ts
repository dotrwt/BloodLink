import { useState, useEffect } from "react";
import { metaService } from "../services/metaService";
import type { Hospital, BloodGroup, Urgency } from "../types/models";

export function useOptions() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodGroups, setBloodGroups] = useState<{ value: BloodGroup; label: string }[]>([]);
  const [urgencyLevels, setUrgencyLevels] = useState<{ value: Urgency; label: string; desc: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [hospList, bgList, urgList] = await Promise.all([
          metaService.getHospitals(),
          metaService.getBloodGroupOptions(),
          metaService.getUrgencyOptions(),
        ]);
        setHospitals(hospList);
        setBloodGroups(bgList);
        setUrgencyLevels(urgList);
      } catch (err) {
        console.error("Failed to load options", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return {
    hospitals,
    bloodGroups,
    urgencyLevels,
    loading,
  };
}
