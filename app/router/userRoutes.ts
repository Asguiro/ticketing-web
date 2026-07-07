import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./pages/users/UsersListPage.tsx"),
  route("new", "./pages/users/NewUserPage.tsx"),
] satisfies RouteConfig;
