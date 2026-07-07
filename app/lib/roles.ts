import type { Role } from "~/types/user";

type AllowedRole = Role | Lowercase<Role>;

export function normalizeRole(role: string): Role {
  return role.toUpperCase() as Role;
}

export function hasRole(userRole: Role, ...allowed: AllowedRole[]): boolean {
  const normalized = normalizeRole(userRole);
  return allowed.some((role) => normalizeRole(role) === normalized);
}

export function isClient(role: Role): boolean {
  return hasRole(role, "CLIENT");
}

export function isAgent(role: Role): boolean {
  return hasRole(role, "AGENT");
}

export function isAdmin(role: Role): boolean {
  return hasRole(role, "ADMIN");
}

export const ROLE_LABELS: Record<Role, string> = {
  CLIENT: "Client",
  AGENT: "Agent",
  ADMIN: "Administrateur",
};
