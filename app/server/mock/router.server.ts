import { ApiError } from "~/server/api/api-client.server";
import {
  computeDashboardStats,
  enrichHistory,
  enrichMessage,
  enrichTicket,
  MOCK_PASSWORD_HINT,
  MOCK_USERS,
  toSessionUser,
} from "~/server/mock/seed.server";
import { getMockStore, nextMockId } from "~/server/mock/store.server";
import type { PaginatedResult } from "~/types/api";
import type { DashboardStats } from "~/types/dashboard";
import type {
  CreateTicketInput,
  Ticket,
  TicketListParams,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  TicketStatusHistoryEntry,
} from "~/types/ticket";
import type {
  CreateUserInput,
  LoginResponse,
  SessionUser,
  User,
} from "~/types/user";

type MockRequest = {
  path: string;
  method: string;
  accessToken?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
};

function parseToken(accessToken?: string): SessionUser | null {
  if (!accessToken?.startsWith("mock:")) return null;
  const userId = accessToken.slice("mock:".length);
  const user = getMockStore().users.find((entry) => entry.id === userId);
  return user ? toSessionUser(user) : null;
}

function requireMockUser(accessToken?: string): SessionUser {
  const user = parseToken(accessToken);
  if (!user) {
    throw new ApiError(401, { message: "Session mock invalide." });
  }
  return user;
}

function paginate<T>(
  items: T[],
  page = 1,
  limit = 20,
): PaginatedResult<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  const slice = items.slice(start, start + safeLimit);

  return {
    items: slice,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / safeLimit)),
    },
  };
}

function matchPath(path: string) {
  const segments = path.split("/").filter(Boolean);

  return {
    is(pathname: string): Record<string, string> | false {
      const expected = pathname.split("/").filter(Boolean);
      if (expected.length !== segments.length) return false;

      const params: Record<string, string> = {};

      for (let index = 0; index < expected.length; index += 1) {
        const part = expected[index]!;
        const segment = segments[index]!;

        if (part.startsWith(":")) {
          params[part.slice(1)] = segment;
          continue;
        }

        if (part !== segment) {
          return false;
        }
      }

      return params;
    },
  };
}

function filterTicketsForUser(
  user: SessionUser,
  tickets: Ticket[],
  includeUnassigned = false,
) {
  if (user.role === "ADMIN") return tickets;
  if (user.role === "AGENT") {
    return tickets.filter(
      (ticket) =>
        ticket.assignedAgentId === user.id ||
        (includeUnassigned && !ticket.assignedAgentId),
    );
  }
  return tickets.filter((ticket) => ticket.clientId === user.id);
}

function canAccessTicket(user: SessionUser, ticket: Ticket) {
  if (user.role === "ADMIN") return true;
  if (user.role === "AGENT") {
    return ticket.assignedAgentId === user.id || !ticket.assignedAgentId;
  }
  return ticket.clientId === user.id;
}

export async function mockApiRequest<T>(
  path: string,
  options: Omit<MockRequest, "path">,
): Promise<T> {
  const { method, accessToken, body, params } = options;
  const store = getMockStore();
  const matcher = matchPath(path);

  if (path === "/auth/login" && method === "POST") {
    const payload = body as { email?: string; password?: string };
    const user = store.users.find((entry) => entry.email === payload.email);

    if (!user || !payload.password) {
      throw new ApiError(401, {
        message: `Identifiants invalides. Essayez ${MOCK_PASSWORD_HINT}.`,
      });
    }

    const response: LoginResponse = {
      accessToken: `mock:${user.id}`,
      refreshToken: `mock-refresh:${user.id}`,
      user: toSessionUser(user),
    };
    return response as T;
  }

  if (path === "/auth/refresh" && method === "POST") {
    const payload = body as { refreshToken?: string };
    if (!payload.refreshToken?.startsWith("mock-refresh:")) {
      throw new ApiError(401, { message: "Refresh token invalide." });
    }
    const userId = payload.refreshToken.slice("mock-refresh:".length);
    const user = store.users.find((entry) => entry.id === userId);
    if (!user) {
      throw new ApiError(401, { message: "Refresh token expiré." });
    }
    const response: LoginResponse = {
      accessToken: `mock:${user.id}`,
      refreshToken: `mock-refresh:${user.id}`,
      user: toSessionUser(user),
    };
    return response as T;
  }

  if (path === "/auth/logout" && method === "POST") {
    requireMockUser(accessToken);
    return undefined as T;
  }

  if (path === "/auth/me" && method === "GET") {
    return requireMockUser(accessToken) as T;
  }

  if (path === "/dashboard/stats" && method === "GET") {
    const user = requireMockUser(accessToken);
    const stats: DashboardStats = computeDashboardStats(
      store.tickets,
      user.role,
      user.id,
    );
    return stats as T;
  }

  if (path === "/tickets" && method === "GET") {
    const user = requireMockUser(accessToken);
    const listParams = (params ?? {}) as TicketListParams;
    let tickets: Ticket[];

    if (listParams.unassignedOnly) {
      tickets = store.tickets.filter((ticket) => !ticket.assignedAgentId);
      if (user.role === "CLIENT") {
        tickets = tickets.filter((ticket) => ticket.clientId === user.id);
      }
    } else if (user.role === "AGENT" && listParams.includeUnassigned === false) {
      tickets = store.tickets.filter(
        (ticket) => ticket.assignedAgentId === user.id,
      );
    } else {
      tickets = filterTicketsForUser(
        user,
        store.tickets,
        user.role === "AGENT" ? listParams.includeUnassigned !== false : false,
      );
    }

    tickets = tickets.map((ticket) => enrichTicket(ticket, store.users));

    if (listParams.status) {
      tickets = tickets.filter((ticket) => ticket.status === listParams.status);
    }
    if (listParams.priority) {
      tickets = tickets.filter(
        (ticket) => ticket.priority === listParams.priority,
      );
    }
    if (listParams.assignedAgentId === "__unassigned__") {
      tickets = tickets.filter((ticket) => !ticket.assignedAgentId);
    } else if (listParams.assignedAgentId) {
      tickets = tickets.filter(
        (ticket) => ticket.assignedAgentId === listParams.assignedAgentId,
      );
    }

    return paginate(
      tickets,
      listParams.page,
      listParams.limit,
    ) as T;
  }

  if (path === "/tickets" && method === "POST") {
    const user = requireMockUser(accessToken);
    if (user.role !== "CLIENT") {
      throw new ApiError(403, { message: "Seuls les clients peuvent créer un ticket." });
    }

    const input = body as CreateTicketInput;
    const ticket: Ticket = {
      id: nextMockId("ticket"),
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: "OPEN",
      clientId: user.id,
      assignedAgentId: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      isLate: false,
      version: 1,
    };

    store.tickets.unshift(ticket);
    return enrichTicket(ticket, store.users) as T;
  }

  const ticketDetail = matcher.is("/tickets/:id");
  if (ticketDetail && method === "GET") {
    const user = requireMockUser(accessToken);
    const ticket = store.tickets.find((entry) => entry.id === ticketDetail.id);
    if (!ticket || !canAccessTicket(user, ticket)) {
      throw new ApiError(404, { message: "Ticket introuvable." });
    }
    return enrichTicket(ticket, store.users) as T;
  }

  const ticketStatus = matcher.is("/tickets/:id/status");
  if (ticketStatus && method === "PATCH") {
    const user = requireMockUser(accessToken);
    const ticket = store.tickets.find((entry) => entry.id === ticketStatus.id);
    if (!ticket || !canAccessTicket(user, ticket)) {
      throw new ApiError(404, { message: "Ticket introuvable." });
    }
    if (user.role === "CLIENT") {
      throw new ApiError(403, { message: "Action non autorisée." });
    }

    const nextStatus = (body as { status: TicketStatus }).status;
    const history: TicketStatusHistoryEntry = {
      id: nextMockId("history"),
      ticketId: ticket.id,
      fromStatus: ticket.status,
      toStatus: nextStatus,
      changedById: user.id,
      changedAt: new Date().toISOString(),
    };

    ticket.status = nextStatus;
    ticket.resolvedAt = nextStatus === "RESOLVED" ? new Date().toISOString() : null;
    ticket.version = (ticket.version ?? 1) + 1;
    store.history.unshift(history);

    return enrichTicket(ticket, store.users) as T;
  }

  const ticketAssign = matcher.is("/tickets/:id/assign");
  if (ticketAssign && method === "PATCH") {
    const user = requireMockUser(accessToken);
    const ticket = store.tickets.find((entry) => entry.id === ticketAssign.id);
    if (!ticket) {
      throw new ApiError(404, { message: "Ticket introuvable." });
    }

    if (user.role === "CLIENT") {
      throw new ApiError(403, { message: "Action non autorisée." });
    }

    if (user.role === "AGENT" && !canAccessTicket(user, ticket)) {
      throw new ApiError(403, { message: "Accès refusé à ce ticket." });
    }

    const payload = body as { agentId?: string };
    const agentId = payload.agentId ?? (user.role === "AGENT" ? user.id : undefined);

    if (!agentId) {
      throw new ApiError(400, { message: "Agent requis pour l'assignation." });
    }

    if (user.role === "AGENT" && agentId !== user.id) {
      throw new ApiError(403, { message: "Un agent ne peut s'assigner que lui-même." });
    }

    if (ticket.assignedAgentId === agentId) {
      return enrichTicket(ticket, store.users) as T;
    }

    if (ticket.assignedAgentId && ticket.assignedAgentId !== agentId) {
      throw new ApiError(403, {
        message: "Ce ticket est déjà assigné à un autre agent.",
      });
    }

    ticket.assignedAgentId = agentId;
    if (ticket.status === "OPEN" || ticket.status === "REOPENED") {
      ticket.status = "IN_PROGRESS";
    }
    ticket.version = (ticket.version ?? 1) + 1;
    return enrichTicket(ticket, store.users) as T;
  }

  const ticketMessages = matcher.is("/tickets/:id/messages");
  if (ticketMessages && method === "GET") {
    const user = requireMockUser(accessToken);
    const ticket = store.tickets.find((entry) => entry.id === ticketMessages.id);
    if (!ticket || !canAccessTicket(user, ticket)) {
      throw new ApiError(404, { message: "Ticket introuvable." });
    }

    const messages = store.messages
      .filter((message) => message.ticketId === ticket.id)
      .map((message) => enrichMessage(message, store.users));

    return messages as T;
  }

  if (ticketMessages && method === "POST") {
    const user = requireMockUser(accessToken);
    const ticket = store.tickets.find((entry) => entry.id === ticketMessages.id);
    if (!ticket || !canAccessTicket(user, ticket)) {
      throw new ApiError(404, { message: "Ticket introuvable." });
    }

    const content = (body as { content: string }).content;
    const message: TicketMessage = {
      id: nextMockId("message"),
      ticketId: ticket.id,
      authorId: user.id,
      content,
      createdAt: new Date().toISOString(),
    };

    store.messages.push(message);

    if (user.role === "CLIENT" && ticket.status === "RESOLVED") {
      ticket.status = "REOPENED";
      ticket.resolvedAt = null;
      store.history.unshift({
        id: nextMockId("history"),
        ticketId: ticket.id,
        fromStatus: "RESOLVED",
        toStatus: "REOPENED",
        changedById: user.id,
        changedAt: new Date().toISOString(),
      });
    }

    return enrichMessage(message, store.users) as T;
  }

  const ticketHistory = matcher.is("/tickets/:id/history");
  if (ticketHistory && method === "GET") {
    const user = requireMockUser(accessToken);
    const ticket = store.tickets.find((entry) => entry.id === ticketHistory.id);
    if (!ticket || !canAccessTicket(user, ticket)) {
      throw new ApiError(404, { message: "Ticket introuvable." });
    }

    const history = store.history
      .filter((entry) => entry.ticketId === ticket.id)
      .map((entry) => enrichHistory(entry, store.users));

    return history as T;
  }

  if (path === "/users" && method === "GET") {
    const user = requireMockUser(accessToken);
    if (user.role !== "ADMIN") {
      throw new ApiError(403, { message: "Réservé aux administrateurs." });
    }

    const role = params?.role as User["role"] | undefined;
    const users = role
      ? store.users.filter((entry) => entry.role === role)
      : store.users;

    return paginate(users, Number(params?.page ?? 1), Number(params?.limit ?? 20)) as T;
  }

  if (path === "/users" && method === "POST") {
    const user = requireMockUser(accessToken);
    if (user.role !== "ADMIN") {
      throw new ApiError(403, { message: "Réservé aux administrateurs." });
    }

    const input = body as CreateUserInput;
    const created: User = {
      id: nextMockId("user"),
      email: input.email,
      role: input.role,
      createdAt: new Date().toISOString(),
    };
    store.users.push(created);
    return created as T;
  }

  const userDetail = matcher.is("/users/:id");
  if (userDetail && method === "GET") {
    const user = requireMockUser(accessToken);
    const target = store.users.find((entry) => entry.id === userDetail.id);
    if (!target) {
      throw new ApiError(404, { message: "Utilisateur introuvable." });
    }
    if (user.role !== "ADMIN" && user.id !== target.id) {
      throw new ApiError(403, { message: "Accès refusé." });
    }
    return target as T;
  }

  if (userDetail && method === "PATCH") {
    const user = requireMockUser(accessToken);
    if (user.role !== "ADMIN") {
      throw new ApiError(403, { message: "Réservé aux administrateurs." });
    }

    const target = store.users.find((entry) => entry.id === userDetail.id);
    if (!target) {
      throw new ApiError(404, { message: "Utilisateur introuvable." });
    }

    const payload = body as {
      email?: string;
      password?: string;
      role?: User["role"];
    };

    if (payload.email) {
      const emailTaken = store.users.some(
        (entry) => entry.id !== target.id && entry.email === payload.email,
      );
      if (emailTaken) {
        throw new ApiError(409, { message: "Cet email est déjà utilisé." });
      }
      target.email = payload.email;
    }

    if (payload.role) {
      target.role = payload.role;
    }

    target.updatedAt = new Date().toISOString();
    return target as T;
  }

  if (userDetail && method === "DELETE") {
    const user = requireMockUser(accessToken);
    if (user.role !== "ADMIN") {
      throw new ApiError(403, { message: "Réservé aux administrateurs." });
    }

    if (user.id === userDetail.id) {
      throw new ApiError(400, {
        message: "Vous ne pouvez pas supprimer votre propre compte.",
      });
    }

    const index = store.users.findIndex((entry) => entry.id === userDetail.id);
    if (index === -1) {
      throw new ApiError(404, { message: "Utilisateur introuvable." });
    }

    store.users.splice(index, 1);
    return undefined as T;
  }

  throw new ApiError(404, {
    message: `Endpoint mock non implémenté: ${method} ${path}`,
  });
}

export function getMockDemoAccounts() {
  return MOCK_USERS.map((user) => ({
    email: user.email,
    role: user.role,
    password: MOCK_PASSWORD_HINT,
  }));
}
