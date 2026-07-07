import type { TicketStatus } from "~/types/ticket";

import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "~/lib/ticket-labels";

type StatusBadgeProps = {
  status: TicketStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge ${STATUS_BADGE_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
