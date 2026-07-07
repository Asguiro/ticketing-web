import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { getErrorMessage } from "~/server/api/api-client.server";
import { logout as logoutApi } from "~/server/api/auth-api.server";
import { getAuthSession } from "~/server/auth/require-auth.server";
import {
  commitSession,
  destroySession,
  getSession,
} from "~/server/auth/session.server";

export async function logoutAction({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const auth = await getAuthSession(request);

  if (auth) {
    try {
      await logoutApi(auth.accessToken, auth.refreshToken);
    } catch (error) {
      console.warn("[logout] API logout failed:", getErrorMessage(error, ""));
    }
  }

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
