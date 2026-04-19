"use client";

import React from "react";
import { useBookings } from "@/hooks/useBookings";

function RideHistoryPage() {
  const { data: bookings } = useBookings();
  return (
    <main className="max-w-7xl w-full mx-auto min-h-screen p-4">
      <h1 id="book-a-ride-now" className="text-3xl font-semibold text-center">
        RideHistoryPage
      </h1>
      <div>{JSON.stringify(bookings, null, 2)}</div>
    </main>
  );
}

export default RideHistoryPage;
