import type { DashboardStats } from "~/types/dashboard";
import type {
  Ticket,
  TicketMessage,
  TicketStatusHistoryEntry,
} from "~/types/ticket";
import type { SessionUser, User } from "~/types/user";

export const MOCK_PASSWORD_HINT = "ChangeMe123!";

export const MOCK_USERS: User[] = [
  {
    id: "user-client-1",
    email: "client@test.dev",
    role: "CLIENT",
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "user-agent-1",
    email: "agent@test.dev",
    role: "AGENT",
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "user-admin-1",
    email: "admin@test.dev",
    role: "ADMIN",
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "user-client-2",
    email: "marie.dupont@client.fr",
    role: "CLIENT",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "user-agent-2",
    email: "pierre.martin@msk.fr",
    role: "AGENT",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "ticket-1",
    title: "Impossible de se connecter",
    description: "Le message d'erreur apparaît après la saisie du mot de passe.",
    category: "Authentification",
    priority: "HIGH",
    status: "OPEN",
    clientId: "user-client-1",
    assignedAgentId: null,
    createdAt: "2026-06-28T08:30:00.000Z",
    resolvedAt: null,
    isLate: true,
    version: 1,
  },
  {
    id: "ticket-2",
    title: "Demande de facture",
    description: "Besoin d'une copie de la dernière facture au format PDF.",
    category: "Facturation",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    clientId: "user-client-2",
    assignedAgentId: "user-agent-1",
    createdAt: "2026-06-29T14:00:00.000Z",
    resolvedAt: null,
    isLate: false,
    version: 2,
  },
  {
    id: "ticket-3",
    title: "Bug affichage mobile",
    description: "Le menu déborde sur iPhone 14.",
    category: "Interface",
    priority: "LOW",
    status: "RESOLVED",
    clientId: "user-client-1",
    assignedAgentId: "user-agent-1",
    createdAt: "2026-06-20T10:00:00.000Z",
    resolvedAt: "2026-06-25T16:00:00.000Z",
    isLate: false,
    version: 3,
  },
  {
    id: "ticket-4",
    title: "Réinitialisation accès admin",
    description: "Un nouvel administrateur doit être créé pour le service RH.",
    category: "Comptes",
    priority: "HIGH",
    status: "OPEN",
    clientId: "user-client-2",
    assignedAgentId: null,
    createdAt: "2026-07-01T09:15:00.000Z",
    resolvedAt: null,
    isLate: false,
    version: 1,
  },
];

export const INITIAL_MESSAGES: TicketMessage[] = [
  {
    id: "msg-1",
    ticketId: "ticket-1",
    authorId: "user-client-1",
    content: "Bonjour, je n'arrive plus à me connecter depuis ce matin.",
    createdAt: "2026-06-28T08:31:00.000Z",
  },
  {
    id: "msg-2",
    ticketId: "ticket-2",
    authorId: "user-client-2",
    content: "Pouvez-vous m'envoyer la facture de juin ?",
    createdAt: "2026-06-29T14:05:00.000Z",
  },
  {
    id: "msg-3",
    ticketId: "ticket-2",
    authorId: "user-agent-1",
    content: "Bonjour, je traite votre demande et reviens vers vous rapidement.",
    createdAt: "2026-06-29T15:10:00.000Z",
  },
];

export const INITIAL_HISTORY: TicketStatusHistoryEntry[] = [
  {
    id: "hist-1",
    ticketId: "ticket-2",
    fromStatus: "OPEN",
    toStatus: "IN_PROGRESS",
    changedById: "user-agent-1",
    changedAt: "2026-06-29T15:00:00.000Z",
  },
  {
    id: "hist-2",
    ticketId: "ticket-3",
    fromStatus: "IN_PROGRESS",
    toStatus: "RESOLVED",
    changedById: "user-agent-1",
    changedAt: "2026-06-25T16:00:00.000Z",
  },
];

export function toSessionUser(user: User): SessionUser {
  return { id: user.id, email: user.email, role: user.role };
}

export function enrichTicket(ticket: Ticket, users: User[]): Ticket {
  const client = users.find((user) => user.id === ticket.clientId);
  const assignedAgent = users.find((user) => user.id === ticket.assignedAgentId);

  return {
    ...ticket,
    client: client ? toSessionUser(client) : undefined,
    assignedAgent: assignedAgent ? toSessionUser(assignedAgent) : null,
  };
}

export function enrichMessage(
  message: TicketMessage,
  users: User[],
): TicketMessage {
  const author = users.find((user) => user.id === message.authorId);
  return {
    ...message,
    author: author ? toSessionUser(author) : undefined,
  };
}

export function enrichHistory(
  entry: TicketStatusHistoryEntry,
  users: User[],
): TicketStatusHistoryEntry {
  const changedBy = users.find((user) => user.id === entry.changedById);
  return {
    ...entry,
    changedBy: changedBy ? toSessionUser(changedBy) : undefined,
  };
}

export function computeDashboardStats(
  tickets: Ticket[],
  role: SessionUser["role"],
  userId: string,
): DashboardStats {
  const scoped =
    role === "ADMIN"
      ? tickets
      : role === "AGENT"
        ? tickets.filter((ticket) => ticket.assignedAgentId === userId)
        : tickets.filter((ticket) => ticket.clientId === userId);

  return {
    openCount: scoped.filter((ticket) =>
      ["OPEN", "IN_PROGRESS", "REOPENED"].includes(ticket.status),
    ).length,
    overdueCount: scoped.filter((ticket) => ticket.isLate).length,
    resolvedInPeriodCount: scoped.filter((ticket) => ticket.status === "RESOLVED")
      .length,
  };
}
