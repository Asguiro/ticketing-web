import type { LoaderFunctionArgs } from "react-router";

import { indexLoader } from "~/server/index/loaders/index.server";

export async function loader(args: LoaderFunctionArgs) {
  return indexLoader(args);
}

export default function IndexPage() {
  return null;
}
