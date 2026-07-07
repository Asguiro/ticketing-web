import {
  INITIAL_HISTORY,
  INITIAL_MESSAGES,
  INITIAL_TICKETS,
  MOCK_USERS,
} from "./seed.server";

import type {
  Ticket,
  TicketMessage,
  TicketStatusHistoryEntry,
} from "~/types/ticket";
import type { User } from "~/types/user";

const store = {
  users: [...MOCK_USERS] as User[],
  tickets: [...INITIAL_TICKETS] as Ticket[],
  messages: [...INITIAL_MESSAGES] as TicketMessage[],
  history: [...INITIAL_HISTORY] as TicketStatusHistoryEntry[],
  nextIds: {
    ticket: INITIAL_TICKETS.length + 1,
    message: INITIAL_MESSAGES.length + 1,
    history: INITIAL_HISTORY.length + 1,
    user: MOCK_USERS.length + 1,
  },
};

export function getMockStore() {
  return store;
}

export function nextMockId(prefix: "ticket" | "message" | "history" | "user") {
  const id = store.nextIds[prefix];
  store.nextIds[prefix] += 1;
  return `${prefix}-${id}`;
}
