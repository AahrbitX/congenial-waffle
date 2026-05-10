"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Users, Briefcase, Wind, Fuel, Check, ArrowRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "All" | "Hatchback" | "Sedan" | "MUV" | "Luxury" | "Traveller";

interface Car {
  id: string;
  name: string;
  tagline: string;
  category: Exclude<Category, "All">;
  image: string;
  seats: number;
  bags: number;
  ac: boolean;
  fuel: string;
  features: string[];
  priceFrom: string;
}

// ─── Fleet Data ───────────────────────────────────────────────────────────────

const FLEET: Car[] = [
  {
    id: "swift",
    name: "Maruti Swift",
    tagline: "Compact · City Friendly · Budget",
    category: "Hatchback",
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80",
    seats: 4, bags: 2, ac: true, fuel: "Petrol/Diesel",
    features: ["Tall Boy Design", "Easy Entry", "Budget Friendly", "City Ready"],
    priceFrom: "₹9/km",
  },
  {
    id: "alto",
    name: "Maruti Alto",
    tagline: "Economy · Compact · Short Trips",
    category: "Hatchback",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80",
    seats: 4, bags: 2, ac: true, fuel: "Petrol",
    features: ["Low Maintenance", "Fuel Efficient", "Easy Parking", "Budget Pick"],
    priceFrom: "₹8/km",
  },
  {
    id: "ritz",
    name: "Maruti Ritz",
    tagline: "Premium Hatchback · City & Outstation",
    category: "Hatchback",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80",
    seats: 4, bags: 2, ac: true, fuel: "Diesel",
    features: ["Tall Boy Design", "Easy Entry", "Budget", "Outstation Ready"],
    priceFrom: "₹10/km",
  },
  {
    id: "dzire",
    name: "Maruti Dzire",
    tagline: "Comfortable · Popular · Reliable",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80",
    seats: 4, bags: 3, ac: true, fuel: "Petrol/CNG",
    features: ["Spacious Boot", "Smooth Ride", "Fuel Efficient", "Most Booked"],
    priceFrom: "₹12/km",
  },
  {
    id: "etios",
    name: "Toyota Etios",
    tagline: "Reliable · Roomy · Long Trips",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
    seats: 4, bags: 3, ac: true, fuel: "Diesel",
    features: ["Large Cabin", "Low Noise", "Highway Comfort", "Toyota Quality"],
    priceFrom: "₹13/km",
  },
  {
    id: "xcent",
    name: "Hyundai Xcent",
    tagline: "Elegant · Comfortable · Smart",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80",
    seats: 4, bags: 3, ac: true, fuel: "Diesel",
    features: ["Premium Interior", "Touchscreen", "Cruise Control", "Bluetooth"],
    priceFrom: "₹13/km",
  },
  {
    id: "ertiga",
    name: "Maruti Ertiga",
    tagline: "Family · 7 Seater · Versatile",
    category: "MUV",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    seats: 6, bags: 4, ac: true, fuel: "Petrol/CNG",
    features: ["3-Row Seating", "Sliding Doors", "Family Friendly", "Luggage Space"],
    priceFrom: "₹16/km",
  },
  {
    id: "innova",
    name: "Toyota Innova",
    tagline: "Premium MUV · Group Travel · Outstation",
    category: "MUV",
    image: "https://images.unsplash.com/photo-1518987048-93e29699e79a?w=600&q=80",
    seats: 7, bags: 5, ac: true, fuel: "Diesel",
    features: ["Premium Cabin", "Captain Seats", "Long Range", "Top Rated"],
    priceFrom: "₹18/km",
  },
  {
    id: "crysta",
    name: "Innova Crysta",
    tagline: "Executive · Spacious · Premium",
    category: "MUV",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80",
    seats: 7, bags: 5, ac: true, fuel: "Diesel",
    features: ["Leather Seats", "Sunroof", "Premium Audio", "Executive Look"],
    priceFrom: "₹20/km",
  },
  {
    id: "camry",
    name: "Toyota Camry",
    tagline: "Executive · Hybrid · Ultra-Smooth",
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80",
    seats: 4, bags: 3, ac: true, fuel: "Hybrid",
    features: ["Leather Interior", "Ambient Lighting", "Quiet Cabin", "Chauffeur Ready"],
    priceFrom: "₹24/km",
  },
  {
    id: "bmw5",
    name: "BMW 5 Series",
    tagline: "Luxury · Business Class · Prestige",
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
    seats: 4, bags: 3, ac: true, fuel: "Petrol",
    features: ["Premium Leather", "Panoramic Roof", "Massage Seats", "VIP Experience"],
    priceFrom: "₹40/km",
  },
  {
    id: "tempo",
    name: "Tempo Traveller",
    tagline: "Group · 12 Seater · Tours",
    category: "Traveller",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
    seats: 12, bags: 8, ac: true, fuel: "Diesel",
    features: ["Push-Back Seats", "Roof Carrier", "Group Tours", "Pilgrimage Ready"],
    priceFrom: "₹25/km",
  },
];

const CATEGORIES: Category[] = ["All", "Hatchback", "Sedan", "MUV", "Luxury", "Traveller"];

// ─── Car Modal ────────────────────────────────────────────────────────────────

function CarModal({ car, onClose }: { car: Car; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Left – image + category */}
          <div className="bg-gray-50 flex flex-col items-center justify-center p-8 gap-4">
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase self-start">
              {car.category}
            </span>
            <img
              src={car.image}
              alt={car.name}
              className="w-full h-44 object-cover rounded-2xl"
            />
          </div>

          {/* Right – details */}
          <div className="p-7 flex flex-col gap-5 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={15} />
            </button>

            <div>
              <h2 className="text-xl font-black text-[#0f0f0f] tracking-tight">{car.name}</h2>
              <p className="text-[13px] text-gray-400 mt-1">{car.tagline}</p>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { Icon: Users,    label: "CAPACITY",  value: `${car.seats} Passengers` },
                { Icon: Briefcase,label: "LUGGAGE",   value: `${car.bags} Bags` },
                { Icon: Wind,     label: "CLIMATE",   value: car.ac ? "AC" : "Non-AC" },
                { Icon: Fuel,     label: "FUEL",      value: car.fuel },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon size={11} className="text-gray-400" />
                    <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
                  </div>
                  <p className="text-[13px] font-bold text-[#0f0f0f]">{value}</p>
                </div>
              ))}
            </div>

            {/* Key features */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Check size={12} className="text-blue-500" />
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Key Features</p>
              </div>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                {car.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5">
                    <Check size={12} className="text-blue-500 shrink-0" />
                    <span className="text-[12px] text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/book"
              className="mt-auto w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-[14px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors group"
            >
              Choose Your Ride
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Car Card ─────────────────────────────────────────────────────────────────

function CarCard({ car, onClick }: { car: Car; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
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
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-bold px-4 py-2 rounded-full transition-colors">
          Choose Your Ride
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const filtered = activeCategory === "All"
    ? FLEET
    : FLEET.filter((c) => c.category === activeCategory);

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="pt-36 pb-12 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">Our Fleet</span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f] mt-4 max-w-2xl">
            The right car<br />
            <span className="text-blue-500 italic">for every ride.</span>
          </h1>
          <p className="text-gray-400 text-[15px] mt-4 max-w-lg leading-relaxed">
            From budget hatchbacks to luxury sedans — all AC, all verified, all at transparent fares.
          </p>
        </div>
      </section>

      {/* Filter tabs + Grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((car) => (
              <CarCard key={car.id} car={car} onClick={() => setSelectedCar(car)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 sm:px-16 bg-blue-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight max-w-xl">
            Don&apos;t see what you need? Just ask.
          </h2>
          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-500 font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group shrink-0"
          >
            Chat on WhatsApp
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* Car detail modal */}
      {selectedCar && (
        <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </main>
  );
}
