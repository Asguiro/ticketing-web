import { Link } from "react-router";

export type RouteErrorFallbackProps = {
  title: string;
  message: string;
  status?: number;
  showRetry?: boolean;
  showHome?: boolean;
  homeTo?: string;
  homeLabel?: string;
};

export function RouteErrorFallback({
  title,
  message,
  status,
  showRetry = false,
  showHome = true,
  homeTo = "/dashboard",
  homeLabel = "Retour au dashboard",
}: RouteErrorFallbackProps) {
  const isOffline = status === 503 || title.toLowerCase().includes("hors ligne");

  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      style={{ padding: "var(--msk-space-8) var(--msk-space-4)" }}
    >
      <div className="glass-panel w-full max-w-lg text-center" style={{ padding: "var(--msk-space-8)" }}>
        <div
          className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${
            isOffline
              ? "bg-warning/15 text-warning"
              : status === 403
                ? "bg-error/15 text-error"
                : "bg-base-300 text-base-content/60"
          }`}
        >
          <span className="text-stat-value">{status ?? "!"}</span>
        </div>

        <h1 className="text-page-title text-base-content">
          {status === 403
            ? "Accès refusé"
            : status === 404
              ? "Page introuvable"
              : isOffline
                ? "Service indisponible"
                : title}
        </h1>

        <p className="mt-3 text-page-desc">{message}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {showRetry ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </button>
          ) : null}

          {showHome ? (
            <Link to={homeTo} className="btn btn-outline btn-sm">
              {homeLabel}
            </Link>
          ) : null}

          {status === 403 ? (
            <Link to="/login" className="btn btn-ghost btn-sm">
              Se reconnecter
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
