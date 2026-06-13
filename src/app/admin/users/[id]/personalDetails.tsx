import { Card, Chip, Separator, Skeleton } from "@heroui/react";

export function PersonalDetailsSkeleton() {
  return (
    <Card className="p-6 h-full row-span-2" variant="default">
      <Card.Header>
        <Skeleton className="h-4 w-36 rounded" />
      </Card.Header>
      <Separator />
      <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-32 rounded" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PersonalDetails({ user }: { user: any }) {
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const dob = user.dob
    ? new Date(user.dob).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Card className="w-full row-span-2" variant="default">
      <Card.Header>
        <Card.Title className="font-semibold text-accent">
          Personal Details
        </Card.Title>
      </Card.Header>
      <Separator />

      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        <DetailItem label="Full Name" value={user.name ?? "—"} />
        <DetailItem label="Phone" value={user.phoneNumber ?? "—"} />
        <DetailItem label="Date of Birth" value={dob} />
        <DetailItem label="Member Since" value={memberSince} />
        <DetailItem label="Gender" value={user.gender ?? "—"} />
        {user.banned && (
          <div className="col-span-2 flex flex-col gap-0.5">
            <span className="text-xs text-muted font-medium">Ban Reason</span>
            <span className="text-sm font-semibold text-danger">
              {user.bannedReason ?? "No reason provided"}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
