import React from "react";
import { Card, Separator } from "@heroui/react";

type Props = {
  route: any;
};

export default function RouteDetails({ route }: Props) {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title>Route Details</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content>{JSON.stringify(route, null, 2)}</Card.Content>
    </Card>
  );
}
