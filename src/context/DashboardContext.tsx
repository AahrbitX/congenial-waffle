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
  // Raise ticket modal
  ticketRide: Ride | null;
  openTicketModal: (ride: Ride) => void;
  closeTicketModal: () => void;
  // Book ride modal
  bookOpen: boolean;
  openBookModal: () => void;
  closeBookModal: () => void;
  // Active trip
  activeTrip: boolean;
  setActiveTrip: (v: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [notifOpen, setNotifOpen]   = useState(false);
  const [ratingRide, setRatingRide] = useState<Ride | null>(null);
  const [ticketRide, setTicketRide] = useState<Ride | null>(null);
  const [bookOpen, setBookOpen]     = useState(false);
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
        ticketRide,
        openTicketModal:  (ride) => setTicketRide(ride),
        closeTicketModal: () => setTicketRide(null),
        bookOpen,
        openBookModal:  () => setBookOpen(true),
        closeBookModal: () => setBookOpen(false),
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
