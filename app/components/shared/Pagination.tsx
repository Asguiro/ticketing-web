import { Link, useLocation } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  itemLabel?: string;
};

function buildPageUrl(search: string, page: number): string {
  const params = new URLSearchParams(search);
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export function Pagination({
  page,
  totalPages,
  total,
  itemLabel = "éléments",
}: PaginationProps) {
  const location = useLocation();

  if (totalPages <= 1) {
    return null;
  }

  const pageSize = totalPages > 0 ? Math.ceil(total / totalPages) : total;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-base-300/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-base-content/60">
        {total} {itemLabel} — page {page} sur {totalPages}
        {total > 0 ? ` (${from}–${to})` : ""}
      </p>
      <div className="join">
        {page > 1 ? (
          <Link
            to={buildPageUrl(location.search, page - 1)}
            className="btn btn-sm join-item gap-1"
            aria-label="Page précédente"
          >
            <ChevronLeft className="size-4" />
            Précédent
          </Link>
        ) : (
          <span className="btn btn-sm join-item btn-disabled gap-1">
            <ChevronLeft className="size-4" />
            Précédent
          </span>
        )}
        {page < totalPages ? (
          <Link
            to={buildPageUrl(location.search, page + 1)}
            className="btn btn-sm join-item gap-1"
            aria-label="Page suivante"
          >
            Suivant
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className="btn btn-sm join-item btn-disabled gap-1">
            Suivant
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>
    </div>
  );
}
