import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./pages/tickets/TicketsListPage.tsx"),
  route("new", "./pages/tickets/NewTicketPage.tsx"),
  route(":id", "./pages/tickets/TicketDetailPage.tsx"),
] satisfies RouteConfig;
