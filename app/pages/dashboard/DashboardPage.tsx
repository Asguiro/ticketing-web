import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { AlertCircle, CheckCircle2, Ticket } from "lucide-react";

import { StatsCard } from "~/components/dashboard/StatsCard";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { PageHeader } from "~/components/shared/PageHeader";
import { PageLoadingSkeleton } from "~/components/shared/PageLoadingSkeleton";
import { PanelSection } from "~/components/shared/PanelSection";
import { isAdmin, isAgent } from "~/lib/roles";
import { dashboardLoader } from "~/server/dashboard/loaders/dashboard.server";

export async function loader(args: LoaderFunctionArgs) {
  return dashboardLoader(args);
}

export default function DashboardPage() {
  const { user, stats } = useLoaderData<typeof loader>();

  return (
    <div className="page-stack">
      <PageHeader
        title="Business Dashboard"
        description="Vue d'ensemble de l'activité selon votre rôle."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Tickets ouverts"
          value={stats.openCount}
          icon={Ticket}
          description="tickets actifs"
        />
        <StatsCard
          label={
            isAgent(user.role) ? "Mes tickets en retard" : "Tickets en retard"
          }
          value={stats.overdueCount}
          tone="warning"
          icon={AlertCircle}
          description="dépassement SLA"
        />
        <StatsCard
          label="Tickets résolus"
          value={stats.resolvedInPeriodCount}
          tone="success"
          icon={CheckCircle2}
          description="sur la période"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelSection title="Activité récente">
          <p className="text-page-desc">
            Les flux temps réel arriveront avec l&apos;API backend. En mode démo,
            les mutations restent visibles pendant la session.
          </p>
        </PanelSection>
        <PanelSection title="Répartition">
          <p className="text-page-desc">
            {isAdmin(user.role)
              ? "Vue globale administrateur — tous les compteurs."
              : "Vue personnalisée selon vos droits d'accès."}
          </p>
        </PanelSection>
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
