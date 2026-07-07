import type { TicketStatusHistoryEntry } from "~/types/ticket";

import { PersonCell } from "~/components/shared/PersonCell";
import { StatusBadge } from "./StatusBadge";

type StatusHistoryTimelineProps = {
  history: TicketStatusHistoryEntry[];
};

export function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-box border border-base-300/60 bg-base-200/40 p-4 text-page-desc">
        Aucun historique disponible.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {history.map((entry) => (
        <li
          key={entry.id}
          className="rounded-box border border-base-300/60 bg-base-200/30 p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            {entry.fromStatus ? (
              <StatusBadge status={entry.fromStatus} variant="pill" />
            ) : (
              <span className="text-cell-secondary">—</span>
            )}
            <span className="text-cell-secondary">→</span>
            <StatusBadge status={entry.toStatus} variant="pill" />
          </div>
          <div className="mt-3">
            {entry.changedBy ? (
              <PersonCell
                email={entry.changedBy.email}
                secondary={new Date(entry.changedAt).toLocaleString("fr-FR")}
              />
            ) : (
              <p className="text-cell-secondary">
                {entry.changedById} ·{" "}
                {new Date(entry.changedAt).toLocaleString("fr-FR")}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
