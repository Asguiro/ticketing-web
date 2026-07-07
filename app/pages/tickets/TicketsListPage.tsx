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
    <div className="page-stack">
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
          <div className="stat stat-card">
            <div className="stat-figure text-primary">
              <Ticket className="size-6" />
            </div>
            <div className="text-stat-label">Total</div>
            <div className="text-stat-value text-base-content">{pagination.total}</div>
            <div className="stat-card-desc">tickets au total</div>
          </div>
          <div className="stat stat-card">
            <div className="stat-figure text-warning">
              <AlertCircle className="size-6" />
            </div>
            <div className="text-stat-label">En cours</div>
            <div className="text-stat-value text-warning">{inProgressCount}</div>
            <div className="stat-card-desc">sur cette page</div>
          </div>
          <div className="stat stat-card">
            <div className="stat-figure text-success">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="text-stat-label">Résolus</div>
            <div className="text-stat-value text-success">{resolvedCount}</div>
            <div className="stat-card-desc">sur cette page</div>
          </div>
          <div className="stat stat-card">
            <div className="stat-figure text-base-content/40">
              <UserX className="size-6" />
            </div>
            <div className="text-stat-label">Non assignés</div>
            <div className="text-stat-value text-base-content">{unassignedCount}</div>
            <div className="stat-card-desc">sur cette page</div>
          </div>
        </div>
      ) : null}

      <TicketTable
        tickets={tickets}
        user={user}
        pagination={pagination}
        toolbar={
          <TicketFilters
            user={user}
            filters={filters}
            agents={agents}
            embedded
          />
        }
      />
    </div>
  );
}

export function HydrateFallback() {
  return <PageLoadingSkeleton variant="table" />;
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
