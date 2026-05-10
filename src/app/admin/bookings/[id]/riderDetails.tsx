import React from "react";
import { Phone } from "lucide-react";
import { Button, Card, Separator } from "@heroui/react";

import UserAvatar from "@/components/user/avatar";

type Props = {
  rider: any;
};

export default function RiderDetails({ rider }: Props) {
  const bookedAt = new Date(rider.bookedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  console.log(rider);

  const details = [
    {
      label: "Booked At",
      value: bookedAt,
    },
    {
      label: "Booked For",
      value: rider.bookedFor,
    },
    {
      label: "Member Since",
      value: rider.memberSince,
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
