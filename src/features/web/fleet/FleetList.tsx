"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Briefcase, Wind, Fuel } from "lucide-react";
import { useFleet } from "@/hooks/useFleet";
import type { FleetCategory } from "@/types/fleet.types";

const CATEGORIES: FleetCategory[] = ["All", "Hatchback", "Sedan", "MUV", "Luxury", "Traveller"];

export function FleetList() {
  const [activeCategory, setActiveCategory] = useState<FleetCategory>("All");
  const { data: fleet = [], isLoading } = useFleet();

  const filtered = activeCategory === "All"
    ? fleet
    : fleet.filter((c) => c.category === activeCategory);

  return (
    <section className="py-16 px-8 sm:px-16 bg-[#f8f9fe]">
      <div className="max-w-7xl mx-auto">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cars grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((car) => (
              <Link
                key={car.id}
                href={`/fleet/${car.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-[1.02] transition-transform duration-200"
                />
                <p className="text-base font-extrabold text-[#0f0f0f]">{car.name}</p>
                <p className="text-[12px] text-gray-400 mt-0.5 mb-4">{car.tagline}</p>

                <div className="flex items-center gap-4 text-[12px] text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Users size={12} /> {car.seats} Seats</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {car.bags} Bags</span>
                  {car.ac && <span className="flex items-center gap-1"><Wind size={12} /> AC</span>}
                  <span className="flex items-center gap-1"><Fuel size={12} /> {car.fuel}</span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-[#0f0f0f]">
                    From <span className="text-blue-500">{car.priceFrom}</span>
                  </p>
                  <span className="bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-bold px-4 py-2 rounded-full transition-colors">
                    View Details
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
