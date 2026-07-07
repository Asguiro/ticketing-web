import { getApiBaseUrl, isMockApiEnabled } from "~/lib/env.server";
import {
  ApiError,
  NetworkError,
  classifyFetchError,
} from "~/lib/api-errors.server";
import { mockApiRequest } from "~/server/mock/router.server";

export { ApiError, getErrorMessage } from "~/lib/api-errors.server";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  accessToken?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15_000;

function buildUrl(
  path: string,
  params?: ApiRequestOptions["params"],
): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function createTimeoutSignal(
  timeoutMs: number,
  parentSignal?: AbortSignal,
): AbortSignal {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(new Error("timeout"));
  }, timeoutMs);

  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort(parentSignal.reason);
    } else {
      parentSignal.addEventListener(
        "abort",
        () => controller.abort(parentSignal.reason),
        { once: true },
      );
    }
  }

  controller.signal.addEventListener(
    "abort",
    () => clearTimeout(timeoutId),
    { once: true },
  );

  return controller.signal;
}

function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch failed") ||
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("enotfound") ||
      message.includes("timeout") ||
      message.includes("aborted")
    );
  }

  return false;
}

async function realApiRequest<T>(
  path: string,
  options: ApiRequestOptions,
): Promise<T> {
  const { method = "GET", accessToken, body, params, signal, timeoutMs } =
    options;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const init: RequestInit = {
    method,
    headers,
    signal: createTimeoutSignal(timeoutMs ?? DEFAULT_TIMEOUT_MS, signal),
  };

  if (body !== undefined && method !== "GET") {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, params), init);
  } catch (error) {
    if (isNetworkFailure(error)) {
      throw new NetworkError(
        "Impossible de joindre le serveur. Vérifiez que l'API est démarrée et votre connexion réseau.",
        error,
      );
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw classifyFetchError(response.status, payload);
  }

  return payload as T;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (isMockApiEnabled()) {
    return mockApiRequest<T>(path, {
      method: options.method ?? "GET",
      ...options,
    });
  }

  return realApiRequest<T>(path, options);
}

export { isMockApiEnabled };
