import type { ApiErrorBody } from "~/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class AuthError extends ApiError {
  constructor(body?: unknown, message = "Session expirée") {
    super(401, body, message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(body?: unknown, message = "Accès refusé") {
    super(403, body, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(body?: unknown, message = "Ressource introuvable") {
    super(404, body, message);
    this.name = "NotFoundError";
  }
}

export class NetworkError extends Error {
  readonly cause?: unknown;

  constructor(message = "Impossible de joindre le serveur", cause?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export class ServerError extends ApiError {
  constructor(body?: unknown, message = "Le service est temporairement indisponible") {
    super(503, body, message);
    this.name = "ServerError";
  }
}

export function parseApiErrorMessage(body: unknown, fallback: string): string {
  if (!body) return fallback;

  if (typeof body === "string") {
    return body;
  }

  if (typeof body === "object" && body !== null) {
    const record = body as ApiErrorBody & { message?: string | string[] };

    if (Array.isArray(record.message) && record.message.length > 0) {
      return record.message[0];
    }

    if (typeof record.message === "string" && record.message.length > 0) {
      return record.message;
    }

    if (record.errors?.[0]?.message) {
      return record.errors[0].message;
    }
  }

  return fallback;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof NetworkError) {
    return error.message;
  }

  if (error instanceof ApiError) {
    return parseApiErrorMessage(error.body, error.message || fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function classifyFetchError(status: number, body: unknown): ApiError {
  if (status === 401) {
    return new AuthError(body);
  }
  if (status === 403) {
    return new ForbiddenError(body);
  }
  if (status === 404) {
    return new NotFoundError(body);
  }
  if (status >= 500) {
    return new ServerError(body);
  }
  return new ApiError(status, body);
}
