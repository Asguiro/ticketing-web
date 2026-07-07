export type Role = "CLIENT" | "AGENT" | "ADMIN";

export type User = {
  id: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

/** Utilisateur exposé à l'UI (sans données sensibles). */
export type SessionUser = Pick<User, "id" | "email" | "role">;

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type CreateUserInput = {
  email: string;
  password: string;
  role: Role;
};

export type UpdateUserInput = Partial<CreateUserInput>;
