import { Headphones } from "lucide-react";

import { PanelSection } from "~/components/shared/PanelSection";
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
    <PanelSection
      title="Actions agent"
      description="Suivez l'avancement et faites évoluer le ticket"
      actions={<StatusBadge status={currentStatus} variant="pill" />}
      headerClassName="bg-linear-to-r from-primary/6 via-transparent to-transparent"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Headphones className="size-4.5" />
        </div>
        <p className="text-page-desc">
          Utilisez le workflow ci-dessous pour faire progresser le ticket.
        </p>
      </div>

      <div className="space-y-6">
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
    </PanelSection>
  );
}
