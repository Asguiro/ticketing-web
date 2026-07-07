import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Select } from "~/components/ui/Select";
import { ROLE_LABELS } from "~/lib/roles";
import type { Role, User } from "~/types/user";

type FieldErrors = Partial<Record<"email" | "password" | "role", string>>;

type UserRowActionsProps = {
  user: User;
  currentUserId: string;
};

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "CLIENT", label: ROLE_LABELS.CLIENT },
  { value: "AGENT", label: ROLE_LABELS.AGENT },
  { value: "ADMIN", label: ROLE_LABELS.ADMIN },
];

function getFetcherError(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("error" in data)) {
    return undefined;
  }

  return String(data.error);
}

function getFetcherErrors(data: unknown): FieldErrors | undefined {
  if (!data || typeof data !== "object" || !("errors" in data)) {
    return undefined;
  }

  return data.errors as FieldErrors;
}

function isFetcherSuccess(data: unknown): boolean {
  return Boolean(
    data && typeof data === "object" && "ok" in data && data.ok === true,
  );
}

export function UserRowActions({ user, currentUserId }: UserRowActionsProps) {
  const editFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const isSelf = user.id === currentUserId;

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<Role>(user.role);
  const [password, setPassword] = useState("");

  const isEditing = editFetcher.state !== "idle";
  const isDeleting = deleteFetcher.state !== "idle";

  useEffect(() => {
    if (editFetcher.state !== "idle") {
      return;
    }

    if (isFetcherSuccess(editFetcher.data)) {
      setEditing(false);
      setPassword("");
    }
  }, [editFetcher.state, editFetcher.data]);

  useEffect(() => {
    if (deleteFetcher.state !== "idle") {
      return;
    }

    if (isFetcherSuccess(deleteFetcher.data)) {
      setConfirmDelete(false);
    }
  }, [deleteFetcher.state, deleteFetcher.data]);

  function openEdit() {
    setEmail(user.email);
    setRole(user.role);
    setPassword("");
    setEditing(true);
  }

  function closeEdit() {
    if (isEditing) return;
    setEditing(false);
    setPassword("");
  }

  function closeDelete() {
    if (isDeleting) return;
    setConfirmDelete(false);
  }

  const editError = getFetcherError(editFetcher.data);
  const editErrors = getFetcherErrors(editFetcher.data);
  const deleteError = getFetcherError(deleteFetcher.data);

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          aria-label={`Modifier ${user.email}`}
          onClick={openEdit}
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
          aria-label={`Supprimer ${user.email}`}
          onClick={() => setConfirmDelete(true)}
          disabled={isSelf}
          title={isSelf ? "Vous ne pouvez pas supprimer votre propre compte." : undefined}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {editing ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="text-lg font-semibold">Modifier l&apos;utilisateur</h3>
            <p className="mt-1 text-sm text-base-content/60">{user.email}</p>

            {editError ? (
              <div className="alert alert-error mt-4 text-sm">{editError}</div>
            ) : null}

            <editFetcher.Form method="post" className="mt-6 space-y-4">
              <input type="hidden" name="intent" value="update_user" />
              <input type="hidden" name="userId" value={user.id} />

              <Input
                name="email"
                type="email"
                label="Adresse email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={editErrors?.email}
                autoComplete="email"
                required
              />

              <Select
                name="role"
                label="Rôle"
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                error={editErrors?.role}
                options={ROLE_OPTIONS}
              />

              <Input
                name="password"
                type="password"
                label="Nouveau mot de passe"
                placeholder="Laisser vide pour ne pas modifier"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={editErrors?.password}
                autoComplete="new-password"
              />

              <div className="modal-action mt-6">
                <Button type="button" variant="ghost" onClick={closeEdit} disabled={isEditing}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isEditing}>
                  {isEditing ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </editFetcher.Form>
          </div>
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Fermer"
            onClick={closeEdit}
          />
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-semibold">Supprimer l&apos;utilisateur</h3>
            <p className="mt-3 text-sm text-base-content/70">
              Cette action est irréversible. Le compte{" "}
              <span className="font-medium text-base-content">{user.email}</span>{" "}
              sera définitivement supprimé.
            </p>

            {deleteError ? (
              <div className="alert alert-error mt-4 text-sm">{deleteError}</div>
            ) : null}

            <deleteFetcher.Form method="post" className="modal-action mt-6">
              <input type="hidden" name="intent" value="delete_user" />
              <input type="hidden" name="userId" value={user.id} />
              <Button type="button" variant="ghost" onClick={closeDelete} disabled={isDeleting}>
                Annuler
              </Button>
              <Button type="submit" variant="danger" disabled={isDeleting}>
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Button>
            </deleteFetcher.Form>
          </div>
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Fermer"
            onClick={closeDelete}
          />
        </div>
      ) : null}
    </>
  );
}
