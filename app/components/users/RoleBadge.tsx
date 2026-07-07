import { Badge, type BadgeVariant } from "~/components/ui/Badge";
import { ROLE_LABELS } from "~/lib/roles";
import type { Role } from "~/types/user";

type RoleBadgeProps = {
  role: Role;
  variant?: "default" | "pill";
};

const ROLE_VARIANTS: Record<Role, BadgeVariant> = {
  CLIENT: "info",
  AGENT: "secondary",
  ADMIN: "primary",
};

export function RoleBadge({ role, variant = "default" }: RoleBadgeProps) {
  const label = ROLE_LABELS[role];
  const badgeVariant = ROLE_VARIANTS[role];

  if (variant === "pill") {
    return <Badge variant={badgeVariant}>{label}</Badge>;
  }

  return (
    <Badge variant={badgeVariant} appearance="solid">
      {label}
    </Badge>
  );
}
