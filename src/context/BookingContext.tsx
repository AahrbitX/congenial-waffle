"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { BookRideModal } from "@/components/dashboard/BookRideModal";

interface BookingContextValue {
  openBooking: (serviceName?: string) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextValue>({
  openBooking: () => {},
  closeBooking: () => {},
});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [serviceName, setServiceName] = useState<string | undefined>();

  const openBooking = useCallback((name?: string) => {
    setServiceName(name);
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsOpen(false);
    setServiceName(undefined);
  }, []);

  return (
    <BookingContext.Provider value={{ openBooking, closeBooking }}>
      {children}
      <BookRideModal
        isOpen={isOpen}
        onClose={closeBooking}
        onBooked={closeBooking}
        serviceName={serviceName}
      />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
