"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Ride } from "@/types/ride.types";

interface DashboardContextValue {
  // Notification panel
  notifOpen: boolean;
  openNotifPanel: () => void;
  closeNotifPanel: () => void;
  // Rating modal
  ratingRide: Ride | null;
  openRatingModal: (ride: Ride) => void;
  closeRatingModal: () => void;
  // Active trip
  activeTrip: boolean;
  setActiveTrip: (v: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [notifOpen, setNotifOpen]   = useState(false);
  const [ratingRide, setRatingRide] = useState<Ride | null>(null);
  const [activeTrip, setActiveTrip] = useState(false);

  return (
    <DashboardContext.Provider
      value={{
        notifOpen,
        openNotifPanel:  () => setNotifOpen(true),
        closeNotifPanel: () => setNotifOpen(false),
        ratingRide,
        openRatingModal:  (ride) => setRatingRide(ride),
        closeRatingModal: () => setRatingRide(null),
        activeTrip,
        setActiveTrip,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
