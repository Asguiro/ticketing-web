import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import type { TicketMessage } from "~/types/ticket";
import type { SessionUser } from "~/types/user";

export type OptimisticMessage = {
  tempId: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  status: "sending" | "failed";
  error?: string;
};

type SendMessageActionResult =
  | { ok: true; intent: "send-message"; message?: TicketMessage }
  | {
      ok: false;
      intent?: string;
      error?: string;
      errors?: Record<string, string>;
    };

type QueuedSend = {
  tempId: string;
  content: string;
};

type UseTicketMessageSendOptions = {
  ticketId: string;
  user: SessionUser;
  onMessageConfirmed: (message: TicketMessage) => void;
};

function createTempId() {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useTicketMessageSend({
  ticketId,
  user,
  onMessageConfirmed,
}: UseTicketMessageSendOptions) {
  const fetcher = useFetcher<SendMessageActionResult>();
  const [optimistic, setOptimistic] = useState<OptimisticMessage[]>([]);
  const queueRef = useRef<QueuedSend[]>([]);
  const activeTempIdRef = useRef<string | null>(null);
  const onMessageConfirmedRef = useRef(onMessageConfirmed);

  useEffect(() => {
    onMessageConfirmedRef.current = onMessageConfirmed;
  }, [onMessageConfirmed]);

  const submitNext = useCallback(() => {
    if (fetcher.state !== "idle" || queueRef.current.length === 0) {
      return;
    }

    const next = queueRef.current.shift();
    if (!next) return;

    activeTempIdRef.current = next.tempId;

    const formData = new FormData();
    formData.set("intent", "send-message");
    formData.set("content", next.content);
    fetcher.submit(formData, { method: "post" });
  }, [fetcher]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const tempId = createTempId();

      setOptimistic((current) => [
        ...current,
        {
          tempId,
          ticketId,
          authorId: user.id,
          content: trimmed,
          createdAt: new Date().toISOString(),
          status: "sending",
        },
      ]);

      queueRef.current.push({ tempId, content: trimmed });
      submitNext();
    },
    [submitNext, ticketId, user.id],
  );

  const retryMessage = useCallback(
    (tempId: string) => {
      const entry = optimistic.find((message) => message.tempId === tempId);
      if (!entry) return;

      setOptimistic((current) =>
        current.filter((message) => message.tempId !== tempId),
      );
      sendMessage(entry.content);
    },
    [optimistic, sendMessage],
  );

  const dismissFailedMessage = useCallback((tempId: string) => {
    setOptimistic((current) =>
      current.filter((message) => message.tempId !== tempId),
    );
  }, []);

  useEffect(() => {
    if (fetcher.state !== "idle") return;

    const result = fetcher.data;
    const activeTempId = activeTempIdRef.current;
    if (!result || !activeTempId) return;

    activeTempIdRef.current = null;

    if (result.ok && result.intent === "send-message") {
      setOptimistic((current) =>
        current.filter((message) => message.tempId !== activeTempId),
      );

      if (result.message) {
        onMessageConfirmedRef.current(result.message);
      }
    } else if (!result.ok) {
      setOptimistic((current) =>
        current.map((message) =>
          message.tempId === activeTempId
            ? {
                ...message,
                status: "failed",
                error:
                  result.error ??
                  result.errors?.content ??
                  "Impossible d'envoyer le message.",
              }
            : message,
        ),
      );
    }

    submitNext();
  }, [fetcher.state, fetcher.data, submitNext]);

  const pendingCount = optimistic.filter(
    (message) => message.status === "sending",
  ).length;

  return {
    optimistic,
    sendMessage,
    retryMessage,
    dismissFailedMessage,
    isSending: fetcher.state !== "idle",
    pendingCount,
  };
}
