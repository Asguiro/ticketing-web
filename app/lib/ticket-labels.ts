import type { BadgeVariant } from "~/components/ui/Badge";
import type { TicketPriority, TicketStatus } from "~/types/ticket";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
  REOPENED: "Réouvert",
};

export const STATUS_VARIANTS: Record<TicketStatus, BadgeVariant> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
  REOPENED: "accent",
};

export const STATUS_DOT_CLASSES: Record<TicketStatus, string> = {
  OPEN: "bg-info/70",
  IN_PROGRESS: "bg-warning/70",
  RESOLVED: "bg-success/70",
  CLOSED: "bg-base-content/25",
  REOPENED: "bg-accent/70",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
};

export const PRIORITY_VARIANTS: Record<TicketPriority, BadgeVariant> = {
  LOW: "neutral",
  MEDIUM: "warning",
  HIGH: "error",
};

export const PRIORITY_TEXT_CLASSES: Record<TicketPriority, string> = {
  LOW: "text-base-content/60",
  MEDIUM: "text-base-content/75",
  HIGH: "font-medium text-base-content",
};

export const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export const PRIORITY_FILTER_OPTIONS = [
  { value: "", label: "Toutes les priorités" },
  ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
];
