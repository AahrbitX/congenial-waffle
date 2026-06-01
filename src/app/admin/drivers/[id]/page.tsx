"use client";

import React, { useState } from "react";
import { request } from "@/lib/api-client";
import { Breadcrumbs, Button, Card, Surface, Tabs, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  ProfileHeader,
  ProfileHeaderSkeleton,
} from "@/components/user/ProfileHeader";
import EditDriver from "./editDriver";

function DriverProfilePage() {
  const params = useParams<{ id: string }>();
  const driverId = params.id;
  const router = useRouter();
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

  const { data, isLoading } = useQuery<any>({
    queryKey: [driverId],
    queryFn: async () => {
      return request(`/api/drivers/${driverId}`, {
        method: "GET",
      });
    },
  });

  if (isLoading) {
    return <div>Loading driver data</div>;
  }

  if (!data?.data) {
    return <div>Driver not found</div>;
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
        {isLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
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
    </Surface>
  );
}

export default DriverProfilePage;
