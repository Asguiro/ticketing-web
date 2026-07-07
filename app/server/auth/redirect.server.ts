import { redirect } from "react-router";

import type { Role } from "~/types/user";

export function redirectAfterLogin(
  _role: Role,
  init?: ResponseInit,
) {
  return redirect("/dashboard", init);
}

export function redirectToLogin() {
  return redirect("/login");
}
