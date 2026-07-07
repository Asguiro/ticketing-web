import type { TicketStatus } from "~/types/ticket";

/** Transitions globales autorisées par l'API. */
export const ALLOWED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  REOPENED: ["IN_PROGRESS"],
  CLOSED: [],
};

/** Transitions qu'un agent assigné peut déclencher manuellement. */
export const AGENT_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  REOPENED: ["IN_PROGRESS"],
  RESOLVED: [],
  CLOSED: [],
};

export function getAdminAllowedTargets(from: TicketStatus): TicketStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[from] ?? [];
}

export function getAgentAllowedTargets(from: TicketStatus): TicketStatus[] {
  return AGENT_STATUS_TRANSITIONS[from] ?? [];
}
