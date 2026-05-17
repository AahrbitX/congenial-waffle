import React from "react";
import { Card, Input } from "@heroui/react";

function ReviewList() {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="mb-4 shrink-0">
        <Input placeholder="Search Reviews ..." />
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-[0.5fr_1fr] gap-4 overflow-hidden">
        <Card className="h-full overflow-hidden">
          <Card.Content className="h-full">List</Card.Content>
        </Card>

        <Card className="h-full overflow-hidden">
          <Card.Content className="h-full">Detail</Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default ReviewList;
