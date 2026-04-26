import React from "react";
import { Card, Separator } from "@heroui/react";

type Props = {
  route: any;
};

export default function RouteDetails({ route }: Props) {
  return (
    <Card variant="secondary" className="gap-2">
      <Card.Header>Route Details</Card.Header>
      <Separator variant="secondary" />
      <Card.Content>{JSON.stringify(route, null, 2)}</Card.Content>
    </Card>
  );
}
