import {
  LayoutDashboard,
  LogOut,
  Plus,
  Ticket,
  Users,
} from "lucide-react";
import { Form, NavLink, useLocation } from "react-router";

import { isAdmin, isClient, ROLE_LABELS } from "~/lib/roles";
import type { SessionUser } from "~/types/user";

type AppSidebarProps = {
  user: SessionUser;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-box px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-primary text-primary-content shadow-md"
      : "text-base-content/70 hover:bg-base-200"
  }`;

function isTicketsSectionActive(pathname: string) {
  return (
    pathname === "/tickets" ||
    (pathname.startsWith("/tickets/") && pathname !== "/tickets/new")
  );
}

function isUsersSectionActive(pathname: string) {
  return pathname === "/users" || pathname.startsWith("/users/");
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { pathname } = useLocation();

  return (
    <aside className="glass-panel flex w-full shrink-0 flex-col overflow-hidden p-4 lg:h-full lg:w-72">
      <div className="mb-6 shrink-0 px-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary">
          MSK
        </p>
        <h1 className="text-xl font-bold text-base-content">Ticket Support</h1>
      </div>

      <nav className="menu shrink-0 gap-1 p-0">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard className="size-4 shrink-0" />
          Dashboard
        </NavLink>
        <NavLink
          to="/tickets"
          className={navLinkClass({
            isActive: isTicketsSectionActive(pathname),
          })}
        >
          <Ticket className="size-4 shrink-0" />
          Tickets
        </NavLink>
        {isClient(user.role) ? (
          <NavLink to="/tickets/new" className={navLinkClass}>
            <Plus className="size-4 shrink-0" />
            Nouveau ticket
          </NavLink>
        ) : null}
        {isAdmin(user.role) ? (
          <NavLink
            to="/users"
            className={navLinkClass({
              isActive: isUsersSectionActive(pathname),
            })}
          >
            <Users className="size-4 shrink-0" />
            Utilisateurs
          </NavLink>
        ) : null}
      </nav>

      <div className="mt-auto shrink-0 pt-6">
        <div className="flex items-center gap-3 rounded-box bg-base-200/70 p-3">
          <div className="avatar placeholder shrink-0">
            <div className="w-11 rounded-full bg-primary text-primary-content">
              <span className="text-sm font-semibold">
                {user.email.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {user.email}
            </p>
            <p className="mt-0.5 text-xs text-base-content/60">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
        <Form method="post" action="/logout" className="mt-3">
          <button type="submit" className="btn btn-outline btn-sm w-full gap-2">
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </Form>
      </div>
    </aside>
  );
}
