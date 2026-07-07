import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { Ticket } from "lucide-react";

import { OverdueBadge } from "~/components/dashboard/OverdueBadge";
import { CellStack } from "~/components/shared/CellStack";
import { ListingPanel } from "~/components/shared/ListingTableShell";
import { Pagination } from "~/components/shared/Pagination";
import { PersonCell } from "~/components/shared/PersonCell";
import { Badge } from "~/components/ui/Badge";
import { PriorityBadge } from "~/components/tickets/PriorityBadge";
import { StatusBadge } from "~/components/tickets/StatusBadge";
import { formatDateShort } from "~/lib/date-format";
import { isAdmin, isAgent } from "~/lib/roles";
import type { PaginatedResult } from "~/types/api";
import type { Ticket as TicketType } from "~/types/ticket";
import type { SessionUser } from "~/types/user";

type TicketTableProps = {
  tickets: TicketType[];
  user: SessionUser;
  pagination?: PaginatedResult<TicketType>["pagination"];
  toolbar?: ReactNode;
};

type ColumnWidths = {
  ticket: string;
  status: string;
  priority: string;
  category?: string;
  client?: string;
  agent?: string;
  deadline?: string;
  created: string;
};

function getColumnWidths(showAdmin: boolean, showPeople: boolean): ColumnWidths {
  if (showAdmin) {
    return {
      ticket: "24%",
      status: "11%",
      priority: "10%",
      category: "11%",
      client: "14%",
      agent: "14%",
      deadline: "12%",
      created: "10%",
    };
  }

  if (showPeople) {
    return {
      ticket: "32%",
      status: "13%",
      priority: "11%",
      client: "18%",
      agent: "18%",
      created: "12%",
    };
  }

  return {
    ticket: "52%",
    status: "17%",
    priority: "15%",
    created: "16%",
  };
}

export function TicketTable({ tickets, user, pagination, toolbar }: TicketTableProps) {
  const navigate = useNavigate();
  const showAdminColumns = isAdmin(user.role);
  const showPeopleColumns = isAdmin(user.role) || isAgent(user.role);
  const widths = getColumnWidths(showAdminColumns, showPeopleColumns);

  function openTicket(ticketId: string) {
    void navigate(`/tickets/${ticketId}`);
  }

  const resultCount = pagination?.total ?? tickets.length;

  if (tickets.length === 0) {
    return (
      <ListingPanel
        toolbar={toolbar}
        isEmpty
        emptyIcon={
          <div className="rounded-full bg-base-200/80 p-4">
            <Ticket className="size-7 text-base-content/25" />
          </div>
        }
        emptyTitle="Aucun ticket trouvé"
        emptyDescription="Affinez vos filtres ou réinitialisez la recherche."
      />
    );
  }

  return (
    <ListingPanel
      toolbar={toolbar}
      footer={
        pagination ? (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            itemLabel="tickets"
            embedded
          />
        ) : null
      }
    >
      <div
        className="w-full border-b border-base-300/40"
        style={{ padding: "0.625rem var(--msk-space-4)" }}
      >
        <p className="text-sm text-base-content/55">
          <span className="font-medium text-base-content">{resultCount}</span> ticket
          {resultCount > 1 ? "s" : ""}
        </p>
      </div>

      <table className="listing-table">
        <colgroup>
          <col style={{ width: widths.ticket }} />
          <col style={{ width: widths.status }} />
          <col style={{ width: widths.priority }} />
          {showAdminColumns && widths.category ? (
            <col style={{ width: widths.category }} />
          ) : null}
          {showPeopleColumns && widths.client ? (
            <col style={{ width: widths.client }} />
          ) : null}
          {showPeopleColumns && widths.agent ? (
            <col style={{ width: widths.agent }} />
          ) : null}
          {showAdminColumns && widths.deadline ? (
            <col style={{ width: widths.deadline }} />
          ) : null}
          <col style={{ width: widths.created }} />
        </colgroup>
        <thead>
          <tr>
            <th className="text-col-header">Ticket</th>
            <th className="text-col-header">Statut</th>
            <th className="text-col-header">Priorité</th>
            {showAdminColumns ? <th className="text-col-header">Catégorie</th> : null}
            {showPeopleColumns ? <th className="text-col-header">Client</th> : null}
            {showPeopleColumns ? <th className="text-col-header">Agent</th> : null}
            {showAdminColumns ? <th className="text-col-header">Échéance</th> : null}
            <th className="text-col-header">Créé le</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              data-clickable="true"
              tabIndex={0}
              role="link"
              aria-label={`Voir le ticket : ${ticket.title}`}
              onClick={() => openTicket(ticket.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openTicket(ticket.id);
                }
              }}
            >
              <td>
                <CellStack
                  primary={ticket.title}
                  secondary={showAdminColumns ? undefined : ticket.category}
                />
              </td>
              <td>
                <div className="cell-content">
                  <StatusBadge status={ticket.status} variant="pill" />
                </div>
              </td>
              <td>
                <div className="cell-content">
                  <PriorityBadge priority={ticket.priority} variant="pill" />
                </div>
              </td>
              {showAdminColumns ? (
                <td>
                  <div className="cell-content min-w-0">
                    <span className="truncate text-cell-data">{ticket.category}</span>
                  </div>
                </td>
              ) : null}
              {showPeopleColumns ? (
                <td>
                  <div className="cell-content min-w-0">
                    {ticket.client ? (
                      <PersonCell
                        email={ticket.client.email}
                        firstName={ticket.client.firstName}
                        lastName={ticket.client.lastName}
                      />
                    ) : (
                      <span className="cell-muted">{ticket.clientId.slice(-8)}</span>
                    )}
                  </div>
                </td>
              ) : null}
              {showPeopleColumns ? (
                <td>
                  <div className="cell-content min-w-0">
                    {ticket.assignedAgentId ? (
                      isAgent(user.role) && ticket.assignedAgentId === user.id ? (
                        <PersonCell email={user.email} secondary="Moi" />
                      ) : ticket.assignedAgent ? (
                        <PersonCell
                          email={ticket.assignedAgent.email}
                          firstName={ticket.assignedAgent.firstName}
                          lastName={ticket.assignedAgent.lastName}
                        />
                      ) : (
                        <span className="cell-muted">{ticket.assignedAgentId.slice(-8)}</span>
                      )
                    ) : (
                      <Badge variant="neutral">Non assigné</Badge>
                    )}
                  </div>
                </td>
              ) : null}
              {showAdminColumns ? (
                <td>
                  <div className="cell-content min-w-0 gap-2">
                    {ticket.deadline ? (
                      ticket.isLate ? (
                        <div className="cell-content-start">
                          <span className="cell-date">{formatDateShort(ticket.deadline)}</span>
                          <OverdueBadge />
                        </div>
                      ) : (
                        <span className="cell-date">{formatDateShort(ticket.deadline)}</span>
                      )
                    ) : (
                      <span className="cell-muted">—</span>
                    )}
                  </div>
                </td>
              ) : null}
              <td>
                <div className="cell-content">
                  <span className="cell-date">{formatDateShort(ticket.createdAt)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ListingPanel>
  );
}
