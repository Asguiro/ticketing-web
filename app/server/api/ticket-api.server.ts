import { apiRequest } from "./api-client.server";
import {
  normalizeDashboardStats,
  normalizePaginatedResponse,
} from "./api-mappers.server";

import type { PaginatedResult } from "~/types/api";
import type { DashboardStats } from "~/types/dashboard";
import type {
  AssignTicketInput,
  ChangeTicketStatusInput,
  CreateMessageInput,
  CreateTicketInput,
  Ticket,
  TicketListParams,
  TicketMessage,
  TicketStatusHistoryEntry,
} from "~/types/ticket";

function mapTicketListParams(params: TicketListParams) {
  const pageSize = params.pageSize ?? params.limit ?? 20;
  const isUnassignedFilter = params.assignedAgentId === "__unassigned__";
  const wantUnassignedOnly = params.unassignedOnly === true || isUnassignedFilter;

  const mapped: Record<string, string | number | boolean | undefined | null> = {
    status: params.status,
    priority: params.priority,
    assignedAgentId: isUnassignedFilter ? undefined : params.assignedAgentId,
    page: params.page,
    pageSize,
    sortBy: params.sortBy,
    order: params.sortOrder,
  };

  if (params.includeUnassigned !== undefined) {
    mapped.includeUnassigned = params.includeUnassigned;
  }

  // Paramètre interne mock : ne jamais envoyer "false" à l'API réelle
  // (NestJS peut interpréter la string "false" comme truthy).
  if (wantUnassignedOnly) {
    mapped.unassignedOnly = true;
  }

  return mapped;
}

export async function getTickets(
  accessToken: string,
  params: TicketListParams = {},
) {
  const response = await apiRequest<unknown>("/tickets", {
    method: "GET",
    accessToken,
    params: mapTicketListParams(params),
  });

  return normalizePaginatedResponse<Ticket>(response);
}

export function getTicketById(accessToken: string, ticketId: string) {
  return apiRequest<Ticket>(`/tickets/${ticketId}`, {
    method: "GET",
    accessToken,
  });
}

export function createTicket(accessToken: string, input: CreateTicketInput) {
  return apiRequest<Ticket>("/tickets", {
    method: "POST",
    accessToken,
    body: input,
  });
}

export function changeTicketStatus(
  accessToken: string,
  ticketId: string,
  input: ChangeTicketStatusInput,
) {
  return apiRequest<Ticket>(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    accessToken,
    body: input,
  });
}

export function assignTicket(
  accessToken: string,
  ticketId: string,
  input: AssignTicketInput,
) {
  return apiRequest<Ticket>(`/tickets/${ticketId}/assign`, {
    method: "PATCH",
    accessToken,
    body: input,
  });
}

export function getTicketMessages(accessToken: string, ticketId: string) {
  return apiRequest<TicketMessage[]>(`/tickets/${ticketId}/messages`, {
    method: "GET",
    accessToken,
  });
}

export function addTicketMessage(
  accessToken: string,
  ticketId: string,
  input: CreateMessageInput,
) {
  return apiRequest<TicketMessage>(`/tickets/${ticketId}/messages`, {
    method: "POST",
    accessToken,
    body: input,
  });
}

export function getTicketHistory(accessToken: string, ticketId: string) {
  return apiRequest<TicketStatusHistoryEntry[]>(
    `/tickets/${ticketId}/history`,
    {
      method: "GET",
      accessToken,
    },
  );
}
