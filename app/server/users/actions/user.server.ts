import type { ActionFunctionArgs } from "react-router";
import { data, redirect } from "react-router";

import { ApiError, getErrorMessage } from "~/server/api/api-client.server";
import { createUser } from "~/server/api/user-api.server";
import {
  mergeSetCookieHeaders,
  withAuthenticatedApi,
} from "~/server/auth/require-auth.server";
import { parseCreateUserFormData } from "~/server/users/schema/user.schema";

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
