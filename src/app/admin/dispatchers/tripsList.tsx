"use client";

import { Dispatch, SetStateAction } from "react";
import { ScrollShadow, SearchField } from "@heroui/react";
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

type TripsListProps = {
  activeTripId: string;
  setActiveTripIdAction: Dispatch<SetStateAction<string>>;
  trips: DispatcherTrip[];
  isLoading: boolean;
  isError: boolean;
};

export const TripsList = ({
  activeTripId,
  setActiveTripIdAction,
  trips,
  isLoading,
  isError,
}: TripsListProps) => {
  if (isError) {
    return (
      <div className="h-full flex items-center justify-center px-6 text-center text-default-400 border-b md:border-r">
        <div className="space-y-2">
          <p className="text-lg font-semibold">Failed to load trips</p>
          <p className="text-sm">Failed to load trip data. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!isLoading && trips.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6 text-center text-default-400 border-b md:border-r">
        <div className="space-y-2">
          <p className="text-lg font-semibold">No Unassigned Trips</p>
          <p className="text-sm">There are no unassigned trips for now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-r">
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
          ? Array.from({ length: 3 }).map((_, i) => <TripCardSkeleton key={i} />)
          : trips.map((trip) => (
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
