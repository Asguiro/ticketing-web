import type { ActionFunctionArgs, LoaderFunctionArgs, ShouldRevalidateFunctionArgs } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { useEffect, useState } from "react";

import { OverdueBadge } from "~/components/dashboard/OverdueBadge";
import { AssignAgentSelect } from "~/components/tickets/AssignAgentSelect";
import { PriorityBadge } from "~/components/tickets/PriorityBadge";
import { StatusBadge } from "~/components/tickets/StatusBadge";
import { StatusHistoryTimeline } from "~/components/tickets/StatusHistoryTimeline";
import { TicketAgentActionsPanel } from "~/components/tickets/TicketAgentActionsPanel";
import { TicketChatSection } from "~/components/tickets/TicketChatSection";
import { PageHeader } from "~/components/shared/PageHeader";
import { PanelSection } from "~/components/shared/PanelSection";
import { PersonCell } from "~/components/shared/PersonCell";
import { Badge } from "~/components/ui/Badge";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { PageLoadingSkeleton } from "~/components/shared/PageLoadingSkeleton";
import { formatDateTime } from "~/lib/date-format";
import { isAdmin, isAgent } from "~/lib/roles";
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
    <div className="page-stack">
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
        <StatusBadge status={ticketStatus} variant="pill" />
        <PriorityBadge priority={ticket.priority} variant="pill" />
        {ticket.isLate ? <OverdueBadge /> : null}
        {ticket.deadline ? (
          <span className="text-cell-secondary">
            Échéance : {formatDateTime(ticket.deadline)}
          </span>
        ) : null}
      </div>

      {(isAgent(user.role) || isAdmin(user.role)) && ticket.client ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <PersonCell
            email={ticket.client.email}
            firstName={ticket.client.firstName}
            lastName={ticket.client.lastName}
            secondary="Client"
          />
          {ticket.assignedAgent ? (
            <PersonCell
              email={ticket.assignedAgent.email}
              firstName={ticket.assignedAgent.firstName}
              lastName={ticket.assignedAgent.lastName}
              secondary="Agent assigné"
            />
          ) : (
            <div className="cell-content">
              <Badge variant="neutral">Non assigné</Badge>
            </div>
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
        <PanelSection
          title="Assignation"
          description="Désigner l'agent responsable du ticket"
        >
          <AssignAgentSelect
            agents={agents}
            currentAgentId={ticket.assignedAgentId}
          />
        </PanelSection>
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

      <PanelSection title="Historique des statuts">
        <StatusHistoryTimeline history={history} />
      </PanelSection>
    </div>
  );
}

export function HydrateFallback() {
  return <PageLoadingSkeleton variant="detail" />;
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
