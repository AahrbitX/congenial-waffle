import { Card, Skeleton, Surface } from "@heroui/react";

function OverviewSkeleton() {
  return (
    <Surface className="h-full min-h-0 space-y-4" variant="secondary">
      {/* Welcome banner */}
      {/* <Skeleton className="h-24 w-full rounded-2xl" /> */}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex flex-row items-start gap-4">
            <Skeleton className="size-11 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20 rounded-lg" />
              <Skeleton className="h-4 w-12 rounded-lg" />
              <Skeleton className="h-4 w-16 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_0.8fr]">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Card.Header>
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="mt-1 h-3 w-24 rounded-lg" />
            </Card.Header>
            <Skeleton className="mx-4 mb-4 h-48 rounded-xl" />
          </Card>
        ))}
      </div> */}

      {/* Table */}
      <Card>
        <Card.Header className="flex flex-row items-center justify-between gap-4">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded-lg" />
          </div>
        </Card.Header>
        <div className="flex gap-4 px-1 pb-2">
          <Skeleton className="h-9 w-56 rounded-xl" />
          <Skeleton className="h-9 w-72 rounded-xl" />
        </div>
        <div className="space-y-2 p-1">
          {/* Header row */}
          <div className="grid grid-cols-6 gap-4 px-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 rounded-lg" />
            ))}
          </div>
          {/* Data rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 items-center gap-4 rounded-xl px-3 py-3"
            >
              {/* ID + copy */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-14 rounded-lg" />
                <Skeleton className="size-6 rounded-lg" />
              </div>
              {/* Route */}
              <Skeleton className="h-4 w-full rounded-lg" />
              {/* Driver */}
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-20 rounded-lg" />
                  <Skeleton className="h-3 w-16 rounded-lg" />
                </div>
              </div>
              {/* Status */}
              <Skeleton className="h-6 w-20 rounded-full" />
              {/* Fare */}
              <Skeleton className="h-4 w-12 rounded-lg" />
              {/* Actions */}
              <div className="flex justify-end gap-1">
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Surface>
  );
}

export { OverviewSkeleton };
