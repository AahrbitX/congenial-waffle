import React from "react";
import { Card, Separator } from "@heroui/react";

type Props = {
  info: any;
};

export default function RideInformation({ info }: Props) {
  return (
    <Card variant="secondary" className="gap-2">
      <Card.Header>Trip Completion Details</Card.Header>
      <Separator variant="secondary" />
      <Card.Content>{JSON.stringify(info, null, 2)}</Card.Content>
    </Card>
  );
}
