import { useCallback, useMemo, useState } from "react";

import { Badge } from "~/components/ui/Badge";
import { MessageComposer } from "~/components/tickets/MessageComposer";
import { MessageThread } from "~/components/tickets/MessageThread";
import { useTicketChat } from "~/components/tickets/useTicketChat";
import { useTicketMessageSend } from "~/components/tickets/useTicketMessageSend";
import { isAgent, isAdmin } from "~/lib/roles";
import {
  canSendTicketMessage,
  getTicketMessageDisabledReason,
} from "~/lib/ticket-message-permissions";
import type { TicketMessage, TicketStatus } from "~/types/ticket";
import type { SessionUser } from "~/types/user";

type TicketChatSectionProps = {
  ticketId: string;
  ticketClientId: string;
  assignedAgentId: string | null;
  initialMessages: TicketMessage[];
  initialStatus: TicketStatus;
  user: SessionUser;
  chat:
    | { enabled: false }
    | {
        enabled: true;
        wsUrl: string;
        accessToken: string;
      };
  onStatusChange?: (status: TicketStatus) => void;
};

export function TicketChatSection({
  ticketId,
  ticketClientId,
  assignedAgentId,
  initialMessages,
  initialStatus,
  user,
  chat,
  onStatusChange,
}: TicketChatSectionProps) {
  const [ticketStatus, setTicketStatus] = useState(initialStatus);
  const ticketContext = {
    clientId: ticketClientId,
    assignedAgentId,
    status: ticketStatus,
  };
  const canSend = canSendTicketMessage(user, ticketContext);
  const disabledReason = getTicketMessageDisabledReason(user, ticketContext);

  const { messages, appendMessage, isConnected, connectionError, isRealtime } =
    useTicketChat({
      ticketId,
      initialMessages,
      chat,
      onTicketReopened: (status) => {
        setTicketStatus(status);
        onStatusChange?.(status);
      },
    });

  const handleMessageConfirmed = useCallback(
    (message: TicketMessage) => {
      appendMessage(message);
    },
    [appendMessage],
  );

  const {
    optimistic,
    sendMessage,
    retryMessage,
    dismissFailedMessage,
    isSending,
    pendingCount,
  } = useTicketMessageSend({
    ticketId,
    user,
    onMessageConfirmed: handleMessageConfirmed,
  });

  const displayMessages = useMemo(() => {
    const confirmedOptimisticIds = new Set(
      optimistic
        .filter((pending) => pending.status === "sending")
        .filter((pending) =>
          messages.some(
            (message) =>
              message.authorId === pending.authorId &&
              message.content === pending.content &&
              new Date(message.createdAt).getTime() >=
                new Date(pending.createdAt).getTime() - 1000,
          ),
        )
        .map((pending) => pending.tempId),
    );

    const optimisticMessages = optimistic
      .filter((message) => !confirmedOptimisticIds.has(message.tempId))
      .map((message) => ({
        id: message.tempId,
        ticketId: message.ticketId,
        authorId: message.authorId,
        content: message.content,
        createdAt: message.createdAt,
        author: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        deliveryStatus: message.status,
        deliveryError: message.error,
      }));

    return [...messages, ...optimisticMessages];
  }, [messages, optimistic, user.email, user.id, user.role]);

  const connectionBadge = isRealtime ? (
    isConnected ? (
      <Badge variant="success">Temps réel actif</Badge>
    ) : connectionError ? (
      <Badge variant="error">{connectionError}</Badge>
    ) : (
      <Badge variant="neutral">Connexion…</Badge>
    )
  ) : null;

  return (
    <section className="panel-section">
      <div className="panel-section-header">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="panel-section-title">Discussion</h2>
            <p className="panel-section-desc">
              Échangez avec{" "}
              {isAgent(user.role) || isAdmin(user.role) ? "le client" : "l'équipe support"}
            </p>
          </div>
          {connectionBadge}
        </div>
        {ticketStatus === "REOPENED" ? (
          <p className="mt-3 text-cell-secondary text-warning">
            Ce ticket a été réouvert suite à votre message.
          </p>
        ) : null}
      </div>
      <div className="flex min-h-[28rem] flex-col bg-base-200/30">
        <MessageThread
          messages={displayMessages}
          currentUserId={user.id}
          onRetryMessage={retryMessage}
          onDismissMessage={dismissFailedMessage}
        />
        <MessageComposer
          disabled={!canSend}
          disabledReason={disabledReason ?? undefined}
          isSending={isSending}
          pendingCount={pendingCount}
          onSend={sendMessage}
        />
      </div>
    </section>
  );
}
