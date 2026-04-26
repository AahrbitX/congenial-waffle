import { Card, Separator } from "@heroui/react";
import React from "react";

type Props = {
  driver: any;
};

export default function DriverDetails({ driver }: Props) {
  return (
    <Card variant="secondary" className="gap-2">
      <Card.Header>Driver Details</Card.Header>
      <Separator variant="secondary" />
      <Card.Content>{JSON.stringify(driver, null, 2)}</Card.Content>
    </Card>
  );
}
