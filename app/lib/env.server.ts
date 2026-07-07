/** Active les données mock uniquement si MOCK_API=true. */
export function isMockApiEnabled(): boolean {
  return process.env.MOCK_API === "true";
}

export function getApiBaseUrl(): string {
  return process.env.API_URL ?? "http://localhost:3000/api/v1";
}

/** Namespace Socket.IO sur l'origine API (sans `/api/v1`). */
export function getWsBaseUrl(): string {
  const apiUrl = getApiBaseUrl();
  const url = new URL(apiUrl);
  return `${url.origin}/chat`;
}
