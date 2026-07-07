import type { ActionFunctionArgs } from "react-router";
import { data, redirect } from "react-router";

import { ApiError, getErrorMessage } from "~/server/api/api-client.server";
import {
  createUser,
  deleteUser,
  updateUser,
} from "~/server/api/user-api.server";
import {
  mergeSetCookieHeaders,
  requireAuthWithCookie,
  withAuthenticatedApi,
} from "~/server/auth/require-auth.server";
import {
  parseCreateUserFormData,
  parseUsersListFormData,
} from "~/server/users/schema/user.schema";

export async function createUserAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const parsed = parseCreateUserFormData(formData);

  if (!parsed.success) {
    return data({ ok: false as const, errors: parsed.errors }, { status: 422 });
  }

  try {
    const { setCookie } = await withAuthenticatedApi(request, ["ADMIN"], (token) =>
      createUser(token, parsed.data),
    );

    return redirect("/users", {
      headers: mergeSetCookieHeaders(undefined, setCookie),
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    return data(
      {
        ok: false as const,
        error: getErrorMessage(error, "Impossible de créer l'utilisateur."),
      },
      { status: error instanceof ApiError ? error.status : 500 },
    );
  }
}

export async function usersListAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const parsed = parseUsersListFormData(formData);

  if (!parsed.success) {
    return data({ ok: false as const, errors: parsed.errors }, { status: 422 });
  }

  const authResult = await requireAuthWithCookie(request, ["ADMIN"]);
  const currentUserId = authResult.session.user.id;

  if (
    parsed.data.intent === "delete_user" &&
    parsed.data.userId === currentUserId
  ) {
    return data(
      {
        ok: false as const,
        error: "Vous ne pouvez pas supprimer votre propre compte.",
      },
      { status: 400 },
    );
  }

  try {
    let setCookie = authResult.setCookie;

    if (parsed.data.intent === "update_user") {
      const { email, role, password, userId } = parsed.data;
      const result = await withAuthenticatedApi(request, ["ADMIN"], (token) =>
        updateUser(token, userId, { email, role, ...(password ? { password } : {}) }),
      );
      setCookie = result.setCookie ?? setCookie;

      return data(
        { ok: true as const, intent: parsed.data.intent },
        { headers: mergeSetCookieHeaders(undefined, setCookie) },
      );
    }

    const result = await withAuthenticatedApi(request, ["ADMIN"], (token) =>
      deleteUser(token, parsed.data.userId),
    );
    setCookie = result.setCookie ?? setCookie;

    return data(
      { ok: true as const, intent: parsed.data.intent },
      { headers: mergeSetCookieHeaders(undefined, setCookie) },
    );
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const defaultMessage =
      parsed.data.intent === "delete_user"
        ? "Impossible de supprimer l'utilisateur."
        : "Impossible de modifier l'utilisateur.";

    return data(
      {
        ok: false as const,
        error: getErrorMessage(error, defaultMessage),
      },
      { status: error instanceof ApiError ? error.status : 500 },
    );
  }
}
