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

export function TicketFilters({ user, filters, agents = [] }: TicketFiltersProps) {
  const adminView = isAdmin(user.role);

  return (
    <Form method="get" className="card bg-base-100 shadow-md">
      <div className="card-body gap-5">
        {adminView ? (
          <p className="text-sm text-base-content/60">
            Filtrez l&apos;ensemble des tickets par statut, priorité ou agent assigné.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="flex flex-wrap items-center gap-3 border-t border-base-300/60 pt-4">
          <button type="submit" className="btn btn-primary">
            Appliquer les filtres
          </button>
          <Link to="/tickets" className="btn btn-ghost">
            Réinitialiser
          </Link>
        </div>
      </div>
    </Form>
  );
}
