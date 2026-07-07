import type { TicketStatus } from "./ticket";

export type DashboardPeriod = {
  from: string;
  to: string;
};

export type DashboardStats = {
  openCount: number;
  overdueCount: number;
  resolvedInPeriodCount: number;
  period?: DashboardPeriod;
  /** Présent uniquement pour le rôle ADMIN. */
  byStatus?: Partial<Record<TicketStatus, number>>;
};
