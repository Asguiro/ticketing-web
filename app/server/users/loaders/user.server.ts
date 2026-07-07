import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";

import { getUsers } from "~/server/api/user-api.server";
import {
  mergeSetCookieHeaders,
  withAuthenticatedApi,
} from "~/server/auth/require-auth.server";
import { safeLoaderCall } from "~/server/lib/loader-utils.server";
import type { Role } from "~/types/user";

function parseRoleFilter(url: URL): Role | undefined {
  const role = url.searchParams.get("role");
  if (role === "CLIENT" || role === "AGENT" || role === "ADMIN") {
    return role;
  }
  return undefined;
}

export async function usersListLoader({ request }: LoaderFunctionArgs) {
  return safeLoaderCall(async () => {
    const url = new URL(request.url);
    const role = parseRoleFilter(url);
    const page = Number(url.searchParams.get("page") ?? 1);

    const { data: result, session, setCookie } = await withAuthenticatedApi(
      request,
      ["ADMIN"],
      (token) => getUsers(token, { role, page }),
    );

    return data(
      {
        user: session.user,
        users: result.items,
        pagination: result.pagination,
        filters: { role },
      },
      {
        headers: mergeSetCookieHeaders(undefined, setCookie),
      },
    );
  });
}

export async function newUserLoader({ request }: LoaderFunctionArgs) {
  return safeLoaderCall(async () => {
    const { session } = await withAuthenticatedApi(request, ["ADMIN"], async () => null);

    return data({
      user: session.user,
    });
  });
}
