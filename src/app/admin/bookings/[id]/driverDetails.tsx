import React from "react";
import { Phone } from "lucide-react";

import UserAvatar from "@/components/user/avatar";
import { Button, Card, CardContent, Separator } from "@heroui/react";

type Props = {
  driver: any;
};

export default function DriverDetails({ driver }: Props) {
  const details = [
    {
      label: "Id",
      value: driver.id,
    },
    {
      label: "Vehicle",
      value: driver.vehicleType,
    },
    {
      label: "AC",
      value: driver.ac ? "AC" : "Non-AC",
    },
    {
      label: "Total Trips",
      value: driver.totalTrips || "-",
    },
    {
      label: "Rating",
      value: driver.rating || "-",
    },
    {
      label: "Vehicle No.",
      value: driver.vehicleNumber,
    },
  ];
  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title>Rider Details</Card.Title>
      </Card.Header>
      <Separator />

      {!driver.name ? (
        <CardContent>Driver Unassigned</CardContent>
      ) : (
        <Card.Content>
          <div className="bg-success/10 flex items-center justify-between p-4 rounded-xl text-sm my-2">
            <div className="flex items-center gap-4">
              <UserAvatar username={driver.name} color="success" />
              <div>
                <p className="font-bold text-lg">{driver.name}</p>
                <p>{driver.phone}</p>
              </div>
            </div>
            <Button isIconOnly size="lg" className={"bg-success"}>
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
      )}
    </Card>
  );
}
