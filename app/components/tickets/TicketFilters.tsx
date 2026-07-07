import { Form, Link } from "react-router";

import { Select } from "~/components/ui/Select";
import {
  PRIORITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "~/lib/ticket-labels";
import { isAdmin, isAgent } from "~/lib/roles";
import type { TicketListParams } from "~/types/ticket";
import type { SessionUser, User } from "~/types/user";

type TicketFiltersProps = {
  user: SessionUser;
  filters: TicketListParams;
  agents?: User[];
  embedded?: boolean;
};

const sortByOptions = [
  { value: "", label: "Tri par défaut" },
  { value: "createdAt", label: "Date de création" },
  { value: "updatedAt", label: "Dernière mise à jour" },
  { value: "priority", label: "Priorité" },
];

const sortOrderOptions = [
  { value: "desc", label: "Décroissant" },
  { value: "asc", label: "Croissant" },
];

const agentPoolOptions = [
  { value: "", label: "Mes tickets + pool non assigné" },
  { value: "mine", label: "Uniquement mes tickets assignés" },
  { value: "unassigned", label: "Pool non assigné" },
];

function getAgentPoolValue(filters: TicketListParams): string {
  if (filters.unassignedOnly) return "unassigned";
  if (filters.includeUnassigned === false) return "mine";
  return "";
}

export function TicketFilters({
  user,
  filters,
  agents = [],
  embedded = false,
}: TicketFiltersProps) {
  const formContent = (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <Select
          name="status"
          label="Statut"
          defaultValue={filters.status ?? ""}
          options={STATUS_FILTER_OPTIONS}
        />
        <Select
          name="priority"
          label="Priorité"
          defaultValue={filters.priority ?? ""}
          options={PRIORITY_FILTER_OPTIONS}
        />
        {isAgent(user.role) ? (
          <Select
            name="pool"
            label="Périmètre"
            defaultValue={getAgentPoolValue(filters)}
            options={agentPoolOptions}
          />
        ) : null}
        {isAdmin(user.role) ? (
          <Select
            name="agent"
            label="Agent assigné"
            defaultValue={filters.assignedAgentId ?? ""}
            options={[
              { value: "", label: "Tous les agents" },
              { value: "__unassigned__", label: "Non assigné" },
              ...agents.map((agent) => ({
                value: agent.id,
                label: agent.email,
              })),
            ]}
          />
        ) : null}
        <Select
          name="sortBy"
          label="Trier par"
          defaultValue={filters.sortBy ?? "createdAt"}
          options={sortByOptions}
        />
        <Select
          name="sortOrder"
          label="Ordre"
          defaultValue={filters.sortOrder ?? "desc"}
          options={sortOrderOptions}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="submit" className="btn btn-primary btn-sm">
          Appliquer
        </button>
        <Link to="/tickets" className="btn btn-ghost btn-sm">
          Réinitialiser
        </Link>
      </div>
    </>
  );

  if (embedded) {
    return (
      <Form method="get" className="w-full">
        {formContent}
      </Form>
    );
  }

  return (
    <Form method="get" className="panel-section w-full">
      <div className="panel-section-body">{formContent}</div>
    </Form>
  );
}
