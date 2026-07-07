import { data, isRouteErrorResponse, redirect } from "react-router";

import {
  ApiError,
  AuthError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  ServerError,
  getErrorMessage,
} from "~/lib/api-errors.server";

export type RouteErrorPayload = {
  title: string;
  message: string;
  status: number;
  retry?: boolean;
};

export function throwRouteError(payload: RouteErrorPayload): never {
  throw data(payload, { status: payload.status });
}

export function throwForbidden(
  message = "Vous n'avez pas l'autorisation d'accéder à cette ressource.",
): never {
  throwRouteError({
    title: "403",
    message,
    status: 403,
  });
}

export function throwNotFound(
  message = "La ressource demandée est introuvable.",
): never {
  throwRouteError({
    title: "404",
    message,
    status: 404,
  });
}

export function throwServerUnavailable(
  message = "Le service est temporairement indisponible. Réessayez dans quelques instants.",
): never {
  throwRouteError({
    title: "503",
    message,
    status: 503,
    retry: true,
  });
}

export function throwOffline(
  message = "Connexion au serveur impossible. Vérifiez votre réseau ou réessayez plus tard.",
): never {
  throwRouteError({
    title: "Hors ligne",
    message,
    status: 503,
    retry: true,
  });
}

function isDataWithResponseInit(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type: string }).type === "DataWithResponseInit"
  );
}

export function handleLoaderError(error: unknown): never {
  if (
    error instanceof Response ||
    isRouteErrorResponse(error) ||
    isDataWithResponseInit(error)
  ) {
    throw error;
  }

  if (error instanceof AuthError) {
    throw redirect("/login");
  }

  if (error instanceof ForbiddenError) {
    throwForbidden(getErrorMessage(error, "Accès refusé."));
  }

  if (error instanceof NotFoundError) {
    throwNotFound(getErrorMessage(error, "Ressource introuvable."));
  }

  if (error instanceof NetworkError) {
    throwOffline(error.message);
  }

  if (error instanceof ServerError) {
    throwServerUnavailable(getErrorMessage(error, "Service indisponible."));
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      throw redirect("/login");
    }
    if (error.status === 403) {
      throwForbidden(getErrorMessage(error, "Accès refusé."));
    }
    if (error.status === 404) {
      throwNotFound(getErrorMessage(error, "Ressource introuvable."));
    }
    if (error.status >= 500) {
      throwServerUnavailable(getErrorMessage(error, "Service indisponible."));
    }

    throwRouteError({
      title: String(error.status),
      message: getErrorMessage(error, "Une erreur est survenue."),
      status: error.status,
    });
  }

  console.error("[loader] unexpected error", error);
  throwServerUnavailable("Une erreur inattendue est survenue.");
}

export async function safeLoaderCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    return handleLoaderError(error);
  }
}
