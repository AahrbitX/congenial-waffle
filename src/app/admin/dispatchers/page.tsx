"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Surface } from "@heroui/react";
import { request } from "@/lib/api-client";
import TripDetails from "./tripDetails";
import AvailableDrivers from "./availableDrivers";
import { TripsList } from "./tripsList";

type DispatcherTrip = {
  id: string;
  bookingRef: string;
  customerName: string;
  vehicleType: string;
  ac: boolean;
  seats: number;
  pickupName: string;
  pickupZone: string;
  dropName: string;
  dropZone: string;
  status: string;
};

export default function AdminDispatchersPage() {
  const [activeTripId, setActiveTripId] = useState("");

  const { data, isLoading, isError } = useQuery<{ data: DispatcherTrip[] }>({
    queryKey: ["dispatchers"],
    queryFn: () => request("/api/dispatchers"),
    refetchInterval: 5000,
  });

  const trips = data?.data ?? [];

  return (
    <Surface className="h-full min-h-0 p-4" variant="secondary">
      <Surface className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[0.75fr_1fr_0.85fr] rounded-2xl overflow-hidden border">
        <TripsList
          trips={trips}
          activeTripId={activeTripId}
          setActiveTripIdAction={setActiveTripId}
          isLoading={isLoading}
          isError={isError}
        />

        <div className="max-md:border-b md:border-r h-full min-h-0 overflow-hidden">
          <TripDetails tripId={activeTripId} pageLoading={isLoading} />
        </div>

        <div className="h-full min-h-0 overflow-hidden">
          <AvailableDrivers tripId={activeTripId} pageLoading={isLoading} />
        </div>
      </Surface>
    </Surface>
  );
}
