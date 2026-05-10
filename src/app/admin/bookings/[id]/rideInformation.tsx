import React from "react";
import { Card, Separator } from "@heroui/react";

type Props = {
  info: any;
};

export default function RideInformation({ info }: Props) {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title>Trip Completion Details</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content>{JSON.stringify(info, null, 2)}</Card.Content>
    </Card>
  );
}
