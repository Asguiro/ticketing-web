import { Form, Link } from "react-router";
import { Filter } from "lucide-react";

import { Select } from "~/components/ui/Select";
import type { Role } from "~/types/user";

type UserFiltersProps = {
  filters: { role?: Role };
  total: number;
};

const roleOptions = [
  { value: "", label: "Tous les rôles" },
  { value: "CLIENT", label: "Client" },
  { value: "AGENT", label: "Agent" },
  { value: "ADMIN", label: "Administrateur" },
];

export function UserFilters({ filters, total }: UserFiltersProps) {
  return (
    <Form method="get" className="card bg-base-100 shadow-md">
      <div className="card-body gap-5">
        <div className="flex items-center gap-2 text-sm font-medium text-base-content/70">
          <Filter className="size-4" />
          Filtrer les utilisateurs
          <span className="badge badge-ghost">{total} résultat{total > 1 ? "s" : ""}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-md">
          <Select
            name="role"
            label="Rôle"
            defaultValue={filters.role ?? ""}
            options={roleOptions}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-base-300/60 pt-4">
          <button type="submit" className="btn btn-primary">
            Appliquer les filtres
          </button>
          <Link to="/users" className="btn btn-ghost">
            Réinitialiser
          </Link>
        </div>
      </div>
    </Form>
  );
}
