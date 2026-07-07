import type { TicketPriority } from "~/types/ticket";

import { PRIORITY_BADGE_CLASSES, PRIORITY_LABELS } from "~/lib/ticket-labels";

type PriorityBadgeProps = {
  priority: TicketPriority;
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`badge ${PRIORITY_BADGE_CLASSES[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
