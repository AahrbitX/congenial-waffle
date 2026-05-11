"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Users, Briefcase, Wind, Fuel, Check } from "lucide-react";
import { useFleetCar } from "@/hooks/useFleet";
import { useBooking } from "@/context/BookingContext";

interface FleetDetailProps {
  id: string;
}

export function FleetDetail({ id }: FleetDetailProps) {
  const { data: car, isLoading } = useFleetCar(id);
  const { openBooking } = useBooking();

  if (isLoading) {
    return (
      <main className="w-full">
        <div className="pt-36 pb-20 px-8 sm:px-16 bg-white">
          <div className="max-w-4xl mx-auto animate-pulse space-y-6">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-80 bg-gray-100 rounded-2xl" />
            <div className="h-8 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (!car) {
    notFound();
  }

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="pt-36 pb-12 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-blue-500 transition-colors mb-8"
          >
            <ArrowLeft size={13} /> All Vehicles
          </Link>
          <span className="block text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-2">{car.category}</span>
          <h1 className="text-[clamp(2rem,5vw,4rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f] mb-3">
            {car.name}
          </h1>
          <p className="text-gray-400 text-[15px] mb-8">{car.tagline}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-8 sm:px-16 bg-[#f8f9fe]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div>
            <img
              src={car.image}
              alt={car.name}
              className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-md"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Specs */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-4">Specifications</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { Icon: Users,    label: "CAPACITY",  value: `${car.seats} Passengers` },
                  { Icon: Briefcase,label: "LUGGAGE",   value: `${car.bags} Bags` },
                  { Icon: Wind,     label: "CLIMATE",   value: car.ac ? "AC" : "Non-AC" },
                  { Icon: Fuel,     label: "FUEL",      value: car.fuel },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="bg-white rounded-xl px-3 py-2.5 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon size={11} className="text-gray-400" />
                      <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
                    </div>
                    <p className="text-[13px] font-bold text-[#0f0f0f]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-4">Key Features</p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                {car.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={13} className="text-blue-500 shrink-0" />
                    <span className="text-[13px] text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing + CTA */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Starting From</p>
                <p className="text-[28px] font-black text-[#0f0f0f]">{car.priceFrom}</p>
              </div>
              <button
                onClick={() => openBooking(car.name)}
                className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[15px] py-4 rounded-xl transition-colors group"
              >
                Book this Vehicle
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
