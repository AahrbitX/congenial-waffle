import React from "react";
import { User } from "@/types/user";
import { PersonalDetails } from "./personalDetails";
import { Tabs } from "@heroui/react";

interface IndexProps {
  user: User;
}

const OverviewTab: React.FC<IndexProps> = (props) => {
  const { user } = props;
  return (
    <Tabs.Panel className="pt-2 px-0 grid grid-cols-2 gap-4" id="overview">
      <PersonalDetails user={user} />
    </Tabs.Panel>
  );
};

export default OverviewTab;
