import type { ReactNode } from "react";
import { Mail } from "lucide-react";

import { ListingPanel } from "~/components/shared/ListingTableShell";
import { Pagination } from "~/components/shared/Pagination";
import { PersonCell } from "~/components/shared/PersonCell";
import { RoleBadge } from "~/components/users/RoleBadge";
import { formatDateShort } from "~/lib/date-format";
import type { PaginatedResult } from "~/types/api";
import type { User } from "~/types/user";

type UserTableProps = {
  users: User[];
  pagination: PaginatedResult<User>["pagination"];
  toolbar?: ReactNode;
};

export function UserTable({ users, pagination, toolbar }: UserTableProps) {
  if (users.length === 0) {
    return (
      <ListingPanel
        toolbar={toolbar}
        isEmpty
        emptyIcon={
          <div className="rounded-full bg-base-200/80 p-4">
            <Mail className="size-7 text-base-content/25" />
          </div>
        }
        emptyTitle="Aucun utilisateur trouvé"
        emptyDescription="Aucun compte ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <ListingPanel
      toolbar={toolbar}
      footer={
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="utilisateurs"
          embedded
        />
      }
    >
      <div
        className="w-full border-b border-base-300/40"
        style={{ padding: "0.625rem var(--msk-space-4)" }}
      >
        <p className="text-sm text-base-content/55">
          <span className="font-medium text-base-content">{pagination.total}</span>{" "}
          utilisateur{pagination.total > 1 ? "s" : ""}
        </p>
      </div>

      <table className="listing-table">
        <colgroup>
          <col style={{ width: "52%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "26%" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="text-col-header">Utilisateur</th>
            <th className="text-col-header">Rôle</th>
            <th className="text-col-header">Créé le</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <PersonCell email={user.email} />
              </td>
              <td>
                <div className="cell-content">
                  <RoleBadge role={user.role} variant="pill" />
                </div>
              </td>
              <td>
                <div className="cell-content">
                  <span className="cell-date">
                    {user.createdAt ? formatDateShort(user.createdAt) : "—"}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ListingPanel>
  );
}
