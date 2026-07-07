import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";

import { isMockApiEnabled } from "~/lib/env.server";
import { getDashboardStats } from "~/server/api/dashboard-api.server";
import {
  mergeSetCookieHeaders,
  withAuthenticatedApi,
} from "~/server/auth/require-auth.server";
import { safeLoaderCall } from "~/server/lib/loader-utils.server";

export async function dashboardLoader({ request }: LoaderFunctionArgs) {
  return safeLoaderCall(async () => {
    const { data: stats, session, setCookie } = await withAuthenticatedApi(
      request,
      ["CLIENT", "AGENT", "ADMIN"],
      (accessToken) => getDashboardStats(accessToken),
    );

    return data(
      {
        user: session.user,
        stats,
      },
      {
        headers: mergeSetCookieHeaders(undefined, setCookie),
      },
    );
  });
}

export async function dashboardLayoutLoader({ request }: LoaderFunctionArgs) {
  return safeLoaderCall(async () => {
    const { session } = await withAuthenticatedApi(
      request,
      ["CLIENT", "AGENT", "ADMIN"],
      async () => null,
    );

    return data({
      user: session.user,
      isMockMode: isMockApiEnabled(),
    });
  });
}
