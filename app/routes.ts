import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

import authRoutes from "./router/authRoutes";
import ticketRoutes from "./router/ticketRoutes";
import userRoutes from "./router/userRoutes";

export default [
  index("./pages/IndexPage.tsx"),
  ...authRoutes,
  layout("./components/layouts/DashboardLayout.tsx", [
    route("dashboard", "./pages/dashboard/DashboardPage.tsx"),
    ...prefix("tickets", ticketRoutes),
    ...prefix("users", userRoutes),
  ]),
  route("*", "./pages/errors/NotFoundPage.tsx"),
] satisfies RouteConfig;
