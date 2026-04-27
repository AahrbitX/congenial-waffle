"use client";

import { Dispatch, SetStateAction } from "react";
import { ScrollShadow, SearchField } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

import TripCard from "./tripCard";
import { request } from "@/lib/api-client";

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

type DispatchersResponse = {
  data: DispatcherTrip[];
};

type TripsListProps = {
  activeTripId: string;
  setActiveTripIdAction: Dispatch<SetStateAction<string>>;
};

export const TripsList = ({
  activeTripId,
  setActiveTripIdAction,
}: TripsListProps) => {
  const { data, isLoading, isError } = useQuery<DispatchersResponse>({
    queryKey: ["dispatchers"],
    queryFn: async () => {
      return request("/api/dispatchers", {
        method: "GET",
      });
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="p-4 text-sm">Loading trips...</div>;
  }

  if (isError) {
    return <div className="p-4 text-sm">Failed to load trips</div>;
  }

  const dispatchers = data?.data ?? [];

  return (
    <div className="flex min-h-0 flex-col border-r">
      <div className="shrink-0 border-b p-4">
        <SearchField aria-label="Search trips" variant="secondary">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search trips..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>

      <ScrollShadow className="scrollbar-thin min-h-0 flex-1">
        {dispatchers.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            isActive={activeTripId === trip.id}
            onSelect={setActiveTripIdAction}
          />
        ))}
      </ScrollShadow>
    </div>
  );
};
