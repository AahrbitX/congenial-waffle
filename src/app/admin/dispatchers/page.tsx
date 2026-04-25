"use client";

import React, { useState } from "react";
import { ScrollShadow, SearchField, Surface } from "@heroui/react";
import TripCard from "./tripCard";
import TripDetails from "./tripDetails";
import AvailableDrivers from "./availableDrivers";

const MOCK_TRIPS = [
  {
    id: "TRPAA001",
    customerName: "Priya Sharma",
    vehicleType: "Sedan",
    ac: true,
    seats: 4,
    pickup: "Ambattur OT Bus Stand, Chennai",
    drop: "Chennai Central Railway Station, Chennai",
    status: "Unassigned",
  },
  {
    id: "TRPAA002",
    customerName: "Amit Tiwari",
    vehicleType: "Mini",
    ac: false,
    seats: 4,
    pickup: "Anna Nagar Roundtana, Chennai",
    drop: "Chennai International Airport, Chennai",
    status: "Unassigned",
  },
  {
    id: "TRPAA007",
    customerName: "Karthik Raj",
    vehicleType: "Mini",
    ac: false,
    seats: 4,
    pickup: "Vadapalani Bus Depot, Chennai",
    drop: "Phoenix Marketcity, Velachery, Chennai",
    status: "Unassigned",
  },
  {
    id: "TRPAA003",
    customerName: "Neha Roy",
    vehicleType: "MPV",
    ac: true,
    seats: 7,
    pickup: "T Nagar Bus Terminus, Chennai",
    drop: "Marina Beach, Chennai",
    status: "Unassigned",
  },
  {
    id: "TRPAA004",
    customerName: "Raj Mehta",
    vehicleType: "Sedan",
    ac: true,
    seats: 4,
    pickup: "Porur Junction, Chennai",
    drop: "DLF IT Park, Ramapuram, Chennai",
    status: "Unassigned",
  },
  {
    id: "TRPAA005",
    customerName: "Sneha Iyer",
    vehicleType: "Sedan",
    ac: true,
    seats: 4,
    pickup: "Tambaram Railway Station, Chennai",
    drop: "OMR Sholinganallur Junction, Chennai",
    status: "Unassigned",
  },
  {
    id: "TRPAA006",
    customerName: "Vignesh Kumar",
    vehicleType: "MPV",
    ac: true,
    seats: 6,
    pickup: "Koyambedu Bus Terminus, Chennai",
    drop: "Mylapore Kapaleeshwarar Temple, Chennai",
    status: "Unassigned",
  },
];

const MOCK_DRIVERS = [
  {
    id: "DVR-A-001",
    name: "Ravi Kumar",
    avatar: "RK",
    vehicleType: "Sedan",
    ac: true,
    seats: 4,
    eta: "3 min",
    rating: 4.5,
  },
  {
    id: "DVR-A-002",
    name: "Vijay More",
    avatar: "VM",
    vehicleType: "Sedan",
    ac: true,
    seats: 4,
    eta: "8 min",
    rating: 4.2,
  },
];

export default function AdminDispatchersPage() {
  const [activeTripId, setActiveTripId] = useState("TRPAA001");

  const activeTrip = (tripId: string) =>
    MOCK_TRIPS.find((t) => t.id === tripId);

  return (
    <Surface className="h-full min-h-0 p-4" variant="secondary">
      <Surface className="grid h-full min-h-0 grid-cols-[0.75fr_1fr_0.85fr] rounded-2xl overflow-hidden">
        <div className="flex min-h-0 flex-col border-r">
          <div className="p-4 border-b shrink-0">
            <SearchField aria-label="Search trips">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search trips..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </div>
          <ScrollShadow className="scrollbar-thin">
            <div className="min-h-0 flex-1 overflow-y-auto ">
              {MOCK_TRIPS.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isActive={activeTripId === trip.id}
                  onSelect={setActiveTripId}
                />
              ))}
            </div>
          </ScrollShadow>
        </div>

        <div className="border-r">
          <TripDetails trip={activeTrip(activeTripId)} />
        </div>
        <div>
          <AvailableDrivers drivers={MOCK_DRIVERS} />
        </div>
      </Surface>
    </Surface>
  );
}
