import React from "react";
import { Card, Separator } from "@heroui/react";

type Props = {
  rider: any;
};

export default function RiderDetails({ rider }: Props) {
  return (
    <Card variant="secondary" className="gap-2">
      <Card.Header>Rider Details</Card.Header>
      <Separator variant="secondary" />
      <Card.Content>{JSON.stringify(rider, null, 2)}</Card.Content>
    </Card>
  );
}
