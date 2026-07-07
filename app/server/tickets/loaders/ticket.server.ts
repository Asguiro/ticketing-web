import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";

import { getWsBaseUrl, isMockApiEnabled } from "~/lib/env.server";
import {
  getTicketById,
  getTicketHistory,
  getTicketMessages,
  getTickets,
} from "~/server/api/ticket-api.server";
import { getAgents } from "~/server/api/user-api.server";
import {
  mergeSetCookieHeaders,
  withAuthenticatedApi,
} from "~/server/auth/require-auth.server";
import { safeLoaderCall, throwNotFound } from "~/server/lib/loader-utils.server";
import type { TicketListParams } from "~/types/ticket";

function parseTicketListParams(url: URL): TicketListParams {
  const agentParam = url.searchParams.get("agent");
  const poolParam = url.searchParams.get("pool");
  let assignedAgentId: string | undefined;

  if (agentParam === "__unassigned__") {
    assignedAgentId = "__unassigned__";
  } else if (agentParam) {
    assignedAgentId = agentParam;
  }

  const params: TicketListParams = {
    status: (url.searchParams.get("status") as TicketListParams["status"]) ??
      undefined,
    priority:
      (url.searchParams.get("priority") as TicketListParams["priority"]) ??
      undefined,
    assignedAgentId,
    page: Number(url.searchParams.get("page") ?? 1),
    limit: Number(url.searchParams.get("limit") ?? 20),
    sortBy:
      (url.searchParams.get("sortBy") as TicketListParams["sortBy"]) ??
      "createdAt",
    sortOrder:
      (url.searchParams.get("sortOrder") as TicketListParams["sortOrder"]) ??
      "desc",
  };

  if (poolParam === "unassigned") {
    params.unassignedOnly = true;
  } else if (poolParam === "mine") {
    params.includeUnassigned = false;
  }

  return params;
}

export async function ticketsListLoader({ request }: LoaderFunctionArgs) {
  return safeLoaderCall(async () => {
    const url = new URL(request.url);
    const params = parseTicketListParams(url);

    const ticketsResult = await withAuthenticatedApi(
      request,
      ["CLIENT", "AGENT", "ADMIN"],
      (token) => getTickets(token, params),
    );

    let agents: Awaited<ReturnType<typeof getAgents>>["items"] = [];
    let setCookie = ticketsResult.setCookie;

    if (ticketsResult.session.user.role === "ADMIN") {
      const agentsResult = await withAuthenticatedApi(request, ["ADMIN"], (token) =>
        getAgents(token),
      );
      agents = agentsResult.data.items;
      setCookie = setCookie ?? agentsResult.setCookie;
    }

    return data(
      {
        user: ticketsResult.session.user,
        tickets: ticketsResult.data.items,
        pagination: ticketsResult.data.pagination,
        filters: params,
        agents,
      },
      {
        headers: mergeSetCookieHeaders(undefined, setCookie),
      },
    );
  });
}

export async function ticketDetailLoader({
  request,
  params,
}: LoaderFunctionArgs) {
  return safeLoaderCall(async () => {
    const ticketId = params.id;

    if (!ticketId) {
      throwNotFound("Ticket introuvable.");
    }

    const sessionProbe = await withAuthenticatedApi(
      request,
      ["CLIENT", "AGENT", "ADMIN"],
      async () => null,
    );
    const isAdminUser = sessionProbe.session.user.role === "ADMIN";

    const [ticketResult, messagesResult, historyResult, agentsResult] =
      await Promise.all([
        withAuthenticatedApi(request, ["CLIENT", "AGENT", "ADMIN"], (token) =>
          getTicketById(token, ticketId!),
        ),
        withAuthenticatedApi(request, ["CLIENT", "AGENT", "ADMIN"], (token) =>
          getTicketMessages(token, ticketId!),
        ),
        withAuthenticatedApi(request, ["CLIENT", "AGENT", "ADMIN"], (token) =>
          getTicketHistory(token, ticketId!),
        ),
        isAdminUser
          ? withAuthenticatedApi(request, ["ADMIN"], (token) => getAgents(token))
          : Promise.resolve(null),
      ]);

    const setCookie =
      ticketResult.setCookie ??
      messagesResult.setCookie ??
      historyResult.setCookie ??
      agentsResult?.setCookie;

    return data(
      {
        user: ticketResult.session.user,
        ticket: ticketResult.data,
        messages: messagesResult.data,
        history: historyResult.data,
        agents: agentsResult?.data.items ?? [],
        chat: isMockApiEnabled()
          ? { enabled: false as const }
          : {
              enabled: true as const,
              wsUrl: getWsBaseUrl(),
              accessToken: ticketResult.session.accessToken,
            },
      },
      {
        headers: mergeSetCookieHeaders(undefined, setCookie),
      },
    );
  });
}

export async function newTicketLoader({ request }: LoaderFunctionArgs) {
  return safeLoaderCall(async () => {
    const { session } = await withAuthenticatedApi(request, ["CLIENT"], async () => null);

    return data({
      user: session.user,
    });
  });
}
