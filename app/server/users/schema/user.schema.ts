import type { Role } from "~/types/user";

import type { FieldErrors } from "~/server/tickets/schema/ticket.schema";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors };

const ROLES: Role[] = ["CLIENT", "AGENT", "ADMIN"];

export function parseCreateUserFormData(formData: FormData): ParseResult<{
  email: string;
  password: string;
  role: Role;
}> {
  const errors: FieldErrors = {};

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "").trim() as Role;

  if (!email) errors.email = "Email requis.";
  if (!password) errors.password = "Mot de passe requis.";
  if (!ROLES.includes(role)) errors.role = "Rôle invalide.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: { email, password, role },
  };
}
