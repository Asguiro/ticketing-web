import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { PersonAvatar } from "~/components/shared/PersonAvatar";
import { ROLE_LABELS } from "~/lib/roles";
import type { TicketMessage } from "~/types/ticket";
import type { OptimisticMessage } from "~/components/tickets/useTicketMessageSend";

export type ChatDisplayMessage = TicketMessage & {
  deliveryStatus?: OptimisticMessage["status"];
  deliveryError?: string;
};

type MessageThreadProps = {
  messages: ChatDisplayMessage[];
  currentUserId: string;
  onRetryMessage?: (messageId: string) => void;
  onDismissMessage?: (messageId: string) => void;
};

function formatMessageTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageThread({
  messages,
  currentUserId,
  onRetryMessage,
  onDismissMessage,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageSignature = useMemo(
    () =>
      messages
        .map(
          (message) =>
            `${message.id}:${message.deliveryStatus ?? "sent"}:${message.content.length}`,
        )
        .join("|"),
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageSignature]);

  if (messages.length === 0) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center text-center"
        style={{ padding: "var(--msk-space-8) var(--msk-space-6)" }}
      >
        <div
          className="mb-3 flex items-center justify-center rounded-full bg-base-200"
          style={{ width: "3.5rem", height: "3.5rem" }}
        >
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-cell-primary">Aucun message</p>
        <p className="mt-1 text-cell-secondary">
          Démarrez la conversation en envoyant un premier message.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 space-y-4 overflow-y-auto"
      style={{ padding: "var(--msk-space-4) var(--msk-space-4)" }}
    >
      {messages.map((message) => {
        const isOwn = message.authorId === currentUserId;
        const authorEmail = message.author?.email ?? message.authorId;
        const authorRole = message.author?.role;
        const isSending = message.deliveryStatus === "sending";
        const isFailed = message.deliveryStatus === "failed";

        return (
          <div
            key={message.id}
            className={`flex gap-3 transition-opacity duration-200 ${
              isOwn ? "flex-row-reverse" : "flex-row"
            } ${isSending ? "opacity-80" : "opacity-100"}`}
          >
            <PersonAvatar email={authorEmail} />

            <div
              className={`flex max-w-[min(75%,28rem)] flex-col gap-1 ${
                isOwn ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${
                  isOwn ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <span className="text-cell-primary">
                  {isOwn ? "Vous" : authorEmail}
                </span>
                {authorRole && !isOwn ? (
                  <span className="text-col-header">{ROLE_LABELS[authorRole]}</span>
                ) : null}
              </div>

              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-200 ${
                  isOwn
                    ? `rounded-br-md text-primary-content ${
                        isFailed
                          ? "border border-error/40 bg-error/90"
                          : "bg-primary"
                      }`
                    : `rounded-bl-md border border-base-300/60 bg-base-100 text-base-content ${
                        isFailed ? "border-error/40" : ""
                      }`
                } ${isSending ? "animate-pulse" : ""}`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>

              <div
                className={`flex flex-wrap items-center gap-2 px-1 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <time dateTime={message.createdAt} className="text-cell-secondary">
                  {formatMessageTime(message.createdAt)}
                </time>

                {isSending ? (
                  <span className="inline-flex items-center gap-1 text-cell-secondary">
                    <Loader2 className="size-3 animate-spin" />
                    Envoi…
                  </span>
                ) : null}

                {isFailed ? (
                  <span className="inline-flex items-center gap-1 text-xs text-error">
                    <AlertCircle className="size-3" />
                    {message.deliveryError ?? "Échec de l'envoi"}
                  </span>
                ) : null}
              </div>

              {isFailed && isOwn ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1 text-error"
                    onClick={() => onRetryMessage?.(message.id)}
                  >
                    <RotateCcw className="size-3" />
                    Réessayer
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => onDismissMessage?.(message.id)}
                  >
                    Supprimer
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
