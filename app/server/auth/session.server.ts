import { createCookieSessionStorage } from "react-router";

import type { SessionUser } from "~/types/user";

type SessionData = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

type SessionFlashData = {
  error: string;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return secret ?? "dev-secret-change-me";
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secrets: [getSessionSecret()],
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    },
  });

export { commitSession, destroySession, getSession };

export async function createUserSession(
  accessToken: string,
  refreshToken: string,
  user: SessionUser,
) {
  const session = await getSession();
  session.set("accessToken", accessToken);
  session.set("refreshToken", refreshToken);
  session.set("user", user);
  return session;
}

export async function updateSessionTokens(
  accessToken: string,
  refreshToken: string,
  user?: SessionUser,
) {
  const session = await getSession();
  session.set("accessToken", accessToken);
  session.set("refreshToken", refreshToken);
  if (user) {
    session.set("user", user);
  }
  return session;
}
