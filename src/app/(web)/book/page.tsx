"use client";

import { useEffect } from "react";
import { Car, ArrowRight } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

export default function BookPage() {
  const { openBooking } = useBooking();

  // Auto-open the booking modal when navigating to /book
  useEffect(() => {
    openBooking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#f8f9fe]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <Car size={36} className="text-white" />
        </div>
        <h1 className="text-[2rem] font-black tracking-tight text-[#0f0f0f] mb-3">
          Book a Ride
        </h1>
        <p className="text-gray-400 text-[15px] leading-relaxed mb-8">
          Tell us where you&apos;re headed and we&apos;ll find you the perfect cab — instantly.
        </p>
        <button
          onClick={() => openBooking()}
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[15px] px-8 py-4 rounded-full transition-colors group"
        >
          Start Booking
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </main>
  );
}
