import { useEffect, useRef, useState, useCallback } from "react";
import type { Socket } from "socket.io-client";

import type { TicketMessage, TicketStatus } from "~/types/ticket";

type TicketChatConfig =
  | { enabled: false }
  | {
      enabled: true;
      wsUrl: string;
      accessToken: string;
    };

type UseTicketChatOptions = {
  ticketId: string;
  initialMessages: TicketMessage[];
  chat: TicketChatConfig;
  onTicketReopened?: (status: TicketStatus) => void;
};

type RealtimeState = {
  connected: boolean;
  joined: boolean;
  error: string | null;
};

const INITIAL_REALTIME: RealtimeState = {
  connected: false,
  joined: false,
  error: null,
};

const MAX_JOIN_ATTEMPTS = 8;
const JOIN_RETRY_MS = 250;

function scheduleJoinTicketRoom(
  socket: Socket,
  ticketId: string,
  onJoined: () => void,
): () => void {
  let attempts = 0;
  let joined = false;
  let joinTimer: ReturnType<typeof setInterval> | null = null;

  const tryJoin = () => {
    if (joined || !socket.connected || attempts >= MAX_JOIN_ATTEMPTS) {
      if (joinTimer) {
        clearInterval(joinTimer);
        joinTimer = null;
      }
      return;
    }

    attempts += 1;

    socket.emit(
      "joinTicket",
      { ticketId },
      (response: { ticketId?: string } | undefined) => {
        if (response?.ticketId === ticketId) {
          joined = true;
          onJoined();
          if (joinTimer) {
            clearInterval(joinTimer);
            joinTimer = null;
          }
        }
      },
    );
  };

  tryJoin();
  joinTimer = setInterval(tryJoin, JOIN_RETRY_MS);

  return () => {
    if (joinTimer) {
      clearInterval(joinTimer);
    }
  };
}

export function useTicketChat({
  ticketId,
  initialMessages,
  chat,
  onTicketReopened,
}: UseTicketChatOptions) {
  const [messages, setMessages] = useState(initialMessages);
  const [realtime, setRealtime] = useState<RealtimeState>(INITIAL_REALTIME);
  const seenIdsRef = useRef(new Set(initialMessages.map((message) => message.id)));
  const onTicketReopenedRef = useRef(onTicketReopened);
  const socketRef = useRef<Socket | null>(null);

  const chatEnabled = chat.enabled;
  const wsUrl = chat.enabled ? chat.wsUrl : null;
  const accessToken = chat.enabled ? chat.accessToken : null;

  useEffect(() => {
    onTicketReopenedRef.current = onTicketReopened;
  }, [onTicketReopened]);

  useEffect(() => {
    setMessages(initialMessages);
    seenIdsRef.current = new Set(initialMessages.map((message) => message.id));
  }, [initialMessages]);

  const appendMessage = useCallback((message: TicketMessage) => {
    if (message.ticketId !== ticketId) return;
    if (seenIdsRef.current.has(message.id)) return;
    seenIdsRef.current.add(message.id);
    setMessages((current) => [...current, message]);
  }, [ticketId]);

  useEffect(() => {
    if (!chatEnabled || !wsUrl || !accessToken) {
      setRealtime(INITIAL_REALTIME);
      return;
    }

    let cancelled = false;
    let stopJoinRetries: (() => void) | null = null;

    void import("socket.io-client").then(({ io }) => {
      if (cancelled) {
        return;
      }

      const socket: Socket = io(wsUrl, {
        auth: { token: accessToken },
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
      });
      socketRef.current = socket;

      const appendMessage = (message: TicketMessage) => {
        if (message.ticketId !== ticketId) return;
        if (seenIdsRef.current.has(message.id)) return;
        seenIdsRef.current.add(message.id);
        setMessages((current) => [...current, message]);
      };

      socket.on("connect", () => {
        setRealtime({ connected: true, joined: false, error: null });
        stopJoinRetries?.();
        stopJoinRetries = scheduleJoinTicketRoom(socket, ticketId, () => {
          setRealtime((current) => ({ ...current, joined: true }));
        });
      });

      socket.on("disconnect", () => {
        setRealtime((current) => ({
          ...current,
          connected: false,
          joined: false,
        }));
        stopJoinRetries?.();
        stopJoinRetries = null;
      });

      socket.on("connect_error", () => {
        setRealtime({
          connected: false,
          joined: false,
          error:
            "Connexion temps réel impossible. Vérifiez que l'API est démarrée.",
        });
      });

      socket.on("message:created", (message: TicketMessage) => {
        appendMessage(message);
      });

      socket.on(
        "ticket:reopened",
        (payload: { ticketId: string; status: TicketStatus }) => {
          if (payload.ticketId === ticketId) {
            onTicketReopenedRef.current?.(payload.status);
          }
        },
      );
    });

    return () => {
      cancelled = true;
      stopJoinRetries?.();
      const socket = socketRef.current;
      if (socket) {
        socket.emit("leaveTicket", { ticketId });
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [chatEnabled, wsUrl, accessToken, ticketId]);

  return {
    messages,
    appendMessage,
    isConnected: realtime.connected && realtime.joined,
    connectionError: realtime.error,
    isRealtime: chatEnabled,
  };
}
