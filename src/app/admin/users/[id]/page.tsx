"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Breadcrumbs, Surface, Tabs } from "@heroui/react";

import { User } from "@/types/user";
import { request } from "@/lib/api-client";
import { ProfileHeader } from "@/components/user/ProfileHeader";

import ReviewsTab from "./tabs/reviews";
import TicketsTab from "./tabs/tickets";
import OverviewTab from "./tabs/overview";
import PaymentsTab from "./tabs/payments";
import RideHistoryTab from "./tabs/ride-history";

function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const { data: responseData } = useQuery<User>({
    queryKey: [userId],
    queryFn: async () => {
      return request(`/api/users/${userId}`, {
        method: "GET",
      });
    },
  });

  if (!responseData || !responseData?.success) {
    return <div>No data found</div>;
  }

  const userData = responseData.data;

  return (
    <Surface
      className="h-full overflow-y-auto p-4 scrollbar-thin"
      variant="secondary"
    >
      <div className="flex items-center justify-between shrink-0">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/admin/users">Users</Breadcrumbs.Item>
          <Breadcrumbs.Item>{userData.name}</Breadcrumbs.Item>
        </Breadcrumbs>
      </div>
      <div className="shrink-0">
        <ProfileHeader
          name={userData.name}
          details={[
            {
              label: "Phone",
              value: userData.phoneNumber,
            },
          ]}
          stats={[
            { label: "Total Rides", value: "28" },
            { label: "Avg Rating", value: "4.3" },
            { label: "Total Spent", value: "₹2370" },
            { label: "Balance Due", value: "₹520" },
            {
              label: "Member Since",
              value: new Date(userData.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              }),
            },
            { label: "Open Tickets", value: "1" },
          ]}
        />
      </div>
      <div className="flex-1 min-h-0">
        <Tabs className="w-full ">
          <Tabs.ListContainer className="max-w-xl">
            <Tabs.List aria-label="Options">
              <Tabs.Tab id="overview">
                Overview
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="ride-history">
                <Tabs.Separator />
                Ride History
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="payments">
                <Tabs.Separator />
                Payments
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="reviews">
                <Tabs.Separator />
                Reviews
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="tickets">
                <Tabs.Separator />
                Tickets
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <OverviewTab user={userData} />
          <RideHistoryTab />
          <PaymentsTab />
          <ReviewsTab />
          <TicketsTab />
        </Tabs>
      </div>
    </Surface>
  );
}

export default UserDetailsPage;
