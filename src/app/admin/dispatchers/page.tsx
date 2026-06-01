"use client";

import React, { useState } from "react";
import { Surface } from "@heroui/react";
import TripDetails from "./tripDetails";
import AvailableDrivers from "./availableDrivers";
import { TripsList } from "./tripsList";

export default function AdminDispatchersPage() {
  const [activeTripId, setActiveTripId] = useState("");

  return (
    <Surface className="h-full min-h-0 p-4" variant="secondary">
      <Surface className="grid h-full min-h-0 grid-cols-1  md:grid-cols-[0.75fr_1fr_0.85fr] rounded-2xl overflow-hidden ">
        <TripsList
          activeTripId={activeTripId}
          setActiveTripIdAction={setActiveTripId}
        />

        <div className="border-b md:border-r">
          <TripDetails tripId={activeTripId} />
        </div>

        <div className="h-full min-h-0 overflow-hidden">
          <AvailableDrivers tripId={activeTripId} />
        </div>
      </Surface>
    </Surface>
  );
}
