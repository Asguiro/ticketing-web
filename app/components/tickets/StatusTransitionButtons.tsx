import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { getTransitionMeta } from "~/lib/ticket-status-ui";
import type { TicketStatus } from "~/types/ticket";

type StatusTransitionButtonsProps = {
  currentStatus: TicketStatus;
  allowedStatuses: TicketStatus[];
  onStatusChange?: (status: TicketStatus) => void;
};

export function StatusTransitionButtons({
  currentStatus,
  allowedStatuses,
  onStatusChange,
}: StatusTransitionButtonsProps) {
  const fetcher = useFetcher();
  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);

  useEffect(() => {
    if (fetcher.state === "submitting" && fetcher.formData) {
      const status = fetcher.formData.get("status");
      if (typeof status === "string") {
        setPendingStatus(status as TicketStatus);
      }
      return;
    }

    if (fetcher.state === "idle") {
      setPendingStatus(null);
    }
  }, [fetcher.state, fetcher.formData]);

  if (allowedStatuses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/30 px-5 py-6 text-center">
        <p className="text-sm font-medium text-base-content/70">
          Aucune action disponible
        </p>
        <p className="mt-1 text-xs text-base-content/50">
          Le ticket est au statut « {currentStatus} » — aucune transition
          manuelle n&apos;est possible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
        Actions disponibles
      </p>

      <div
        className={`grid gap-3 ${
          allowedStatuses.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {allowedStatuses.map((status) => {
          const meta = getTransitionMeta(status);
          const Icon = meta.icon;
          const isLoading =
            pendingStatus === status && fetcher.state !== "idle";

          return (
            <fetcher.Form
              key={status}
              method="post"
              onSubmit={() => {
                setPendingStatus(status);
                onStatusChange?.(status);
              }}
              className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${meta.accentClass} ${
                isLoading ? "pointer-events-none opacity-80" : ""
              }`}
            >
              <input type="hidden" name="intent" value="change-status" />
              <input type="hidden" name="status" value={status} />

              <div className="flex items-start gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${meta.iconBgClass}`}
                >
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="font-semibold text-base-content">{meta.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-base-content/60">
                      {meta.description}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={fetcher.state !== "idle"}
                    className={`btn btn-sm w-full gap-2 border-0 shadow-sm ${meta.buttonClass}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Mise à jour…
                      </>
                    ) : (
                      <>
                        Passer à {meta.label.toLowerCase()}
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </fetcher.Form>
          );
        })}
      </div>
    </div>
  );
}
