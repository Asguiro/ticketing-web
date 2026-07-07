import type { Role } from "~/types/user";

import type { FieldErrors } from "~/server/tickets/schema/ticket.schema";

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors };

const ROLES: Role[] = ["CLIENT", "AGENT", "ADMIN"];

export type UsersListFormData =
  | {
      intent: "update_user";
      userId: string;
      email: string;
      role: Role;
      password?: string;
    }
  | {
      intent: "delete_user";
      userId: string;
    };

export function parseUsersListFormData(
  formData: FormData,
): ParseResult<UsersListFormData> {
  const intent = String(formData.get("intent") ?? "");
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    return { success: false, errors: { userId: "Utilisateur requis." } };
  }

  if (intent === "delete_user") {
    return { success: true, data: { intent, userId } };
  }

  if (intent === "update_user") {
    const errors: FieldErrors = {};
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "").trim() as Role;

    if (!email) {
      errors.email = "Email requis.";
    }
    if (!ROLES.includes(role)) {
      errors.role = "Rôle invalide.";
    }
    if (password && password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        intent,
        userId,
        email,
        role,
        ...(password ? { password } : {}),
      },
    };
  }

  return { success: false, errors: { intent: "Action inconnue." } };
}

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
