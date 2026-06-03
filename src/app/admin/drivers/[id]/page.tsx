"use client";

import React, { useState } from "react";
import { request } from "@/lib/api-client";
import { Breadcrumbs, Button, Card, Skeleton, Surface, Tabs, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Trash2, RefreshCcw } from "lucide-react";
import {
  ProfileHeader,
  ProfileHeaderSkeleton,
} from "@/components/user/ProfileHeader";
import EditDriver from "./editDriver";
import DriverBookingsTab  from "./driverBookings";
import DriverReviewsTab   from "./driverReviews";
import DriverCarDetailsTab from "./driverCarDetails";

function DriverProfilePage() {
  const params      = useParams<{ id: string }>();
  const driverId    = params.id;
  const router      = useRouter();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => request(`/api/drivers/${driverId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver removed successfully");
      router.push("/admin/drivers");
    },
    onError: () => toast.danger("Failed to delete driver"),
  });

  const { data, isLoading, refetch, isFetching } = useQuery<any>({
    queryKey: ["driver", driverId],
    queryFn: async () => {
      return request(`/api/drivers/${driverId}`, { method: "GET" });
    },
  });

  if (isLoading) {
    return (
      <Surface className="h-full overflow-y-auto p-4 scrollbar-thin" variant="secondary">
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
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
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
      <Surface className="h-full flex flex-col items-center justify-center gap-3 text-center p-8" variant="secondary">
        <p className="text-sm font-semibold">Driver not found</p>
        <p className="text-xs text-muted">This driver may have been deleted or the ID is invalid.</p>
        <Button variant="outline" size="sm" onPress={() => router.push("/admin/drivers")}>
          Back to Drivers
        </Button>
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
          <Button isIconOnly variant="ghost" size="sm" onPress={() => refetch()} isDisabled={isFetching}>
            <RefreshCcw size={15} className={isFetching ? "animate-spin" : ""} />
          </Button>
          <EditDriver driverData={formData} />
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-danger font-medium">Remove this driver?</span>
              <Button
                size="sm"
                variant="danger"
                isDisabled={deleteMutation.isPending}
                onPress={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, Delete"}
              </Button>
              <Button size="sm" variant="ghost" onPress={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onPress={() => setConfirmDelete(true)}>
              <Trash2 size={15} />
              Delete Driver
            </Button>
          )}
        </div>
      </div>
      <div className="my-2">
        <ProfileHeader
            name={userRow.name}
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
                value: new Date(driverRow.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    month: "short",
                    year: "numeric",
                  },
                ),
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
              <DriverCarDetailsTab vehicle={{
                vehicleType:   driverRow.vehicleType,
                vehicleNumber: driverRow.vehicleNumber,
                ac:            driverRow.ac,
                isAvailable:   driverRow.isAvailable,
              }} />
            </Tabs>
          </Card.Content>
        </Card>
      </div>
    </Surface>
  );
}

export default DriverProfilePage;
