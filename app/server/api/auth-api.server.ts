import { apiRequest } from "../api/api-client.server";

import type { SessionUser } from "~/types/user";

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export function login(email: string, password: string) {
  return apiRequest<AuthTokensResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function refreshTokens(refreshToken: string) {
  return apiRequest<AuthTokensResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export function logout(accessToken: string, refreshToken: string) {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    accessToken,
    body: { refreshToken },
  });
}

export function getMe(accessToken: string) {
  return apiRequest<SessionUser>("/auth/me", {
    method: "GET",
    accessToken,
  });
}
