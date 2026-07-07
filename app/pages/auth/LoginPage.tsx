import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";

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
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4 sm:p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <section className="glass-panel hidden flex-col justify-center p-8 lg:flex lg:p-10">
          <p className="text-col-header text-primary">MSK CREATION</p>
          <h1 className="mt-4 text-page-title">
            Plateforme de support
            <span className="mt-1 block text-primary">client & équipe</span>
          </h1>
          <p className="mt-4 max-w-md text-page-desc">
            Suivi des demandes, assignation des agents et messagerie intégrée —
            un espace unique pour clients, agents et administrateurs.
          </p>
        </section>

        <section className="glass-panel flex flex-col p-6 sm:p-8">
          <header className="border-b border-base-300/60 pb-6">
            <h2 className="text-page-title">Connexion</h2>
            <p className="mt-2 text-page-desc">
              Accédez à votre espace selon votre rôle.
            </p>
          </header>

          <div className="flex flex-1 flex-col pt-6">
            {isMockMode ? (
              <div className="alert alert-info mb-6">
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
              <div className="alert alert-error mb-6">{errorMessage}</div>
            ) : null}

            <Form method="post" className="flex flex-col gap-5">
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
              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className={`btn-block ${isSubmitting ? "loading" : ""}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Connexion..." : "Se connecter"}
                </Button>
              </div>
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
