type PersonLike = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export function formatPersonName(person: PersonLike): string {
  const fullName = [person.firstName, person.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || person.email;
}

export function getPersonInitials(person: PersonLike): string {
  const first = person.firstName?.trim();
  const last = person.lastName?.trim();

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  if (first) {
    return first.slice(0, 2).toUpperCase();
  }

  const localPart = person.email.split("@")[0] ?? person.email;
  const parts = localPart.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return localPart.slice(0, 2).toUpperCase();
}

const AVATAR_PALETTE = [
  "bg-primary/15 text-primary",
  "bg-secondary/15 text-secondary",
  "bg-accent/15 text-accent",
  "bg-info/15 text-info",
  "bg-success/15 text-success",
] as const;

export function getAvatarColorClass(email: string): string {
  let hash = 0;
  for (let index = 0; index < email.length; index += 1) {
    hash = email.charCodeAt(index) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
