"use client";

import React, { useState } from "react";
import { request } from "@/lib/api-client";
import {
  Breadcrumbs,
  Button,
  buttonVariants,
  Card,
  Skeleton,
  Surface,
  Tabs,
  toast,
} from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import {
  ProfileHeader,
  ProfileHeaderSkeleton,
} from "@/components/user/ProfileHeader";
import EditDriver from "./editDriver";
import DriverBookingsTab from "./driverBookings";
import DriverReviewsTab from "./driverReviews";
import DriverCarDetailsTab from "./driverCarDetails";
import Link from "next/link";
import SuspendModal from "./suspendModal";

function DriverProfilePage() {
  const params = useParams<{ id: string }>();
  const driverId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<any>({
    queryKey: ["driver", driverId],
    queryFn: async () => {
      return request(`/api/drivers/${driverId}`, { method: "GET" });
    },
  });

  if (isLoading) {
    return (
      <Surface
        className="h-full overflow-y-auto p-4 scrollbar-thin"
        variant="secondary"
      >
        {/* Header bar skeleton */}
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-40 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
        {/* Profile card skeleton */}
        <ProfileHeaderSkeleton />
        {/* Tabs skeleton */}
        <div className="mt-2">
          <Skeleton className="h-9 w-full max-w-sm rounded-xl mb-4" />
          <div className="rounded-xl border border-border p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>
      </Surface>
    );
  }

  if (!data?.data) {
    return (
      <Surface
        className="h-full flex flex-col items-center justify-center gap-3 text-center p-8"
        variant="secondary"
      >
        <p className="text-sm font-semibold">Driver not found</p>
        <p className="text-xs text-muted">
          This driver may have been deleted or the ID is invalid.
        </p>
        <Link
          href="/admin/drivers"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to Drivers
        </Link>
      </Surface>
    );
  }

  // Drizzle innerJoin returns { drivers: {...}, user: {...} }
  const driverRow = data.data.drivers;
  const userRow = data.data.user;

  const formData = {
    id: driverRow.id,
    name: userRow.name,
    phone: userRow.phoneNumber,
    ac: driverRow.ac,
    vehicleType: driverRow.vehicleType,
    dob: userRow.dob,
    vehicleNumber: driverRow.vehicleNumber,
    isAvailable: driverRow.isAvailable,
  };

  return (
    <Surface
      className="h-full overflow-y-auto p-4 scrollbar-thin"
      variant="secondary"
    >
      <div className="flex items-center justify-between">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/admin/drivers">Drivers</Breadcrumbs.Item>
          <Breadcrumbs.Item>{driverRow.id}</Breadcrumbs.Item>
        </Breadcrumbs>
        <div className="flex items-center gap-2">
          <SuspendModal
            userId={driverRow.id}
            userName={userRow.name}
            isUserBanned={driverRow.isBanned}
            bannedReason={driverRow.bannedReason}
          />
          <EditDriver driverData={formData} />
        </div>
      </div>
      <div className="my-2">
        <ProfileHeader
          name={userRow.name}
          phoneNumber={userRow.phoneNumber}
          isActive={driverRow.isAvailable}
          details={[
            {
              label: "Phone",
              value: userRow.phoneNumber,
            },
            {
              label: "Last Updated At",
              value: new Date(driverRow.updatedAt).toLocaleString("en-IN", {
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
              value: new Date(driverRow.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              }),
            },
          ]}
        />
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
              <DriverBookingsTab driverId={driverRow.id} />
              <DriverReviewsTab driverId={driverRow.id} />
              <DriverCarDetailsTab
                vehicle={{
                  vehicleType: driverRow.vehicleType,
                  vehicleNumber: driverRow.vehicleNumber,
                  ac: driverRow.ac,
                  isAvailable: driverRow.isAvailable,
                }}
              />
            </Tabs>
          </Card.Content>
        </Card>
      </div>
    </Surface>
  );
}

export default DriverProfilePage;
