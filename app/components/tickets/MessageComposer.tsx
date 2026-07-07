import { Loader2, Send } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import { Button } from "~/components/ui/Button";

type MessageComposerProps = {
  disabled?: boolean;
  disabledReason?: string;
  isSending?: boolean;
  pendingCount?: number;
  onSend: (content: string) => void;
};

export function MessageComposer({
  disabled = false,
  disabledReason,
  isSending = false,
  pendingCount = 0,
  onSend,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder =
    disabledReason ??
    (disabled ? "Envoi désactivé." : "Écrivez votre message...");

  const canSend = !disabled && content.trim().length > 0;

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setContent("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="shrink-0 border-t border-base-300/60 bg-base-100 p-4">
      {pendingCount > 0 ? (
        <div className="mb-3 flex items-center gap-2 text-xs text-base-content/60">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          <span>
            {pendingCount === 1
              ? "Envoi en cours…"
              : `${pendingCount} messages en cours d'envoi…`}
          </span>
        </div>
      ) : null}

      <div className="flex items-end gap-3">
        <div className="form-control min-w-0 flex-1">
          <label className="sr-only" htmlFor="message-content">
            Votre message
          </label>
          <textarea
            ref={textareaRef}
            id="message-content"
            name="content"
            rows={2}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="textarea textarea-bordered w-full resize-none rounded-2xl bg-base-200/50 text-sm leading-relaxed transition-colors focus:bg-base-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <p className="mt-1.5 hidden text-[11px] text-base-content/40 sm:block">
            Entrée pour envoyer · Maj+Entrée pour un saut de ligne
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className="btn-circle shrink-0"
          aria-label={isSending ? "Envoi en cours" : "Envoyer le message"}
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
