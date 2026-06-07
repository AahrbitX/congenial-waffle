import { Card, Separator, Skeleton, Surface } from "@heroui/react";

function CardSkeleton({
  rows = 3,
  headerWidth = "w-28",
}: {
  rows?: number;
  headerWidth?: string;
}) {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Skeleton className={`h-5 ${headerWidth} rounded`} />
      </Card.Header>
      <Separator />
      <Card.Content className="space-y-4">
        {/* Avatar row */}
        <div className="flex items-center justify-between p-4 pb-1 rounded-xl bg-surface-muted">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        </div>
        {/* Detail grid */}
        <div className={`grid grid-cols-3 gap-4`}>
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-14 rounded" />
              <Skeleton className="h-4 w-22 rounded" />
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function PaymentSkeleton() {
  return (
    <Card className="gap-2">
      <Card.Header className="flex flex-row items-center justify-between">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </Card.Header>
      <Separator />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </Card>
  );
}

function RideInfoSkeleton() {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Skeleton className="h-4 w-28 rounded" />
      </Card.Header>
      <Separator />
      <Card.Content className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function RouteSkeleton() {
  return (
    <Card>
      <Card.Header>
        <Skeleton className="h-4 w-28 rounded" />
      </Card.Header>
      <Separator />
      <Card.Content>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2 pt-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-10 w-0.5 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="flex-1 space-y-6">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-4 w-44 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <Skeleton className="h-4 w-44 rounded" />
      </Card.Content>
    </Card>
  );
}

function ReviewSkeleton() {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Skeleton className="h-4 w-16 rounded" />
      </Card.Header>
      <div className="px-4 pb-4 space-y-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-5 rounded" />
          ))}
          <Skeleton className="ml-1 h-4 w-8 rounded" />
        </div>
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </Card>
  );
}

export function PageSkeleton() {
  return (
    <Surface
      className="h-full overflow-y-auto p-4 scrollbar-thin"
      variant="secondary"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-52 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <CardSkeleton rows={3} headerWidth="w-24" />
          <CardSkeleton rows={6} headerWidth="w-32" />
          <PaymentSkeleton />
        </div>
        <div className="space-y-4">
          <RideInfoSkeleton />
          <RouteSkeleton />
          <ReviewSkeleton />
        </div>
      </div>
    </Surface>
  );
}
