import { ROLE_LABELS } from "~/lib/roles";
import type { Role } from "~/types/user";

type RoleBadgeProps = {
  role: Role;
};

const ROLE_BADGE_CLASSES: Record<Role, string> = {
  CLIENT: "badge-info",
  AGENT: "badge-secondary",
  ADMIN: "badge-primary",
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span className={`badge ${ROLE_BADGE_CLASSES[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}
