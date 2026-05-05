"use client";

import { Dispatch, SetStateAction } from "react";
import { ScrollShadow, SearchField } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

import { request } from "@/lib/api-client";
import TripCard, { TripCardSkeleton } from "./tripCard";

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

  if (isError) {
    return <div className="p-4 text-sm">Failed to load trips</div>;
  }

  const dispatchers = data?.data ?? [];

  if (dispatchers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6 text-center text-default-400 border-r">
        <div className="space-y-2">
          <p className="text-lg font-semibold">No Unassigned Trips</p>
          <p className="text-sm">There is no unassigned trips for now</p>
        </div>
      </div>
    );
  }

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
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <TripCardSkeleton key={index} />
            ))
          : dispatchers.map((trip) => (
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
