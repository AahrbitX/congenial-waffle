import React from "react";
import { Tabs } from "@heroui/react";

interface IndexProps {}

const PaymentsTab: React.FC<IndexProps> = () => {
  return (
    <Tabs.Panel className="pt-2 px-0" id="payments">
      Payments
    </Tabs.Panel>
  );
};

export default PaymentsTab;
