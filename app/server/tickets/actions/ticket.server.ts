import type { ActionFunctionArgs } from "react-router";
import { data, redirect } from "react-router";

import { ApiError, getErrorMessage } from "~/server/api/api-client.server";
import {
  addTicketMessage,
  assignTicket,
  changeTicketStatus,
  createTicket,
} from "~/server/api/ticket-api.server";
import {
  mergeSetCookieHeaders,
  withAuthenticatedApi,
} from "~/server/auth/require-auth.server";
import {
  parseCreateTicketFormData,
  parseTicketDetailFormData,
} from "~/server/tickets/schema/ticket.schema";
import type { TicketStatus } from "~/types/ticket";

export async function createTicketAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const parsed = parseCreateTicketFormData(formData);

  if (!parsed.success) {
    return data({ ok: false as const, errors: parsed.errors }, { status: 422 });
  }

  try {
    const { data: ticket, setCookie } = await withAuthenticatedApi(
      request,
      ["CLIENT"],
      (token) => createTicket(token, parsed.data),
    );

    return redirect(`/tickets/${ticket.id}`, {
      headers: mergeSetCookieHeaders(undefined, setCookie),
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    return data(
      {
        ok: false as const,
        error: getErrorMessage(error, "Impossible de créer le ticket."),
      },
      { status: error instanceof ApiError ? error.status : 500 },
    );
  }
}

export async function ticketDetailAction({
  request,
  params,
}: ActionFunctionArgs) {
  const ticketId = params.id;

  if (!ticketId) {
    return data(
      { ok: false as const, error: "Ticket introuvable." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const parsed = parseTicketDetailFormData(formData);

  if (!parsed.success) {
    return data({ ok: false as const, errors: parsed.errors }, { status: 400 });
  }

  const detailData = parsed.data;
  const intent = detailData.intent;

  try {
    let setCookie: string | undefined;

    if (detailData.intent === "send-message") {
      const result = await withAuthenticatedApi(
        request,
        ["CLIENT", "AGENT", "ADMIN"],
        (token) => addTicketMessage(token, ticketId, detailData.payload),
      );
      setCookie = result.setCookie;

      return data(
        { ok: true as const, intent, message: result.data },
        { headers: mergeSetCookieHeaders(undefined, setCookie) },
      );
    } else if (detailData.intent === "change-status") {
      const result = await withAuthenticatedApi(
        request,
        ["CLIENT", "AGENT", "ADMIN"],
        (token) =>
          changeTicketStatus(token, ticketId, {
            status: detailData.payload.status as TicketStatus,
          }),
      );
      setCookie = result.setCookie;
    } else {
      const result = await withAuthenticatedApi(
        request,
        ["CLIENT", "AGENT", "ADMIN"],
        (token) => assignTicket(token, ticketId, detailData.payload),
      );
      setCookie = result.setCookie;
    }

    return data(
      { ok: true as const, intent },
      { headers: mergeSetCookieHeaders(undefined, setCookie) },
    );
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    if (error instanceof ApiError && error.status === 409) {
      return data(
        {
          ok: false as const,
          intent,
          error:
            "Ce ticket vient d'être pris par un autre agent. Les données ont été rafraîchies.",
          conflict: true,
        },
        { status: 409 },
      );
    }

    if (
      error instanceof ApiError &&
      error.status === 403 &&
      intent === "assign"
    ) {
      return data(
        {
          ok: false as const,
          intent,
          error: getErrorMessage(
            error,
            "Ce ticket est déjà assigné à un autre agent.",
          ),
        },
        { status: 403 },
      );
    }

    return data(
      {
        ok: false as const,
        intent,
        error: getErrorMessage(error, "Une erreur est survenue."),
      },
      { status: error instanceof ApiError ? error.status : 500 },
    );
  }
}
