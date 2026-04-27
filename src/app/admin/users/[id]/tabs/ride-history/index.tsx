import React from "react";
import { Tabs } from "@heroui/react";

interface IndexProps {}

const RideHistoryTab: React.FC<IndexProps> = () => {
  return (
    <Tabs.Panel className="pt-2 px-0" id="ride-history">
      Ride History
    </Tabs.Panel>
  );
};

export default RideHistoryTab;
