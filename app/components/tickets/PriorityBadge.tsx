import type { TicketPriority } from "~/types/ticket";

import { Badge } from "~/components/ui/Badge";
import {
  PRIORITY_LABELS,
  PRIORITY_TEXT_CLASSES,
  PRIORITY_VARIANTS,
} from "~/lib/ticket-labels";

type PriorityBadgeProps = {
  priority: TicketPriority;
  variant?: "default" | "subtle" | "outline" | "pill";
};

export function PriorityBadge({ priority, variant = "default" }: PriorityBadgeProps) {
  const label = PRIORITY_LABELS[priority];
  const badgeVariant = PRIORITY_VARIANTS[priority];

  if (variant === "pill") {
    return <Badge variant={badgeVariant}>{label}</Badge>;
  }

  if (variant === "subtle") {
    return (
      <span className={`text-sm ${PRIORITY_TEXT_CLASSES[priority]}`}>{label}</span>
    );
  }

  if (variant === "outline") {
    return (
      <Badge variant={badgeVariant} appearance="outline">
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant={badgeVariant} appearance="solid">
      {label}
    </Badge>
  );
}
