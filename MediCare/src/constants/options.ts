import type { BloodGroup, Urgency } from "../types/models";

export const BLOOD_GROUP_OPTIONS: { value: BloodGroup; label: string }[] = [
  { value: "O-", label: "O- (Universal Donor)" },
  { value: "O+", label: "O+" },
  { value: "A-", label: "A-" },
  { value: "A+", label: "A+" },
  { value: "B-", label: "B-" },
  { value: "B+", label: "B+" },
  { value: "AB-", label: "AB-" },
  { value: "AB+", label: "AB+ (Universal Recipient)" },
];

export const URGENCY_OPTIONS: { value: Urgency; label: string; desc: string }[] = [
  { value: "critical", label: "Critical", desc: "Life-threatening, needed within hours" },
  { value: "urgent", label: "Urgent", desc: "Needed today" },
  { value: "routine", label: "Routine", desc: "Planned / scheduled" },
];

export const NOTIFICATION_FILTERS = [
  { value: "all", label: "All notifications" },
  { value: "unread", label: "Unread only" },
] as const;
