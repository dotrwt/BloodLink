import type { Role } from "./types";

const KEY = "bloodlink.role";

export function setRole(role: Role) {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    /* ignore */
  }
}

export function getRole(): Role {
  try {
    const r = localStorage.getItem(KEY) as Role | null;
    if (r === "donor" || r === "requester" || r === "bank") return r;
  } catch {
    /* ignore */
  }
  return "requester";
}
