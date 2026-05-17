import React from "react";
import { Surface } from "@heroui/react";

import ReviewStats from "./reviewStats";
import ReviewList from "./reviewList";

function AdminReviewsPage() {
  return (
    <Surface
      variant="secondary"
      className="h-full min-h-0 p-4 flex flex-col gap-4 "
    >
      <ReviewStats />

      <div className="flex-1 min-h-0 overflow-hidden">
        <ReviewList />
      </div>
    </Surface>
  );
}

export default AdminReviewsPage;
