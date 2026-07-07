import { apiRequest } from "./api-client.server";
import { normalizePaginatedResponse } from "./api-mappers.server";

import type { PaginatedResult } from "~/types/api";
import type {
  CreateUserInput,
  Role,
  UpdateUserInput,
  User,
} from "~/types/user";

export type UserListParams = {
  role?: Role;
  page?: number;
  pageSize?: number;
  limit?: number;
};

function mapUserListParams(params: UserListParams) {
  return {
    role: params.role,
    page: params.page,
    pageSize: params.pageSize ?? params.limit ?? 20,
  };
}

export async function getUsers(
  accessToken: string,
  params: UserListParams = {},
) {
  const response = await apiRequest<unknown>("/users", {
    method: "GET",
    accessToken,
    params: mapUserListParams(params),
  });

  return normalizePaginatedResponse<User>(response);
}

export function getUserById(accessToken: string, userId: string) {
  return apiRequest<User>(`/users/${userId}`, {
    method: "GET",
    accessToken,
  });
}

export function createUser(accessToken: string, input: CreateUserInput) {
  return apiRequest<User>("/users", {
    method: "POST",
    accessToken,
    body: input,
  });
}

export function updateUser(
  accessToken: string,
  userId: string,
  input: UpdateUserInput,
) {
  return apiRequest<User>(`/users/${userId}`, {
    method: "PATCH",
    accessToken,
    body: input,
  });
}

export function deleteUser(accessToken: string, userId: string) {
  return apiRequest<void>(`/users/${userId}`, {
    method: "DELETE",
    accessToken,
  });
}

export function getAgents(accessToken: string) {
  return getUsers(accessToken, { role: "AGENT", pageSize: 100 });
}
