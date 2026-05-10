import React from "react";
import { Card, Chip, Button, Surface, Skeleton } from "@heroui/react";
import { MessageCircle, UserX } from "lucide-react";

import UserAvatar from "@/components/user/avatar";

type Props = {
  name: string;
  isActive?: boolean;
  details?: { label: string; value: string }[];
  stats?: { label: string; value: string }[];
};

export function ProfileHeader(props: Props) {
  return (
    <Card className="my-4 border-none p-6">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-4">
            <UserAvatar username={props.name} />

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold">{props.name}</h1>
                {props.isActive ? (
                  <Chip size="sm" variant="soft" color="success">
                    Active
                  </Chip>
                ) : (
                  <Chip size="sm" variant="soft" color="danger">
                    Inactive
                  </Chip>
                )}
              </div>
            </div>
          </div>

          {!!props.details?.length && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {props.details.map((detail) => (
                <InfoItem key={detail.label} detail={detail} />
              ))}
            </div>
          )}

          {!!props.stats?.length && (
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
              {props.stats.map((stat) => (
                <Card
                  key={stat.label}
                  variant="secondary"
                  className="rounded-xl gap-0 px-4 py-3 flex flex-col justify-center min-h-[82px]"
                >
                  <p className="text-lg font-bold text-center">{stat.value}</p>
                  <p className="text-xs font-medium text-muted text-center">
                    {stat.label}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 xl:w-[200px]">
          <Button
            fullWidth
            className="bg-emerald-200 text-emerald-600 hover:bg-emerald-300/40"
          >
            <MessageCircle size={18} fill="currentColor" />
            WhatsApp
          </Button>

          <Button variant="danger-soft" fullWidth>
            <UserX size={18} />
            Suspend
          </Button>
        </div>
      </div>
    </Card>
  );
}

function InfoItem({ detail }: { detail: { label: string; value: string } }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted">{detail.label}</p>
      <p className="text-sm font-medium">{detail.value}</p>
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <Card variant="secondary" className="my-4 border-none p-6 shadow-sm">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-7 w-44 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-md" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Surface
                key={index}
                variant="default"
                className="rounded-xl px-4 py-3 space-y-2 min-h-[82px]"
              >
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </Surface>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:w-[200px]">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  );
}
