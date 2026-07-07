import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("login", "./pages/auth/LoginPage.tsx"),
  route("logout", "./pages/auth/LogoutRoute.tsx"),
  route("forbidden", "./pages/errors/ForbiddenPage.tsx"),
] satisfies RouteConfig;
