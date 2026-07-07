import { RouteErrorFallback } from "~/components/shared/RouteErrorFallback";

export default function ServerErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <RouteErrorFallback
        title="503"
        message="Le service est temporairement indisponible. Réessayez dans quelques instants."
        status={503}
        showRetry
        homeTo="/dashboard"
      />
    </div>
  );
}
