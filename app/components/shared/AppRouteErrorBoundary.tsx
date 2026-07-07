import {
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

import { RouteErrorFallback } from "~/components/shared/RouteErrorFallback";
import type { RouteErrorPayload } from "~/server/lib/loader-utils.server";

function parseRouteError(error: unknown): {
  title: string;
  message: string;
  status?: number;
  showRetry?: boolean;
  showHome?: boolean;
} {
  if (isRouteErrorResponse(error)) {
    const data = error.data as RouteErrorPayload | string | undefined;

    if (typeof data === "object" && data !== null && "message" in data) {
      return {
        title: data.title ?? String(error.status),
        message: data.message,
        status: error.status,
        showRetry: data.retry,
        showHome: error.status !== 401,
      };
    }

    return {
      title: String(error.status),
      message:
        typeof data === "string"
          ? data
          : error.statusText || "Une erreur est survenue.",
      status: error.status,
      showRetry: error.status >= 500,
      showHome: error.status !== 401,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Erreur",
      message: error.message || "Une erreur inattendue est survenue.",
      showRetry: true,
    };
  }

  return {
    title: "Erreur",
    message: "Une erreur inattendue est survenue.",
    showRetry: true,
  };
}

export function AppRouteErrorBoundary() {
  const error = useRouteError();
  const parsed = parseRouteError(error);

  if (parsed.status === 401) {
    return (
      <RouteErrorFallback
        title="401"
        message="Votre session a expiré. Veuillez vous reconnecter."
        status={401}
        showHome={false}
        homeTo="/login"
        homeLabel="Se connecter"
      />
    );
  }

  return (
    <RouteErrorFallback
      title={parsed.title}
      message={parsed.message}
      status={parsed.status}
      showRetry={parsed.showRetry}
      showHome={parsed.showHome}
      homeTo={parsed.status === 404 ? "/dashboard" : "/dashboard"}
    />
  );
}
