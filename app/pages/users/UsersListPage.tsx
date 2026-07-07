import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { Plus, Shield, UserCog, Users } from "lucide-react";

import { PageHeader } from "~/components/shared/PageHeader";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { PageLoadingSkeleton } from "~/components/shared/PageLoadingSkeleton";
import { UserFilters } from "~/components/users/UserFilters";
import { UserTable } from "~/components/users/UserTable";
import { ROLE_LABELS } from "~/lib/roles";
import { usersListLoader } from "~/server/users/loaders/user.server";
import type { Role, User } from "~/types/user";

export async function loader(args: LoaderFunctionArgs) {
  return usersListLoader(args);
}

function countByRole(users: User[], role: Role): number {
  return users.filter((user) => user.role === role).length;
}

export default function UsersListPage() {
  const { users, filters, pagination } = useLoaderData<typeof loader>();

  const roleCounts = {
    client: countByRole(users, "CLIENT"),
    agent: countByRole(users, "AGENT"),
    admin: countByRole(users, "ADMIN"),
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Utilisateurs"
        description="Gestion des comptes client, agent et administrateur."
        actions={
          <Link to="/users/new" className="btn btn-primary gap-2">
            <Plus className="size-4" />
            Nouvel utilisateur
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat stat-card">
          <div className="stat-figure text-primary">
            <Users className="size-6" />
          </div>
          <div className="text-stat-label">Total</div>
          <div className="text-stat-value text-base-content">{pagination.total}</div>
          <div className="stat-card-desc">comptes enregistrés</div>
        </div>
        <div className="stat stat-card">
          <div className="stat-figure text-info">
            <Users className="size-6" />
          </div>
          <div className="text-stat-label">{ROLE_LABELS.CLIENT}s</div>
          <div className="text-stat-value text-info">{roleCounts.client}</div>
          <div className="stat-card-desc">sur cette page</div>
        </div>
        <div className="stat stat-card">
          <div className="stat-figure text-secondary">
            <UserCog className="size-6" />
          </div>
          <div className="text-stat-label">{ROLE_LABELS.AGENT}s</div>
          <div className="text-stat-value text-secondary">{roleCounts.agent}</div>
          <div className="stat-card-desc">sur cette page</div>
        </div>
        <div className="stat stat-card">
          <div className="stat-figure text-primary">
            <Shield className="size-6" />
          </div>
          <div className="text-stat-label">{ROLE_LABELS.ADMIN}s</div>
          <div className="text-stat-value text-base-content">{roleCounts.admin}</div>
          <div className="stat-card-desc">sur cette page</div>
        </div>
      </div>

      <UserTable
        users={users}
        pagination={pagination}
        toolbar={<UserFilters filters={filters} embedded />}
      />
    </div>
  );
}

export function HydrateFallback() {
  return <PageLoadingSkeleton variant="table" />;
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
