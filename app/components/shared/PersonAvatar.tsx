import { formatPersonName, getAvatarColorClass, getPersonInitials } from "~/lib/user-display";

type PersonAvatarProps = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  size?: "sm" | "md";
};

export function PersonAvatar({
  email,
  firstName,
  lastName,
  size = "sm",
}: PersonAvatarProps) {
  const person = { email, firstName, lastName };
  const name = formatPersonName(person);
  const initials = getPersonInitials(person);
  const dimension =
    size === "sm"
      ? "size-[var(--msk-avatar-size)] text-xs"
      : "size-11 text-sm";
  const colorClass = getAvatarColorClass(email);

  return (
    <div className="avatar placeholder shrink-0">
      <div
        className={`flex items-center justify-center rounded-full font-semibold ${colorClass} ${dimension}`}
      >
        <span aria-hidden>{initials}</span>
        <span className="sr-only">{name}</span>
      </div>
    </div>
  );
}
