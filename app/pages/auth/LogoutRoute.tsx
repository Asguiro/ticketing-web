import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { logoutAction } from "~/server/auth/actions/logout.server";

export async function loader(_args: LoaderFunctionArgs) {
  return redirect("/dashboard");
}

export async function action(args: ActionFunctionArgs) {
  return logoutAction(args);
}

export default function LogoutRoute() {
  return null;
}
