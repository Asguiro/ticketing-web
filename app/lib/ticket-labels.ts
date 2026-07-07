import type { TicketPriority, TicketStatus } from "~/types/ticket";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
  REOPENED: "Réouvert",
};

export const STATUS_BADGE_CLASSES: Record<TicketStatus, string> = {
  OPEN: "badge-info",
  IN_PROGRESS: "badge-warning",
  RESOLVED: "badge-success",
  CLOSED: "badge-neutral",
  REOPENED: "badge-accent",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
};

export const PRIORITY_BADGE_CLASSES: Record<TicketPriority, string> = {
  LOW: "badge-neutral",
  MEDIUM: "badge-warning",
  HIGH: "badge-error",
};

export const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export const PRIORITY_FILTER_OPTIONS = [
  { value: "", label: "Toutes les priorités" },
  ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
];
