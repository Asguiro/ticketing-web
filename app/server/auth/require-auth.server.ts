import { redirect } from "react-router";

import { AuthError } from "~/lib/api-errors.server";
import { hasRole } from "~/lib/roles";
import { refreshTokens } from "~/server/api/auth-api.server";
import {
  commitSession,
  getSession,
  updateSessionTokens,
} from "~/server/auth/session.server";
import type { Role } from "~/types/user";

import { throwForbidden } from "~/server/lib/loader-utils.server";

import type { SessionUser } from "~/types/user";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type AuthResult = {
  session: AuthSession;
  setCookie?: string;
};

export async function getAuthSession(
  request: Request,
): Promise<AuthSession | null> {
  const cookieSession = await getSession(request.headers.get("Cookie"));
  const accessToken = cookieSession.get("accessToken");
  const refreshToken = cookieSession.get("refreshToken");
  const user = cookieSession.get("user");

  if (!accessToken || !refreshToken || !user) {
    return null;
  }

  return { accessToken, refreshToken, user };
}

export async function tryRefreshSession(
  request: Request,
): Promise<AuthResult | null> {
  const cookieSession = await getSession(request.headers.get("Cookie"));
  const refreshToken = cookieSession.get("refreshToken");

  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await refreshTokens(refreshToken);
    const updated = await updateSessionTokens(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.user,
    );

    return {
      session: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: tokens.user,
      },
      setCookie: await commitSession(updated),
    };
  } catch {
    return null;
  }
}

export async function requireAuth(
  request: Request,
  allowedRoles?: Role[],
): Promise<AuthSession> {
  const result = await requireAuthWithCookie(request, allowedRoles);
  return result.session;
}

export async function requireAuthWithCookie(
  request: Request,
  allowedRoles?: Role[],
): Promise<AuthResult> {
  let auth = await getAuthSession(request);

  if (!auth) {
    throw redirect("/login");
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !hasRole(auth.user.role, ...allowedRoles)
  ) {
    throwForbidden(
      "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
    );
  }

  return { session: auth };
}

export async function requireGuest(request: Request): Promise<void> {
  const auth = await getAuthSession(request);
  if (auth) {
    throw redirect("/dashboard");
  }
}

/**
 * Exécute un appel API authentifié avec retry automatique après refresh 401.
 */
export async function withAuthenticatedApi<T>(
  request: Request,
  allowedRoles: Role[] | undefined,
  call: (accessToken: string) => Promise<T>,
): Promise<{ data: T; session: AuthSession; setCookie?: string }> {
  const authResult = await requireAuthWithCookie(request, allowedRoles);
  let accessToken = authResult.session.accessToken;
  let setCookie = authResult.setCookie;
  let session = authResult.session;

  try {
    const data = await call(accessToken);
    return { data, session, setCookie };
  } catch (error) {
    if (!(error instanceof AuthError)) {
      throw error;
    }

    const refreshed = await tryRefreshSession(request);
    if (!refreshed) {
      throw redirect("/login");
    }

    accessToken = refreshed.session.accessToken;
    setCookie = refreshed.setCookie;
    session = refreshed.session;

    const data = await call(accessToken);
    return { data, session, setCookie };
  }
}

export function mergeSetCookieHeaders(
  headers: HeadersInit | undefined,
  setCookie?: string,
): HeadersInit {
  if (!setCookie) {
    return headers ?? {};
  }

  const next = new Headers(headers);
  next.append("Set-Cookie", setCookie);
  return next;
}
