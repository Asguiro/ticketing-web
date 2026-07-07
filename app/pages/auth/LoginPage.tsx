import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { Ticket } from "lucide-react";

import { StatsCard } from "~/components/dashboard/StatsCard";
import { Input } from "~/components/ui/Input";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { Button } from "~/components/ui/Button";
import { ROLE_LABELS } from "~/lib/roles";
import {
  loginAction,
  loginLoader,
} from "~/server/auth/actions/login.server";

export async function loader(args: LoaderFunctionArgs) {
  return loginLoader(args);
}

export async function action(args: ActionFunctionArgs) {
  return loginAction(args);
}

export default function LoginPage() {
  const { error, isMockMode, demoAccounts } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const errorMessage =
    (actionData && "error" in actionData ? actionData.error : null) ?? error;

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-base-200"
      style={{ padding: "var(--msk-space-4)" }}
    >
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          className="glass-panel hidden flex-col justify-between lg:flex"
          style={{ padding: "var(--msk-space-8)" }}
        >
          <div>
            <p className="text-col-header text-primary">MSK CREATION</p>
            <h1 className="mt-4 text-page-title">
              Plateforme de support
              <span className="block text-primary">tickets & SLA</span>
            </h1>
            <p className="mt-4 max-w-md text-page-desc">
              Gestion de tickets client, agent et administrateur — suivi SLA,
              assignation et messagerie intégrée.
            </p>
          </div>
          <StatsCard
            label="Tickets ouverts (démo)"
            value={12}
            icon={Ticket}
            description="exemple de carte stat"
          />
        </section>

        <section className="panel-section">
          <div className="panel-section-header">
            <h2 className="text-page-title">Connexion</h2>
            <p className="mt-1 text-page-desc">
              Accédez à votre espace client, agent ou administrateur.
            </p>
          </div>

          <div className="panel-section-body">
            {isMockMode ? (
              <div className="alert alert-info">
                <div className="text-sm">
                  <p className="font-medium">Mode démo actif</p>
                  <ul className="mt-2 space-y-1">
                    {demoAccounts.map((account) => (
                      <li key={account.email}>
                        <span className="font-mono">{account.email}</span> ·{" "}
                        {ROLE_LABELS[account.role]} · {account.password}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="alert alert-error mt-4">{errorMessage}</div>
            ) : null}

            <Form method="post" className="mt-6 space-y-4">
              <Input
                name="email"
                type="email"
                label="Email"
                autoComplete="email"
                defaultValue={isMockMode ? "client@test.dev" : undefined}
                required
              />
              <Input
                name="password"
                type="password"
                label="Mot de passe"
                autoComplete="current-password"
                defaultValue={isMockMode ? "ChangeMe123!" : undefined}
                required
              />
              <Button
                type="submit"
                className={`btn-block ${isSubmitting ? "loading" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </Button>
            </Form>
          </div>
        </section>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
