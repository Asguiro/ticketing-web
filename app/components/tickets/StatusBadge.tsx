import type { TicketStatus } from "~/types/ticket";

import { Badge } from "~/components/ui/Badge";
import {
  STATUS_DOT_CLASSES,
  STATUS_LABELS,
  STATUS_VARIANTS,
} from "~/lib/ticket-labels";

type StatusBadgeProps = {
  status: TicketStatus;
  variant?: "default" | "subtle" | "outline" | "pill";
};

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const label = STATUS_LABELS[status];
  const badgeVariant = STATUS_VARIANTS[status];

  if (variant === "pill") {
    return <Badge variant={badgeVariant}>{label}</Badge>;
  }

  if (variant === "subtle") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-base-content/80">
        <span
          className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASSES[status]}`}
          aria-hidden
        />
        {label}
      </span>
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
