import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useNavigation } from "react-router";

import { AppSidebar } from "~/components/layouts/AppSidebar";
import { AppRouteErrorBoundary } from "~/components/shared/AppRouteErrorBoundary";
import { MockModeBanner } from "~/components/shared/MockModeBanner";
import { NavigationLoadingIndicator } from "~/components/shared/GlobalLoadingBar";
import { dashboardLayoutLoader } from "~/server/dashboard/loaders/dashboard.server";

export async function loader(args: LoaderFunctionArgs) {
  return dashboardLayoutLoader(args);
}

export default function DashboardLayout() {
  const { user, isMockMode } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  return (
    <div className="flex h-screen overflow-hidden bg-base-200 p-2 lg:p-3">
      <div className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col gap-2 lg:flex-row lg:gap-3">
        <AppSidebar user={user} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {isMockMode ? <MockModeBanner /> : null}

          <main className="glass-panel min-h-0 flex-1 overflow-y-auto" style={{ padding: "var(--msk-space-4)" }}>
            <NavigationLoadingIndicator />
            <div
              className={
                isNavigating ? "pointer-events-none opacity-50 transition-opacity" : ""
              }
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-base-200 p-4">
      <div className="glass-panel w-full max-w-md p-8 text-center">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-4 text-sm text-base-content/70">
          Connexion à la plateforme...
        </p>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <AppRouteErrorBoundary />;
}
