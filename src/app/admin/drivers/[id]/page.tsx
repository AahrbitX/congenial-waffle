"use client";

import React from "react";
import { request } from "@/lib/api-client";
import { ChevronLeft, Edit } from "lucide-react";
import { DriverJoined } from "@/types/driver";
import { Breadcrumbs, Button, Card, Surface, Tabs } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

function DriverProfilePage() {
  const params = useParams<{ id: string }>();
  const driverId = params.id;

  const router = useRouter();

  const { data: responseData, isLoading } = useQuery<DriverJoined>({
    queryKey: [driverId],
    queryFn: async () => {
      return request(`/api/drivers/${driverId}`, {
        method: "GET",
      });
    },
  });

  if (!responseData || !responseData?.success) {
    return <div>No data found</div>;
  }

  const data = responseData.data;
  const driverData = data.drivers;
  const userData = data.user;

  return (
    <Surface className="px-2 py-4 ">
      <div className="flex items-center justify-between">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/admin/drivers">Drivers</Breadcrumbs.Item>
          <Breadcrumbs.Item>{userData.name}</Breadcrumbs.Item>
        </Breadcrumbs>
        <Button size="sm">
          <Edit />
          Edit Driver
        </Button>
      </div>
      <div className="my-2">
        <Card variant="secondary">
          <Card.Header>
            <h1 className="font-semibold text-2xl">{userData.name}</h1>
          </Card.Header>
          <Card.Content></Card.Content>
          <Card.Footer></Card.Footer>
        </Card>
      </div>
      <div className="">
        <Card variant="transparent" className="px-0 py-1">
          <Card.Content>
            <Tabs className="w-full">
              <Tabs.ListContainer className="max-w-sm">
                <Tabs.List aria-label="Options">
                  <Tabs.Tab id="bookings">
                    Bookings
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="reviews">
                    <Tabs.Separator />
                    Reviews
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="car-details">
                    <Tabs.Separator />
                    Car Details
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel className="pt-4" id="bookings">
                <p>View your project overview and recent activity.</p>
              </Tabs.Panel>
              <Tabs.Panel className="pt-4" id="reviews">
                <p>Track your metrics and analyze performance data.</p>
              </Tabs.Panel>
            </Tabs>
          </Card.Content>
          <Card.Footer></Card.Footer>
        </Card>
      </div>
      <div>{JSON.stringify(data, null, 2)}</div>
    </Surface>
  );
}

export default DriverProfilePage;
