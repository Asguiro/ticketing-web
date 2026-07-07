import { Link } from "react-router";
import { CheckCircle2, UserRound } from "lucide-react";

import { OverdueBadge } from "~/components/dashboard/OverdueBadge";
import { Pagination } from "~/components/shared/Pagination";
import { PriorityBadge } from "~/components/tickets/PriorityBadge";
import { StatusBadge } from "~/components/tickets/StatusBadge";
import { formatDateShort } from "~/lib/date-format";
import { isAdmin, isAgent } from "~/lib/roles";
import { formatPersonName } from "~/lib/user-display";
import type { PaginatedResult } from "~/types/api";
import type { Ticket, TicketAuthor, TicketStatus } from "~/types/ticket";
import type { SessionUser } from "~/types/user";

type TicketTableProps = {
  tickets: Ticket[];
  user: SessionUser;
  pagination?: PaginatedResult<Ticket>["pagination"];
};

function isResolvedStatus(status: TicketStatus): boolean {
  return status === "RESOLVED" || status === "CLOSED";
}

function PersonCell({
  person,
  fallbackId,
}: {
  person?: TicketAuthor | null;
  fallbackId: string;
}) {
  if (!person) {
    return <span className="text-base-content/50">{fallbackId}</span>;
  }

  const name = formatPersonName(person);
  const showEmail = name !== person.email;

  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{name}</p>
      {showEmail ? (
        <p className="truncate text-xs text-base-content/50">{person.email}</p>
      ) : null}
    </div>
  );
}

function ResolutionCell({ ticket }: { ticket: Ticket }) {
  if (isResolvedStatus(ticket.status)) {
    return (
      <div className="flex items-center gap-1.5 text-success">
        <CheckCircle2 className="size-4 shrink-0" />
        <span className="text-sm">
          {ticket.resolvedAt
            ? `Résolu le ${formatDateShort(ticket.resolvedAt)}`
            : "Résolu"}
        </span>
      </div>
    );
  }

  return <span className="badge badge-ghost badge-sm">En cours</span>;
}

export function TicketTable({ tickets, user, pagination }: TicketTableProps) {
  const showAdminColumns = isAdmin(user.role);
  const showClientColumn = isAdmin(user.role) || isAgent(user.role);
  const showAgentColumn = isAdmin(user.role) || isAgent(user.role);

  if (tickets.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body items-center text-center text-sm text-base-content/60">
          Aucun ticket trouvé.
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Statut</th>
              <th>Priorité</th>
              {showAdminColumns ? <th>Catégorie</th> : null}
              {showClientColumn ? <th>Client</th> : null}
              {showAgentColumn ? <th>Agent assigné</th> : null}
              {showAdminColumns ? <th>Résolution</th> : null}
              {showAdminColumns ? <th>Échéance SLA</th> : null}
              <th>Créé le</th>
              <th>SLA</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover">
                <td>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="link link-primary font-medium"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td>
                  <StatusBadge status={ticket.status} />
                </td>
                <td>
                  <PriorityBadge priority={ticket.priority} />
                </td>
                {showAdminColumns ? (
                  <td className="text-base-content/70">{ticket.category}</td>
                ) : null}
                {showClientColumn ? (
                  <td>
                    <PersonCell person={ticket.client} fallbackId={ticket.clientId} />
                  </td>
                ) : null}
                {showAgentColumn ? (
                  <td>
                    {ticket.assignedAgentId ? (
                      <div className="flex items-center gap-1.5">
                        <UserRound className="size-3.5 shrink-0 text-base-content/40" />
                        {isAgent(user.role) && ticket.assignedAgentId === user.id ? (
                          <span className="font-medium">Moi</span>
                        ) : (
                          <PersonCell
                            person={ticket.assignedAgent}
                            fallbackId={ticket.assignedAgentId}
                          />
                        )}
                      </div>
                    ) : (
                      <span className="badge badge-warning badge-sm">Non assigné</span>
                    )}
                  </td>
                ) : null}
                {showAdminColumns ? (
                  <td>
                    <ResolutionCell ticket={ticket} />
                  </td>
                ) : null}
                {showAdminColumns ? (
                  <td className="text-base-content/70">
                    {ticket.deadline ? (
                      <span className={ticket.isLate ? "font-medium text-error" : ""}>
                        {formatDateShort(ticket.deadline)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                ) : null}
                <td className="text-base-content/70">
                  {formatDateShort(ticket.createdAt)}
                </td>
                <td>
                  {ticket.isLate ? (
                    <OverdueBadge />
                  ) : (
                    <span className="badge badge-ghost badge-sm">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="card-body border-t border-base-300/60 pt-0">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            itemLabel="tickets"
          />
        </div>
      ) : null}
    </div>
  );
}
