/**
 * Types et enums API — à recopier dans le repo `ticketing-web`.
 *
 * Source de vérité : Swagger `/api/docs` + DTOs NestJS.
 * Ce fichier est maintenu manuellement ; en cas de divergence, Swagger prime.
 *
 * Usage suggéré : `app/types/api.ts` ou `app/lib/api-types.ts`
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role = 'CLIENT' | 'AGENT' | 'ADMIN';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string; // ISO 8601
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Tickets ─────────────────────────────────────────────────────────────────

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  clientId: string;
  assignedAgentId: string | null;
  resolvedAt: string | null; // ISO 8601
  createdAt: string;
  updatedAt: string;
  /** Date limite SLA (calendaire), calculée côté API */
  deadline: string;
  /** true si le ticket actif dépasse le SLA */
  isLate: boolean;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface AssignTicketRequest {
  /** Requis pour Admin. Omis pour auto-assignation Agent. */
  agentId?: string;
}

export interface QueryTicketsParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAgentId?: string;
  includeUnassigned?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus;
  changedById: string;
  changedAt: string;
  changedBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
  };
}

export interface CreateMessageRequest {
  content: string;
}

// ─── Users (Admin) ───────────────────────────────────────────────────────────

export interface CreateUserRequest {
  email: string;
  password: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: Role;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface QueryUsersParams {
  role?: Role;
  page?: number;
  pageSize?: number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardPeriod {
  from: string;
  to: string;
}

export interface DashboardStats {
  openCount: number;
  overdueCount: number;
  resolvedInPeriodCount: number;
  period: DashboardPeriod;
  /** Présent uniquement pour le rôle ADMIN */
  byStatus?: Partial<Record<TicketStatus, number>>;
}

export interface QueryDashboardParams {
  periodDays?: number; // défaut 30, max 365
}

// ─── Health ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

// ─── Erreurs API ─────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  statusCode: number;
  message: string[];
  error: string;
  path: string;
  timestamp: string;
}

// ─── WebSocket ───────────────────────────────────────────────────────────────

export interface WsJoinTicketPayload {
  ticketId: string;
}

export interface WsSendMessagePayload {
  ticketId: string;
  content: string;
}

export interface WsTicketReopenedPayload {
  ticketId: string;
  status: 'REOPENED';
}

// ─── Transitions de statut (référence UI) ────────────────────────────────────

/** Transitions globales autorisées par l'API */
export const ALLOWED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['IN_PROGRESS'],
  CLOSED: [],
};

/** Transitions qu'un agent assigné peut déclencher manuellement */
export const AGENT_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  REOPENED: ['IN_PROGRESS'],
  RESOLVED: [],
  CLOSED: [],
};

/** Délais SLA en heures (temps calendaire) */
export const SLA_HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
  HIGH: 4,
  MEDIUM: 24,
  LOW: 72,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isStatusTransitionAllowed(
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAgentAllowedTargets(from: TicketStatus): TicketStatus[] {
  return AGENT_STATUS_TRANSITIONS[from] ?? [];
}

export function formatApiErrorMessage(body: ApiErrorBody): string {
  return body.message[0] ?? 'Une erreur est survenue';
}
