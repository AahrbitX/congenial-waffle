import { Card, Separator } from "@heroui/react";
import React from "react";

export default function PaymentDetails() {
  return (
    <Card variant="secondary" className="gap-2">
      <Card.Header>Payment &amp; balance</Card.Header>
      <Separator variant="secondary" />
    </Card>
  );
}
