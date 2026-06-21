import React from "react";
import { buttonVariants, Card, Chip, Skeleton } from "@heroui/react";

import UserAvatar from "@/components/user/avatar";
import Link from "next/link";
import { BsWhatsapp } from "react-icons/bs";

type Props = {
  name: string;
  phoneNumber: string;
  isActive?: boolean;
  details?: { label: string; value: string }[];
  stats?: { label: string; value: string }[];
};

export function ProfileHeader(props: Props) {
  return (
    <Card className="my-4">
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-col gap-4">
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
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
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
        <div>
          <Link
            href={`https://wa.me/${props.phoneNumber}`}
            target="_blank"
            className={buttonVariants({
              variant: "primary",
              className: "bg-emerald-500",
            })}
          >
            <BsWhatsapp size={16} />
            Whatsapp
          </Link>
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
    <Card className="my-4 border-none p-6">
      <div className="flex flex-col gap-6">
        {/* Avatar + name row */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        {/* Details row — 1 item, same grid as real */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
          </div>
        </div>

        {/* Stats row — 1 card, same grid as real */}
        <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
          <Card
            variant="secondary"
            className="rounded-xl gap-0 px-4 py-3 flex flex-col items-center justify-center min-h-[82px]"
          >
            <Skeleton className="h-6 w-14 rounded" />
            <Skeleton className="h-3 w-20 rounded mt-1" />
          </Card>
        </div>
      </div>
    </Card>
  );
}
