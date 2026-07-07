import type { ActionFunctionArgs, LoaderFunctionArgs, ShouldRevalidateFunctionArgs } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { useEffect, useState } from "react";

import { AssignAgentSelect } from "~/components/tickets/AssignAgentSelect";
import { PriorityBadge } from "~/components/tickets/PriorityBadge";
import { StatusBadge } from "~/components/tickets/StatusBadge";
import { StatusHistoryTimeline } from "~/components/tickets/StatusHistoryTimeline";
import { TicketAgentActionsPanel } from "~/components/tickets/TicketAgentActionsPanel";
import { TicketChatSection } from "~/components/tickets/TicketChatSection";
import { PageHeader } from "~/components/shared/PageHeader";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { PageLoadingSkeleton } from "~/components/shared/PageLoadingSkeleton";
import { isAdmin, isAgent } from "~/lib/roles";
import { formatPersonName } from "~/lib/user-display";
import {
  getAdminAllowedTargets,
  getAgentAllowedTargets,
} from "~/lib/ticket-transitions";
import { ticketDetailAction } from "~/server/tickets/actions/ticket.server";
import { ticketDetailLoader } from "~/server/tickets/loaders/ticket.server";
import type { TicketStatus } from "~/types/ticket";
import type { Role } from "~/types/user";

export async function loader(args: LoaderFunctionArgs) {
  return ticketDetailLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return ticketDetailAction(args);
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (
    actionResult &&
    typeof actionResult === "object" &&
    "ok" in actionResult &&
    actionResult.ok &&
    "intent" in actionResult &&
    (actionResult.intent === "send-message" ||
      actionResult.intent === "change-status")
  ) {
    return false;
  }

  return defaultShouldRevalidate;
}

function getAllowedStatuses(role: Role, currentStatus: TicketStatus): TicketStatus[] {
  if (isAdmin(role)) {
    return getAdminAllowedTargets(currentStatus);
  }
  if (isAgent(role)) {
    return getAgentAllowedTargets(currentStatus);
  }
  return [];
}

export default function TicketDetailPage() {
  const { user, ticket, messages, history, agents, chat } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [ticketStatus, setTicketStatus] = useState(ticket.status);

  useEffect(() => {
    setTicketStatus(ticket.status);
  }, [ticket.status]);

  return (
    <div className="space-y-6">
      <PageHeader title={ticket.title} description={ticket.description} />

      {actionData &&
      "error" in actionData &&
      actionData.error &&
      "intent" in actionData &&
      actionData.intent !== "send-message" ? (
        <div className="alert alert-error">
          <span>{actionData.error}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={ticketStatus} />
        <PriorityBadge priority={ticket.priority} />
        {ticket.isLate ? (
          <span className="badge badge-error">En retard</span>
        ) : null}
        {ticket.deadline ? (
          <span className="text-xs text-base-content/60">
            SLA : {new Date(ticket.deadline).toLocaleString("fr-FR")}
          </span>
        ) : null}
      </div>

      {(isAgent(user.role) || isAdmin(user.role)) && ticket.client ? (
        <div className="text-sm text-base-content/70">
          Client :{" "}
          <span className="font-medium text-base-content">
            {formatPersonName(ticket.client)}
          </span>
          {ticket.assignedAgent ? (
            <>
              {" "}
              · Agent :{" "}
              <span className="font-medium text-base-content">
                {formatPersonName(ticket.assignedAgent)}
              </span>
            </>
          ) : (
            <span className="text-base-content/50"> · Non assigné</span>
          )}
        </div>
      ) : null}

      {(isAgent(user.role) || isAdmin(user.role)) && (
        <TicketAgentActionsPanel
          userRole={user.role}
          userId={user.id}
          currentStatus={ticketStatus}
          assignedAgentId={ticket.assignedAgentId}
          allowedStatuses={getAllowedStatuses(user.role, ticketStatus)}
          onStatusChange={setTicketStatus}
        />
      )}

      {isAdmin(user.role) ? (
        <section className="overflow-hidden rounded-box border border-base-300/60 bg-base-100 shadow-md">
          <div className="border-b border-base-300/60 px-5 py-4">
            <h2 className="text-base font-semibold text-base-content">Assignation</h2>
            <p className="mt-0.5 text-xs text-base-content/55">
              Désigner l&apos;agent responsable du ticket
            </p>
          </div>
          <div className="p-5">
            <AssignAgentSelect
              agents={agents}
              currentAgentId={ticket.assignedAgentId}
            />
          </div>
        </section>
      ) : null}

      <TicketChatSection
        key={ticket.id}
        ticketId={ticket.id}
        ticketClientId={ticket.clientId}
        assignedAgentId={ticket.assignedAgentId}
        initialMessages={messages}
        initialStatus={ticket.status}
        user={user}
        chat={chat}
        onStatusChange={setTicketStatus}
      />

      <section className="card bg-base-100 shadow-md">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Historique des statuts</h2>
          <StatusHistoryTimeline history={history} />
        </div>
      </section>
    </div>
  );
}

export function HydrateFallback() {
  return <PageLoadingSkeleton variant="detail" />;
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
