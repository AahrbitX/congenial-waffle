import { useState } from "react";
import { Button, Card, Input, Tabs } from "@heroui/react";

import { ridesColumns } from "./columns";
import { DataTable } from "@/components/dataTable/dynamic";
import { useDashboardRides } from "@/hooks/dashboard";

export const RidesTable = () => {
  const { data, isLoading } = useDashboardRides();

  const rideStatus = data?.ridesStatus;

  const [status, setStatus] = useState("");

  return (
    <Card>
      <Card.Header className="flex flex-row items-center justify-between gap-4 text-sm">
        <Card.Title>Today&apos;s Rides</Card.Title>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center">
            <span className="h-2.5 w-2.5 rounded-full inline-block bg-blue-500 mr-2" />
            {rideStatus?.onTrip ?? 0}
            &nbsp;On Trip
          </span>

          <span className="flex items-center">
            <span className="h-2.5 w-2.5 rounded-full inline-block bg-yellow-500 mr-2" />
            {rideStatus?.pending ?? 0}
            &nbsp;Pending
          </span>

          <span className="flex items-center">
            <span className="h-2.5 w-2.5 rounded-full inline-block bg-green-500 mr-2" />
            {rideStatus?.completed ?? 0}
            &nbsp;Completed
          </span>
        </div>
      </Card.Header>

      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Input variant="secondary" placeholder="Search rides..." />
          <Tabs className="w-124">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Options">
                <Tabs.Tab id="all">
                  All
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="ontrip">
                  On Trip
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="pending">
                  Pending
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="completed">
                  Completed
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="cancelled">
                  Cancelled
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </div>
        <Button variant="secondary">Reset</Button>
      </div>

      <DataTable<any>
        isLoading={isLoading}
        columns={ridesColumns}
        data={data?.rides ?? []}
      />
    </Card>
  );
};
