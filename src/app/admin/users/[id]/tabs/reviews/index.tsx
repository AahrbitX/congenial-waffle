import React from "react";
import { Tabs } from "@heroui/react";

interface IndexProps {}

const ReviewsTab: React.FC<IndexProps> = () => {
  return (
    <Tabs.Panel className="pt-2 px-0" id="reviews">
      Reviews
    </Tabs.Panel>
  );
};

export default ReviewsTab;
