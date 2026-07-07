import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { Ticket } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel hidden flex-col justify-between p-8 lg:flex">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-primary">
              MSK CREATION
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Plateforme de support
              <span className="block text-primary">tickets & SLA</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-base-content/70">
              Interface inspirée d&apos;un dashboard business moderne — sidebar,
              cartes stats et panneaux doux, personnalisable au fil du projet.
            </p>
          </div>
          <div className="stat-gradient-card rounded-box p-6">
            <div className="flex items-center gap-3">
              <Ticket className="size-8" />
              <div>
                <p className="text-sm text-white/80">Tickets ouverts (démo)</p>
                <p className="text-3xl font-bold">12</p>
              </div>
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">Connexion</h2>
            <p className="text-sm text-base-content/60">
              Accédez à votre espace client, agent ou administrateur.
            </p>

            {isMockMode ? (
              <div className="alert alert-info mt-4">
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
