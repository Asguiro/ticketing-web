import { Badge } from "~/components/ui/Badge";
import { STATUS_LABELS } from "~/lib/ticket-labels";
import {
  getWorkflowStepState,
  WORKFLOW_STEP_COLORS,
  WORKFLOW_STEPS,
} from "~/lib/ticket-status-ui";
import type { TicketStatus } from "~/types/ticket";

type TicketStatusWorkflowProps = {
  currentStatus: TicketStatus;
};

export function TicketStatusWorkflow({ currentStatus }: TicketStatusWorkflowProps) {
  const isReopened = currentStatus === "REOPENED";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-col-header">Progression</p>
        {isReopened ? <Badge variant="accent">Réouvert</Badge> : null}
      </div>

      <div className="relative flex items-start justify-between gap-1">
        {WORKFLOW_STEPS.map((step, index) => {
          const state = getWorkflowStepState(step, currentStatus);
          const isLast = index === WORKFLOW_STEPS.length - 1;

          return (
            <div key={step} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="relative flex w-full items-center justify-center">
                {!isLast ? (
                  <div
                    className={`absolute left-1/2 top-3.5 h-0.5 w-full transition-colors duration-300 ${
                      state === "completed" ? "bg-primary/40" : "bg-base-300"
                    }`}
                    aria-hidden
                  />
                ) : null}

                <div
                  className={`relative z-10 flex size-7 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                    state === "completed"
                      ? `${WORKFLOW_STEP_COLORS[step]} text-white shadow-sm`
                      : state === "current"
                        ? `ring-4 ring-primary/20 ${WORKFLOW_STEP_COLORS[step]} text-white shadow-md scale-110`
                        : "border-2 border-base-300 bg-base-100 text-base-content/40"
                  }`}
                >
                  {state === "completed" ? (
                    <svg
                      className="size-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>

              <p
                className={`mt-2 max-w-[4.5rem] text-center text-[10px] leading-tight sm:max-w-none sm:text-xs ${
                  state === "current"
                    ? "font-semibold text-base-content"
                    : state === "completed"
                      ? "font-medium text-base-content/70"
                      : "text-base-content/40"
                }`}
              >
                {STATUS_LABELS[step]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
