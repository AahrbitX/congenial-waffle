import React from "react";
import { Tabs } from "@heroui/react";
import { PersonalDetails, PersonalDetailsSkeleton } from "./personalDetails";

interface OverviewTabProps {
  user: any;
  isLoading?: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ user, isLoading }) => {
  return (
    <Tabs.Panel className="pt-2 px-0 grid grid-cols-2 gap-4" id="overview">
      {isLoading ? <PersonalDetailsSkeleton /> : <PersonalDetails user={user} />}
    </Tabs.Panel>
  );
};

export default OverviewTab;
