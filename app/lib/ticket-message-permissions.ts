import { isAgent, isClient } from "~/lib/roles";
import type { Ticket, TicketStatus } from "~/types/ticket";
import type { SessionUser } from "~/types/user";

type TicketMessageContext = Pick<
  Ticket,
  "clientId" | "assignedAgentId" | "status"
>;

export function canSendTicketMessage(
  user: SessionUser,
  ticket: TicketMessageContext,
): boolean {
  if (ticket.status === "CLOSED") {
    return false;
  }

  if (isClient(user.role)) {
    return ticket.clientId === user.id;
  }

  if (isAgent(user.role)) {
    return ticket.assignedAgentId === user.id;
  }

  return false;
}

export function getTicketMessageDisabledReason(
  user: SessionUser,
  ticket: TicketMessageContext,
): string | null {
  if (ticket.status === "CLOSED") {
    return "Ce ticket est fermé — lecture seule.";
  }

  if (isClient(user.role) && ticket.clientId !== user.id) {
    return "Vous ne pouvez pas répondre sur ce ticket.";
  }

  if (isAgent(user.role) && ticket.assignedAgentId !== user.id) {
    return "Assignez-vous ce ticket pour pouvoir répondre.";
  }

  if (!canSendTicketMessage(user, ticket)) {
    return "Votre rôle ne permet pas d'envoyer des messages sur ce ticket.";
  }

  return null;
}
