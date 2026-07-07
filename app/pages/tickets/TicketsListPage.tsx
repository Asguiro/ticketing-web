import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { AlertCircle, CheckCircle2, Ticket, UserX } from "lucide-react";

import { PageHeader } from "~/components/shared/PageHeader";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { PageLoadingSkeleton } from "~/components/shared/PageLoadingSkeleton";
import { TicketFilters } from "~/components/tickets/TicketFilters";
import { TicketTable } from "~/components/tickets/TicketTable";
import { isAdmin } from "~/lib/roles";
import { ticketsListLoader } from "~/server/tickets/loaders/ticket.server";
import type { TicketStatus } from "~/types/ticket";

export async function loader(args: LoaderFunctionArgs) {
  return ticketsListLoader(args);
}

function isResolvedStatus(status: TicketStatus): boolean {
  return status === "RESOLVED" || status === "CLOSED";
}

export default function TicketsListPage() {
  const { user, tickets, filters, agents, pagination } = useLoaderData<typeof loader>();
  const adminView = isAdmin(user.role);

  const resolvedCount = tickets.filter((ticket) =>
    isResolvedStatus(ticket.status),
  ).length;
  const unassignedCount = tickets.filter((ticket) => !ticket.assignedAgentId).length;
  const inProgressCount = tickets.length - resolvedCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description={
          adminView
            ? "Vue globale de tous les tickets : statut, agent assigné et résolution."
            : "Liste des tickets avec filtres et tri."
        }
      />

      {adminView ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="stat rounded-box bg-base-100 shadow-md">
            <div className="stat-figure text-primary">
              <Ticket className="size-6" />
            </div>
            <div className="stat-title">Total</div>
            <div className="stat-value text-2xl">{pagination.total}</div>
            <div className="stat-desc">tickets au total</div>
          </div>
          <div className="stat rounded-box bg-base-100 shadow-md">
            <div className="stat-figure text-warning">
              <AlertCircle className="size-6" />
            </div>
            <div className="stat-title">En cours</div>
            <div className="stat-value text-2xl text-warning">{inProgressCount}</div>
            <div className="stat-desc">sur cette page</div>
          </div>
          <div className="stat rounded-box bg-base-100 shadow-md">
            <div className="stat-figure text-success">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="stat-title">Résolus</div>
            <div className="stat-value text-2xl text-success">{resolvedCount}</div>
            <div className="stat-desc">sur cette page</div>
          </div>
          <div className="stat rounded-box bg-base-100 shadow-md">
            <div className="stat-figure text-warning">
              <UserX className="size-6" />
            </div>
            <div className="stat-title">Non assignés</div>
            <div className="stat-value text-2xl">{unassignedCount}</div>
            <div className="stat-desc">sur cette page</div>
          </div>
        </div>
      ) : null}

      <TicketFilters user={user} filters={filters} agents={agents} />
      <TicketTable tickets={tickets} user={user} pagination={pagination} />
    </div>
  );
}

export function HydrateFallback() {
  return <PageLoadingSkeleton variant="table" />;
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
