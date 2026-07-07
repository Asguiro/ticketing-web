import { RouteErrorFallback } from "~/components/shared/RouteErrorFallback";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <RouteErrorFallback
        title="403"
        message="Vous n'avez pas l'autorisation d'accéder à cette ressource."
        status={403}
        homeTo="/dashboard"
      />
    </div>
  );
}
