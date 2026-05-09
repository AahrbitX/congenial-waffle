import { Card, Separator } from "@heroui/react";
import React from "react";

export default function PaymentDetails() {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Card.Title>Payment &amp; balance</Card.Title>
      </Card.Header>
      <Separator />
    </Card>
  );
}
