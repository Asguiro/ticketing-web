import { PersonAvatar } from "~/components/shared/PersonAvatar";
import { formatPersonName } from "~/lib/user-display";

type PersonCellProps = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  secondary?: string | null;
  fallback?: string;
};

export function PersonCell({
  email,
  firstName,
  lastName,
  secondary,
  fallback,
}: PersonCellProps) {
  const name = formatPersonName({ email, firstName, lastName });
  const secondaryLine = secondary ?? (name !== email ? email : fallback);

  return (
    <div className="cell-person">
      <PersonAvatar email={email} firstName={firstName} lastName={lastName} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-cell-primary" title={name}>
          {name}
        </p>
        {secondaryLine ? (
          <p className="truncate text-cell-secondary" title={secondaryLine}>
            {secondaryLine}
          </p>
        ) : null}
      </div>
    </div>
  );
}
