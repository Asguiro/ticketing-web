import type { ReactNode } from "react";

type ListingPanelProps = {
  toolbar?: ReactNode;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  isEmpty?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ListingPanel({
  toolbar,
  title,
  subtitle,
  children,
  footer,
  isEmpty = false,
  emptyIcon,
  emptyTitle = "Aucun résultat",
  emptyDescription = "Aucun élément ne correspond à vos critères.",
}: ListingPanelProps) {
  if (isEmpty) {
    return (
      <div className="w-full overflow-hidden rounded-box border border-base-300/50 bg-base-100 shadow-sm">
        <div
          className="flex flex-col items-center text-center"
          style={{ padding: "var(--msk-space-8) var(--msk-space-6)" }}
        >
          {emptyIcon}
          <h3 className="mt-4 text-base font-semibold text-base-content">{emptyTitle}</h3>
          <p className="mt-1 max-w-sm text-page-desc">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-box border border-base-300/50 bg-base-100 shadow-sm">
      {toolbar ? (
        <div
          className="w-full border-b border-base-300/50"
          style={{ padding: "var(--msk-space-4)" }}
        >
          {toolbar}
        </div>
      ) : null}

      {title ? (
        <div
          className="w-full border-b border-base-300/50"
          style={{ padding: "var(--msk-space-3) var(--msk-space-4)" }}
        >
          <h2 className="text-sm font-semibold text-base-content">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-page-desc">{subtitle}</p> : null}
        </div>
      ) : null}

      <div className="w-full overflow-x-auto">{children}</div>

      {footer ? (
        <div
          className="w-full border-t border-base-300/50"
          style={{ padding: "var(--msk-space-3) var(--msk-space-4)" }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Utiliser ListingPanel */
export const ListingTableShell = ListingPanel;
