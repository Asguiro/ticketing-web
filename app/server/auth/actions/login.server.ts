import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";

import { isMockApiEnabled } from "~/lib/env.server";
import { ApiError, getErrorMessage } from "~/server/api/api-client.server";
import { getMockDemoAccounts } from "~/server/mock/router.server";
import { login as loginApi } from "~/server/api/auth-api.server";
import { redirectAfterLogin } from "~/server/auth/redirect.server";
import { requireGuest } from "~/server/auth/require-auth.server";
import {
  commitSession,
  createUserSession,
  getSession,
} from "~/server/auth/session.server";

export async function loginLoader({ request }: LoaderFunctionArgs) {
  await requireGuest(request);
  const session = await getSession(request.headers.get("Cookie"));
  const error = session.get("error");

  return data(
    {
      error,
      isMockMode: isMockApiEnabled(),
      demoAccounts: isMockApiEnabled() ? getMockDemoAccounts() : [],
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
}

export async function loginAction({ request }: ActionFunctionArgs) {
  await requireGuest(request);
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    session.flash("error", "Email et mot de passe requis.");
    return data(
      { error: "Email et mot de passe requis." },
      {
        status: 400,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }

  try {
    const { accessToken, refreshToken, user } = await loginApi(email, password);
    const userSession = await createUserSession(
      accessToken,
      refreshToken,
      user,
    );

    return redirectAfterLogin(user.role, {
      headers: {
        "Set-Cookie": await commitSession(userSession),
      },
    });
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Identifiants invalides. Veuillez réessayer.",
    );

    session.flash("error", message);

    return data(
      { error: message },
      {
        status: error instanceof ApiError ? error.status : 400,
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  }
}
