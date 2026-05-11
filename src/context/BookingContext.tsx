"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { BookRideModal } from "@/components/dashboard/BookRideModal";
import type { BookingInitialData } from "@/types/booking.types";

interface BookingContextValue {
  openBooking: (data?: BookingInitialData) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextValue>({
  openBooking: () => {},
  closeBooking: () => {},
});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen,      setIsOpen]      = useState(false);
  const [initialData, setInitialData] = useState<BookingInitialData | undefined>();

  const openBooking = useCallback((data?: BookingInitialData) => {
    setInitialData(data);
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsOpen(false);
    setInitialData(undefined);
  }, []);

  return (
    <BookingContext.Provider value={{ openBooking, closeBooking }}>
      {children}
      <BookRideModal
        isOpen={isOpen}
        onClose={closeBooking}
        onBooked={closeBooking}
        initialData={initialData}
      />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
