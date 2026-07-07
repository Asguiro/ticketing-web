import type { TicketStatusHistoryEntry } from "~/types/ticket";

import { StatusBadge } from "./StatusBadge";

type StatusHistoryTimelineProps = {
  history: TicketStatusHistoryEntry[];
};

export function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-box border border-base-300/60 bg-base-200/40 p-4 text-sm text-base-content/60">
        Aucun historique disponible.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {history.map((entry) => (
        <li
          key={entry.id}
          className="rounded-box border border-base-300/60 bg-base-200/30 p-4 text-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            {entry.fromStatus ? (
              <StatusBadge status={entry.fromStatus} />
            ) : (
              <span className="text-base-content/40">—</span>
            )}
            <span className="text-base-content/30">→</span>
            <StatusBadge status={entry.toStatus} />
          </div>
          <p className="mt-2 text-xs text-base-content/50">
            {entry.changedBy?.email ?? entry.changedById} ·{" "}
            {new Date(entry.changedAt).toLocaleString("fr-FR")}
          </p>
        </li>
      ))}
    </ol>
  );
}
