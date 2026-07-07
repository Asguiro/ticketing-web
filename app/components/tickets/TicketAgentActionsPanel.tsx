import { Headphones } from "lucide-react";

import { StatusTransitionButtons } from "~/components/tickets/StatusTransitionButtons";
import { TicketSelfAssignButton } from "~/components/tickets/TicketSelfAssignButton";
import { TicketStatusWorkflow } from "~/components/tickets/TicketStatusWorkflow";
import { StatusBadge } from "~/components/tickets/StatusBadge";
import { isAdmin, isAgent } from "~/lib/roles";
import type { TicketStatus } from "~/types/ticket";
import type { Role } from "~/types/user";

type TicketAgentActionsPanelProps = {
  userRole: Role;
  userId: string;
  currentStatus: TicketStatus;
  assignedAgentId: string | null;
  allowedStatuses: TicketStatus[];
  onStatusChange?: (status: TicketStatus) => void;
};

export function TicketAgentActionsPanel({
  userRole,
  userId,
  currentStatus,
  assignedAgentId,
  allowedStatuses,
  onStatusChange,
}: TicketAgentActionsPanelProps) {
  const showSelfAssign = isAgent(userRole) && !assignedAgentId;
  const showTransitions =
    isAdmin(userRole) || (isAgent(userRole) && assignedAgentId === userId);

  if (!showSelfAssign && !showTransitions) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-box border border-base-300/60 bg-base-100 shadow-md">
      <div className="border-b border-base-300/60 bg-linear-to-r from-primary/6 via-transparent to-transparent px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Headphones className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-base-content">
                Actions agent
              </h2>
              <p className="text-xs text-base-content/55">
                Suivez l&apos;avancement et faites évoluer le ticket
              </p>
            </div>
          </div>
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      <div className="space-y-6 p-5">
        <TicketStatusWorkflow currentStatus={currentStatus} />

        {showSelfAssign ? <TicketSelfAssignButton /> : null}

        {showTransitions ? (
          <StatusTransitionButtons
            currentStatus={currentStatus}
            allowedStatuses={allowedStatuses}
            onStatusChange={onStatusChange}
          />
        ) : null}
      </div>
    </section>
  );
}
