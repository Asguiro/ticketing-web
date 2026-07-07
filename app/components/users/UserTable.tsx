import { Mail } from "lucide-react";

import { Pagination } from "~/components/shared/Pagination";
import { RoleBadge } from "~/components/users/RoleBadge";
import { formatDateShort } from "~/lib/date-format";
import type { PaginatedResult } from "~/types/api";
import type { User } from "~/types/user";

type UserTableProps = {
  users: User[];
  pagination: PaginatedResult<User>["pagination"];
};

function getInitials(email: string): string {
  const localPart = email.split("@")[0] ?? email;
  const parts = localPart.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return localPart.slice(0, 2).toUpperCase();
}

export function UserTable({ users, pagination }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body items-center text-center text-sm text-base-content/60">
          Aucun utilisateur trouvé.
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Créé le</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(user.email)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Mail className="size-3.5 shrink-0 text-base-content/40" />
                        <span className="truncate">{user.email}</span>
                      </p>
                      <p className="text-xs text-base-content/50">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <RoleBadge role={user.role} />
                </td>
                <td className="text-base-content/70">
                  {formatDateShort(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-body border-t border-base-300/60 pt-0">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="utilisateurs"
        />
      </div>
    </div>
  );
}
