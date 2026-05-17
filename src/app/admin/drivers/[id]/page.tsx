"use client";

import React from "react";
import { request } from "@/lib/api-client";
import { Breadcrumbs, Card, Surface, Tabs } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  ProfileHeader,
  ProfileHeaderSkeleton,
} from "@/components/user/ProfileHeader";
import EditDriver from "./editDriver";

function DriverProfilePage() {
  const params = useParams<{ id: string }>();
  const driverId = params.id;

  const { data, isLoading } = useQuery<any>({
    queryKey: [driverId],
    queryFn: async () => {
      return request(`/api/drivers/${driverId}`, {
        method: "GET",
      });
    },
  });

  console.log("DriverData :", data);

  if (isLoading) {
    return <div>Loading driver data</div>;
  }

  const profileData = data.driver.profile;
  const vehicleData = data.driver.vehicle;

  const formData = {
    id: profileData.id,
    name: profileData.name,
    phone: profileData.phoneNumber,
    ac: vehicleData.ac,
    vehicleType: vehicleData.vehicleType,
    dob: profileData.dob,
    vehicleNumber: vehicleData.vehicleNumber,
    isAvailable: data.driver.availability,
  };

  return (
    <Surface
      className="h-full overflow-y-auto p-4 scrollbar-thin"
      variant="secondary"
    >
      <div className="flex items-center justify-between">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/admin/drivers">Drivers</Breadcrumbs.Item>
          <Breadcrumbs.Item>{profileData.id}</Breadcrumbs.Item>
        </Breadcrumbs>
        <EditDriver driverData={formData} />
      </div>
      <div className="my-2">
        {isLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
          <ProfileHeader
            name={profileData.name}
            isActive={data.driver.isAvailable}
            details={[
              {
                label: "Phone",
                value: profileData.phone,
              },
              {
                label: "Last Updated At",
                value: new Date(profileData.updatedAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
              },
            ]}
            stats={[
              {
                label: "Member Since",
                value: new Date(profileData.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    month: "short",
                    year: "numeric",
                  },
                ),
              },
            ]}
          />
        )}
      </div>
      <div>
        <Card>
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
              <Tabs.Panel id="bookings">
                <p>View your project overview and recent activity.</p>
              </Tabs.Panel>
              <Tabs.Panel id="reviews">
                <p>Track your metrics and analyze performance data.</p>
              </Tabs.Panel>
              <Tabs.Panel id="car-details">
                <p>View your car details and specifications.</p>
              </Tabs.Panel>
            </Tabs>
          </Card.Content>
        </Card>
      </div>
      <div>{JSON.stringify(data, null, 2)}</div>
    </Surface>
  );
}

export default DriverProfilePage;
