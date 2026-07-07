import type { LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";

import { getAuthSession } from "~/server/auth/require-auth.server";

export async function indexLoader({ request }: LoaderFunctionArgs) {
  const auth = await getAuthSession(request);
  throw redirect(auth ? "/dashboard" : "/login");
}

export async function indexAction() {
  return data(null);
}
