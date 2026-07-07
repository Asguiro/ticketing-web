import { Form, Link } from "react-router";

import { Select } from "~/components/ui/Select";
import type { Role } from "~/types/user";

type UserFiltersProps = {
  filters: { role?: Role };
  embedded?: boolean;
};

const roleOptions = [
  { value: "", label: "Tous les rôles" },
  { value: "CLIENT", label: "Client" },
  { value: "AGENT", label: "Agent" },
  { value: "ADMIN", label: "Administrateur" },
];

export function UserFilters({ filters, embedded = false }: UserFiltersProps) {
  const formContent = (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-sm">
        <Select
          name="role"
          label="Rôle"
          defaultValue={filters.role ?? ""}
          options={roleOptions}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="submit" className="btn btn-primary btn-sm">
          Appliquer
        </button>
        <Link to="/users" className="btn btn-ghost btn-sm">
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
