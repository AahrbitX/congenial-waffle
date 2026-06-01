import React from "react";
import { Phone } from "lucide-react";
import { Button, Card, Separator } from "@heroui/react";

import UserAvatar from "@/components/user/avatar";

type Props = {
  rider: any;
};

function fmtDate(val: string | Date | null | undefined) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RiderDetails({ rider }: Props) {
  const details = [
    {
      label: "Booked At",
      value: fmtDate(rider.bookedAt),
    },
    {
      label: "Journey Date",
      value: fmtDate(rider.bookedFor),
    },
    {
      label: "Member Since",
      value: fmtDate(rider.memberSince),
    },
  ];

  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title>Rider Details</Card.Title>
      </Card.Header>
      <Separator />

      <Card.Content>
        <div className="bg-accent/10 flex items-center justify-between p-4 rounded-xl text-sm my-2">
          <div className="flex items-center gap-4">
            <UserAvatar username={rider.name} />
            <div>
              <p className="font-bold text-lg">{rider.name}</p>
              <p>{rider.phone}</p>
            </div>
          </div>
          <Button isIconOnly size="lg">
            <Phone />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="flex flex-col items-start justify-between"
            >
              <p className="text-xs text-muted">{detail.label}</p>
              <p className="text-sm font-semibold">{detail.value}</p>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
