type PageLoadingSkeletonProps = {
  variant?: "default" | "detail" | "table";
};

export function PageLoadingSkeleton({
  variant = "default",
}: PageLoadingSkeletonProps) {
  if (variant === "detail") {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 rounded-box bg-base-300" />
        <div className="h-4 w-full rounded-box bg-base-300/70" />
        <div className="flex gap-3">
          <div className="h-7 w-24 rounded-full bg-base-300" />
          <div className="h-7 w-20 rounded-full bg-base-300" />
        </div>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body gap-4">
            <div className="h-5 w-40 rounded-box bg-base-300" />
            <div className="h-32 rounded-box bg-base-300/70" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-box bg-base-300" />
        <div className="h-12 rounded-box bg-base-300/70" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-14 rounded-box bg-base-300/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-56 rounded-box bg-base-300" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card bg-base-100 shadow-md">
            <div className="card-body gap-3">
              <div className="h-4 w-24 rounded-box bg-base-300/70" />
              <div className="h-10 w-16 rounded-box bg-base-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
