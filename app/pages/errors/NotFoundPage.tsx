import { RouteErrorFallback } from "~/components/shared/RouteErrorFallback";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <RouteErrorFallback
        title="404"
        message="La page demandée est introuvable."
        status={404}
        homeTo="/dashboard"
      />
    </div>
  );
}
