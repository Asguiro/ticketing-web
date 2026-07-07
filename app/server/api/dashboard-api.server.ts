import { apiRequest } from "./api-client.server";
import { normalizeDashboardStats } from "./api-mappers.server";

import type { DashboardStats } from "~/types/dashboard";

export async function getDashboardStats(
  accessToken: string,
  periodDays = 30,
) {
  const response = await apiRequest<unknown>("/dashboard/stats", {
    method: "GET",
    accessToken,
    params: { periodDays },
  });

  return normalizeDashboardStats(response);
}
