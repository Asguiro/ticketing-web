type PageLoadingSkeletonProps = {
  variant?: "default" | "detail" | "table";
};

export function PageLoadingSkeleton({
  variant = "default",
}: PageLoadingSkeletonProps) {
  if (variant === "detail") {
    return (
      <div className="page-stack animate-pulse">
        <div className="h-8 w-2/3 rounded-box bg-base-300" />
        <div className="h-4 w-full rounded-box bg-base-300/70" />
        <div className="flex gap-3">
          <div className="h-7 w-24 rounded-full bg-base-300" />
          <div className="h-7 w-20 rounded-full bg-base-300" />
        </div>
        <div className="panel-section">
          <div className="panel-section-header">
            <div className="h-5 w-40 rounded-box bg-base-300" />
          </div>
          <div className="panel-section-body">
            <div className="h-32 rounded-box bg-base-300/70" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="page-stack animate-pulse">
        <div className="h-8 w-48 rounded-box bg-base-300" />
        <div className="h-12 rounded-box bg-base-300/70" />
        <div className="panel-section">
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-box bg-base-300/50"
                style={{ height: "var(--msk-table-row-height)" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack animate-pulse">
      <div className="h-8 w-56 rounded-box bg-base-300" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="stat-card">
            <div className="h-4 w-24 rounded-box bg-base-300/70" />
            <div className="mt-3 h-10 w-16 rounded-box bg-base-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
