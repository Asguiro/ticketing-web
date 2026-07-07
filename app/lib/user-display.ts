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
