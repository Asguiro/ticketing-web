import type { LucideIcon } from "lucide-react";
import {
  Archive,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
} from "lucide-react";

import { STATUS_LABELS } from "~/lib/ticket-labels";
import type { TicketStatus } from "~/types/ticket";

export type StatusTransitionMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  iconBgClass: string;
  buttonClass: string;
};

export const STATUS_TRANSITION_META: Partial<
  Record<TicketStatus, StatusTransitionMeta>
> = {
  IN_PROGRESS: {
    label: STATUS_LABELS.IN_PROGRESS,
    description: "Démarrer le traitement et informer le client.",
    icon: PlayCircle,
    accentClass: "border-warning/30 bg-warning/5",
    iconBgClass: "bg-warning/15 text-warning",
    buttonClass: "btn-warning",
  },
  RESOLVED: {
    label: STATUS_LABELS.RESOLVED,
    description: "Le problème est corrigé, en attente de clôture.",
    icon: CheckCircle2,
    accentClass: "border-success/30 bg-success/5",
    iconBgClass: "bg-success/15 text-success",
    buttonClass: "btn-success",
  },
  CLOSED: {
    label: STATUS_LABELS.CLOSED,
    description: "Clôturer définitivement ce ticket.",
    icon: Archive,
    accentClass: "border-base-300 bg-base-200/50",
    iconBgClass: "bg-base-300/60 text-base-content/70",
    buttonClass: "btn-neutral",
  },
  REOPENED: {
    label: STATUS_LABELS.REOPENED,
    description: "Rouvrir pour une nouvelle intervention.",
    icon: RotateCcw,
    accentClass: "border-accent/30 bg-accent/5",
    iconBgClass: "bg-accent/15 text-accent",
    buttonClass: "btn-accent",
  },
};

export const WORKFLOW_STEPS: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export const WORKFLOW_STEP_COLORS: Record<TicketStatus, string> = {
  OPEN: "bg-info",
  IN_PROGRESS: "bg-warning",
  RESOLVED: "bg-success",
  CLOSED: "bg-neutral",
  REOPENED: "bg-accent",
};

export function getWorkflowStepState(
  step: TicketStatus,
  currentStatus: TicketStatus,
): "completed" | "current" | "upcoming" {
  if (currentStatus === "REOPENED") {
    if (step === "OPEN" || step === "IN_PROGRESS") return "completed";
    if (step === "RESOLVED") return "current";
    return "upcoming";
  }

  const stepIndex = WORKFLOW_STEPS.indexOf(step);
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStatus);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}

export function getTransitionMeta(status: TicketStatus): StatusTransitionMeta {
  return (
    STATUS_TRANSITION_META[status] ?? {
      label: STATUS_LABELS[status],
      description: `Passer au statut « ${STATUS_LABELS[status]} ».`,
      icon: PlayCircle,
      accentClass: "border-primary/30 bg-primary/5",
      iconBgClass: "bg-primary/15 text-primary",
      buttonClass: "btn-primary",
    }
  );
}
