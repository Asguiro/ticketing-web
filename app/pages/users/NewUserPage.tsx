import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData } from "react-router";

import { PageHeader } from "~/components/shared/PageHeader";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { PageLoadingSkeleton } from "~/components/shared/PageLoadingSkeleton";
import { NewUserWizard } from "~/components/users/NewUserWizard";
import { createUserAction } from "~/server/users/actions/user.server";
import { newUserLoader } from "~/server/users/loaders/user.server";

export async function loader(args: LoaderFunctionArgs) {
  return newUserLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return createUserAction(args);
}

export default function NewUserPage() {
  useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="page-stack">
      <PageHeader
        title="Nouvel utilisateur"
        description="Créez un compte client, agent ou administrateur en quelques étapes."
      />

      <NewUserWizard
        errors={
          actionData && "errors" in actionData ? actionData.errors : undefined
        }
        globalError={
          actionData && "error" in actionData ? actionData.error : undefined
        }
      />
    </div>
  );
}

export function HydrateFallback() {
  return <PageLoadingSkeleton />;
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
