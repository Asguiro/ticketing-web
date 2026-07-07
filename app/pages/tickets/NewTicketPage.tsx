import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useActionData, useLoaderData } from "react-router";

import { NewTicketWizard } from "~/components/tickets/NewTicketWizard";
import { PageHeader } from "~/components/shared/PageHeader";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { PageLoadingSkeleton } from "~/components/shared/PageLoadingSkeleton";
import {
  createTicketAction,
} from "~/server/tickets/actions/ticket.server";
import { newTicketLoader } from "~/server/tickets/loaders/ticket.server";

export async function loader(args: LoaderFunctionArgs) {
  return newTicketLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return createTicketAction(args);
}

export default function NewTicketPage() {
  useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <PageHeader
        title="Nouveau ticket"
        description="Créez une demande de support en quelques étapes."
      />

      <NewTicketWizard
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
