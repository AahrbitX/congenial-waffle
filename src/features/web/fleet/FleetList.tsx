"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Users, Briefcase, Wind, Fuel, Check, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFleet, useFleetCar } from "@/hooks/useFleet";
import { useBooking } from "@/context/BookingContext";
import type { FleetCategory } from "@/types/fleet.types";

const CATEGORIES: FleetCategory[] = ["All", "Hatchback", "Sedan", "MUV", "Luxury", "Traveller"];

export function FleetList() {
  const searchParams   = useSearchParams();
  const urlCategory    = searchParams.get("category") as FleetCategory | null;
  const validCategory  = urlCategory && CATEGORIES.includes(urlCategory) ? urlCategory : "All";

  const [activeCategory, setActiveCategory] = useState<FleetCategory>(validCategory);
  const [selectedCarId,  setSelectedCarId]  = useState<string | null>(null);

  const { data: fleet = [], isLoading } = useFleet();
  const { data: selectedCar, isLoading: carLoading } = useFleetCar(selectedCarId ?? "");
  const { openBooking } = useBooking();

  // Sync category if URL param changes (e.g. browser back/forward)
  useEffect(() => {
    setActiveCategory(validCategory);
  }, [validCategory]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedCarId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedCarId]);

  const filtered = activeCategory === "All"
    ? fleet
    : fleet.filter((c) => c.category === activeCategory);

  return (
    <>
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
                <button
                  key={car.id}
                  onClick={() => setSelectedCarId(car.id)}
                  className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
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
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-[#0f0f0f]">
                      From <span className="text-blue-500">{car.priceFrom}</span>
                    </p>
                    <span className="bg-blue-500 text-white text-[12px] font-bold px-4 py-2 rounded-full">
                      View Details
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Car Detail Modal ── */}
      <AnimatePresence>
        {selectedCarId && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedCarId(null)}
            />

            {/* Modal panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedCarId(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X size={15} className="text-gray-600" />
                </button>

                {carLoading || !selectedCar ? (
                  <div className="p-8 animate-pulse space-y-4">
                    <div className="h-56 bg-gray-100 rounded-xl" />
                    <div className="h-6 w-1/2 bg-gray-100 rounded" />
                    <div className="h-4 w-1/3 bg-gray-100 rounded" />
                  </div>
                ) : (
                  <>
                    {/* Modal header */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                      <span className="text-[10px] font-bold tracking-[0.18em] text-blue-500 uppercase">
                        {selectedCar.category}
                      </span>
                      <h2 className="text-2xl font-black text-[#0f0f0f] mt-1">{selectedCar.name}</h2>
                      <p className="text-gray-400 text-[13px] mt-0.5">{selectedCar.tagline}</p>
                    </div>

                    {/* Modal body — 2 col on md+ */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Image */}
                      <img
                        src={selectedCar.image}
                        alt={selectedCar.name}
                        className="w-full h-52 object-cover rounded-xl shadow-sm"
                      />

                      {/* Right column */}
                      <div className="space-y-5">
                        {/* Specs */}
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.18em] text-blue-500 uppercase mb-3">
                            Specifications
                          </p>
                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { Icon: Users,     label: "Capacity", value: `${selectedCar.seats} Passengers` },
                              { Icon: Briefcase, label: "Luggage",  value: `${selectedCar.bags} Bags` },
                              { Icon: Wind,      label: "Climate",  value: selectedCar.ac ? "AC" : "Non-AC" },
                              { Icon: Fuel,      label: "Fuel",     value: selectedCar.fuel },
                            ].map(({ Icon, label, value }) => (
                              <div key={label} className="bg-[#f8f9fe] rounded-xl px-3 py-2.5">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <Icon size={11} className="text-gray-400" />
                                  <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
                                </div>
                                <p className="text-[12px] font-bold text-[#0f0f0f]">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.18em] text-blue-500 uppercase mb-3">
                            Key Features
                          </p>
                          <div className="grid grid-cols-2 gap-y-1.5">
                            {selectedCar.features.map((f) => (
                              <div key={f} className="flex items-center gap-1.5">
                                <Check size={12} className="text-blue-500 shrink-0" />
                                <span className="text-[12px] text-gray-600">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer — price + CTA */}
                    <div className="px-6 pb-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">Starting From</p>
                        <p className="text-2xl font-black text-[#0f0f0f]">{selectedCar.priceFrom}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCarId(null);
                          openBooking({ serviceId: "city-taxi", preselectedCategory: selectedCar.category });
                        }}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[14px] px-6 py-3 rounded-xl transition-colors group"
                      >
                        Book this Vehicle
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
