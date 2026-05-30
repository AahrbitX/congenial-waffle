import { useState } from "react";
import { Button, Card, Input, Tabs } from "@heroui/react";

import { ridesColumns } from "./columns";
import { DataTable } from "@/components/dataTable/dynamic";
import { useDashboardRides } from "@/hooks/dashboard";
import { ResponsiveCard } from "@/components/ui/ResponsiveCard";

export const RidesTable = () => {
  const { data, isLoading } = useDashboardRides();

  const rideStatus = data?.ridesStatus;

  const [status, setStatus] = useState("");

  return (
    <ResponsiveCard>
      <Card.Header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Card.Title className="shrink-0 text-base font-semibold">
          Today&apos;s Rides
        </Card.Title>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span className="flex items-center whitespace-nowrap">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
            {rideStatus?.onTrip ?? 0}&nbsp;On Trip
          </span>

          <span className="flex items-center whitespace-nowrap">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-yellow-500" />
            {rideStatus?.pending ?? 0}&nbsp;Pending
          </span>

          <span className="flex items-center whitespace-nowrap">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            {rideStatus?.completed ?? 0}&nbsp;Completed
          </span>
        </div>
      </Card.Header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            variant="secondary"
            placeholder="Search rides..."
            className="w-full md:w-64"
          />

          <div className="overflow-x-auto scrollbar-hide">
            <Tabs className="min-w-max">
              <Tabs.ListContainer>
                <Tabs.List aria-label="Ride Status">
                  <Tabs.Tab id="all">
                    All
                    <Tabs.Indicator />
                  </Tabs.Tab>

                  <Tabs.Tab id="ontrip">
                    Ongoing
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
        </div>
      </div>

      <DataTable<any>
        isLoading={isLoading}
        columns={ridesColumns}
        data={data?.rides ?? []}
      />
    </ResponsiveCard>
  );
};
