import type { PaginatedResult } from "~/types/api";
import type { DashboardStats } from "~/types/dashboard";

export type ApiPaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
};

export function isApiPaginatedResponse<T>(
  value: unknown,
): value is ApiPaginatedResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as ApiPaginatedResponse<T>).data) &&
    "meta" in value
  );
}

export function mapPaginatedResponse<T>(
  response: ApiPaginatedResponse<T>,
): PaginatedResult<T> {
  const { page, pageSize, total } = response.meta;

  return {
    items: response.data,
    pagination: {
      page,
      limit: pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export function normalizePaginatedResponse<T>(
  response: unknown,
): PaginatedResult<T> {
  if (isApiPaginatedResponse<T>(response)) {
    return mapPaginatedResponse(response);
  }

  return response as PaginatedResult<T>;
}

export function isApiDashboardStats(value: unknown): value is DashboardStats {
  return (
    typeof value === "object" &&
    value !== null &&
    "openCount" in value &&
    "overdueCount" in value
  );
}

export function normalizeDashboardStats(response: unknown): DashboardStats {
  if (isApiDashboardStats(response)) {
    return response;
  }

  const legacy = response as {
    openTickets: number;
    overdueTickets: number;
    resolvedTickets: number;
  };

  return {
    openCount: legacy.openTickets,
    overdueCount: legacy.overdueTickets,
    resolvedInPeriodCount: legacy.resolvedTickets,
  };
}
