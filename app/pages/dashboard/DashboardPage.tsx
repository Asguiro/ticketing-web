import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { Plus } from "lucide-react";

import { StatsCard } from "~/components/dashboard/StatsCard";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { PageHeader } from "~/components/shared/PageHeader";
import { PageLoadingSkeleton } from "~/components/shared/PageLoadingSkeleton";
import { isAdmin, isAgent, isClient } from "~/lib/roles";
import { dashboardLoader } from "~/server/dashboard/loaders/dashboard.server";

export async function loader(args: LoaderFunctionArgs) {
  return dashboardLoader(args);
}

export default function DashboardPage() {
  const { user, stats } = useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader
        title="Business Dashboard"
        description="Vue d'ensemble de l'activité selon votre rôle."
        actions={
          isClient(user.role) ? (
            <Link to="/tickets/new" className="btn btn-primary">
              <Plus className="size-4" />
              Créer un ticket
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Tickets ouverts" value={stats.openCount} />
        <StatsCard
          label={
            isAgent(user.role)
              ? "Mes tickets en retard"
              : "Tickets en retard"
          }
          value={stats.overdueCount}
          tone="warning"
        />
        <StatsCard
          label="Tickets résolus"
          value={stats.resolvedInPeriodCount}
          tone="success"
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">Activité récente</h2>
            <p className="text-sm text-base-content/60">
              Les flux temps réel arriveront avec l&apos;API backend. En mode
              démo, les mutations restent visibles pendant la session.
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">Répartition</h2>
            <p className="text-sm text-base-content/60">
              {isAdmin(user.role)
                ? "Vue globale administrateur — tous les compteurs."
                : "Vue personnalisée selon vos droits d'accès."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HydrateFallback() {
  return <PageLoadingSkeleton />;
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
