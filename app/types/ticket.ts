import type { Role } from "./user";
export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type TicketAuthor = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: Role;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  clientId: string;
  assignedAgentId: string | null;
  createdAt: string;
  updatedAt?: string;
  resolvedAt: string | null;
  deadline?: string;
  isLate?: boolean;
  version?: number;
  client?: TicketAuthor;
  assignedAgent?: TicketAuthor | null;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: TicketAuthor;
};

export type TicketStatusHistoryEntry = {
  id: string;
  ticketId?: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus;
  changedById: string;
  changedAt: string;
  changedBy?: TicketAuthor;
};

export type TicketListParams = {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAgentId?: string;
  /** false → uniquement les tickets assignés à l'agent courant */
  includeUnassigned?: boolean;
  /** true → uniquement le pool non assigné */
  unassignedOnly?: boolean;
  page?: number;
  pageSize?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "priority";
  sortOrder?: "asc" | "desc";
};

export type CreateTicketInput = {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
};

export type ChangeTicketStatusInput = {
  status: TicketStatus;
};

export type AssignTicketInput = {
  agentId?: string;
};

export type CreateMessageInput = {
  content: string;
};
