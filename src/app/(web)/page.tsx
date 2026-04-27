"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, Chip, Input } from "@heroui/react";
import {
  ArrowRight,
  Check,
  Shield,
  Clock,
  IndianRupee,
  Phone,
  ArrowLeftRight,
  ChevronDown,
  Calendar,
  Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchTab = "local" | "outstation" | "airport";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  "No surge pricing",
  "24/7 support",
  "Verified drivers",
  "Free cancellation up to 1 hour",
  "Fixed fares, no hidden charges",
];

const CARS = [
  {
    name: "Hatchback",
    meta: "4 seats · AC · Compact",
    price: "₹9",
    unit: "/ km · Min ₹150",
    badge: "Most Booked",
  },
  {
    name: "Sedan",
    meta: "4 seats · AC · Comfortable",
    price: "₹12",
    unit: "/ km · Min ₹200",
    badge: "Top Rated",
  },
  {
    name: "SUV",
    meta: "6 seats · AC · Spacious",
    price: "₹16",
    unit: "/ km · Min ₹280",
    badge: "Trending",
  },
  {
    name: "Luxury",
    meta: "4 seats · AC · Executive",
    price: "₹24",
    unit: "/ km · Min ₹500",
    badge: "Premium",
  },
];

const PACKAGES = [
  {
    label: "OUTSTATION RIDE",
    tag: "Best Value",
    name: "One-Way Drop",
    desc: "Travel to your destination without worrying about return fare. Ideal for one-time trips to any city.",
    price: "₹999",
    unit: "onwards",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
    cta: "Book Now",
    href: "/book",
  },
  {
    label: "ROUND TRIP",
    tag: "Popular",
    name: "Round Trip Package",
    desc: "Go and come back at your own schedule. Driver waits for you at the destination.",
    price: "₹1,799",
    unit: "/ day",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    cta: "Book Now",
    href: "/book",
  },
  {
    label: "AIRPORT TRANSFER",
    tag: "Fixed Fare",
    name: "Airport Transfer",
    desc: "Stress-free airport pickup and drops. Fixed pricing, flight-tracking, and on-time guarantee.",
    price: "₹599",
    unit: "flat",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    cta: "Book Now",
    href: "/book",
  },
  {
    label: "FULL DAY HIRE",
    tag: "Flexible",
    name: "8 Hours / 80 km",
    desc: "A dedicated cab for the whole day. Meetings, errands, sightseeing — your driver stays with you.",
    price: "₹1,299",
    unit: "/ 8 hrs",
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    cta: "Book Now",
    href: "/book",
  },
  {
    label: "WEEKLY PLAN",
    tag: "Save 20%",
    name: "Weekly Commute",
    desc: "Book for 5 or 7 days at a flat weekly rate. Perfect for office commuters and regular travellers.",
    price: "₹3,999",
    unit: "/ week",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    cta: "Book Now",
    href: "/book",
  },
  {
    label: "CORPORATE",
    tag: "For Teams",
    name: "Corporate Plan",
    desc: "Managed billing, GST invoices, priority support, and bulk bookings for your entire organisation.",
    price: "Custom",
    unit: "pricing",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    cta: "Contact Us",
    href: "/contact",
  },
];

const WHY_ITEMS = [
  {
    Icon: Shield,
    title: "Verified Drivers",
    desc: "Every driver undergoes background checks, license verification, and safety training before joining.",
  },
  {
    Icon: Clock,
    title: "Always On Time",
    desc: "Our drivers arrive within the promised window. We track live traffic so you are never late.",
  },
  {
    Icon: IndianRupee,
    title: "Fixed Fares",
    desc: "No surge pricing, ever. The price you see at booking is exactly what you pay — guaranteed.",
  },
  {
    Icon: Phone,
    title: "24/7 Support",
    desc: "Our support team is available round the clock via call, chat, or email — always there for you.",
  },
];

const TESTIMONIALS = [
  {
    rating: 5,
    text: "Booked a cab for my parents' hospital visit. Driver was polite, punctual, and helped them with their bags. Absolutely top-notch service.",
    name: "Ramesh K.",
    location: "Delhi, Regular Customer",
    initial: "R",
    avatarColor: "#e8f3ff",
  },
  {
    rating: 5,
    text: "The airport package saved me so much stress. Flight was delayed and the driver waited without charging extra. Will always use Mohans Cabs!",
    name: "Priya S.",
    location: "Mumbai, Frequent Traveller",
    initial: "P",
    avatarColor: "#d1fae5",
  },
  {
    rating: 4,
    text: "Corporate plan is great for our team. GST invoices, professional drivers, and no billing surprises. Made my job as an admin so much easier.",
    name: "Ankit M.",
    location: "Bangalore, HR Manager",
    initial: "A",
    avatarColor: "#ede9fe",
  },
];

// ─── Car SVG Illustrations ────────────────────────────────────────────────────

function HatchbackSvg() {
  return (
    <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-auto">
      <rect x="10" y="28" width="100" height="22" rx="4" fill="#E5E7EB" />
      <path d="M25 28 Q35 10 55 10 Q75 10 85 28Z" fill="#D1D5DB" />
      <rect x="30" y="14" width="18" height="13" rx="2" fill="#93C5FD" opacity=".8" />
      <rect x="52" y="14" width="20" height="13" rx="2" fill="#93C5FD" opacity=".8" />
      <circle cx="30" cy="50" r="8" fill="#374151" />
      <circle cx="30" cy="50" r="4" fill="#9CA3AF" />
      <circle cx="90" cy="50" r="8" fill="#374151" />
      <circle cx="90" cy="50" r="4" fill="#9CA3AF" />
      <rect x="8" y="32" width="12" height="6" rx="2" fill="#1877F2" />
      <rect x="100" y="32" width="12" height="6" rx="2" fill="#F87171" />
    </svg>
  );
}

function SedanSvg() {
  return (
    <svg viewBox="0 0 120 60" fill="none" className="w-28 h-auto">
      <rect x="5" y="30" width="110" height="20" rx="4" fill="#E5E7EB" />
      <path d="M20 30 Q28 14 50 13 Q75 13 95 30Z" fill="#C7D2FE" />
      <rect x="28" y="17" width="20" height="12" rx="2" fill="#93C5FD" opacity=".8" />
      <rect x="54" y="17" width="22" height="12" rx="2" fill="#93C5FD" opacity=".8" />
      <circle cx="28" cy="50" r="8" fill="#374151" />
      <circle cx="28" cy="50" r="4" fill="#9CA3AF" />
      <circle cx="92" cy="50" r="8" fill="#374151" />
      <circle cx="92" cy="50" r="4" fill="#9CA3AF" />
      <rect x="3" y="33" width="14" height="6" rx="2" fill="#1877F2" />
      <rect x="103" y="33" width="14" height="6" rx="2" fill="#F87171" />
    </svg>
  );
}

function SuvSvg() {
  return (
    <svg viewBox="0 0 120 65" fill="none" className="w-28 h-auto">
      <rect x="5" y="25" width="110" height="30" rx="5" fill="#D1D5DB" />
      <rect x="12" y="10" width="96" height="20" rx="4" fill="#B0B8C1" />
      <rect x="18" y="13" width="22" height="13" rx="2" fill="#93C5FD" opacity=".8" />
      <rect x="46" y="13" width="22" height="13" rx="2" fill="#93C5FD" opacity=".8" />
      <rect x="74" y="13" width="20" height="13" rx="2" fill="#93C5FD" opacity=".8" />
      <circle cx="27" cy="55" r="9" fill="#374151" />
      <circle cx="27" cy="55" r="4.5" fill="#9CA3AF" />
      <circle cx="93" cy="55" r="9" fill="#374151" />
      <circle cx="93" cy="55" r="4.5" fill="#9CA3AF" />
      <rect x="2" y="29" width="14" height="7" rx="2" fill="#1877F2" />
      <rect x="104" y="29" width="14" height="7" rx="2" fill="#F87171" />
    </svg>
  );
}

function LuxurySvg() {
  return (
    <svg viewBox="0 0 120 60" fill="none" className="w-28 h-auto">
      <rect x="4" y="28" width="112" height="22" rx="5" fill="#1E293B" />
      <path d="M18 28 Q26 12 52 11 Q80 11 100 28Z" fill="#334155" />
      <rect x="26" y="15" width="22" height="12" rx="2" fill="#7DD3FC" opacity=".9" />
      <rect x="56" y="15" width="24" height="12" rx="2" fill="#7DD3FC" opacity=".9" />
      <circle cx="28" cy="50" r="8" fill="#0F172A" />
      <circle cx="28" cy="50" r="4" fill="#475569" />
      <circle cx="92" cy="50" r="8" fill="#0F172A" />
      <circle cx="92" cy="50" r="4" fill="#475569" />
      <rect x="2" y="31" width="14" height="6" rx="2" fill="#1877F2" />
      <rect x="104" y="31" width="14" height="6" rx="2" fill="#F87171" />
    </svg>
  );
}

const CAR_SVGS = [HatchbackSvg, SedanSvg, SuvSvg, LuxurySvg];

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const [activeTab, setActiveTab] = useState<SearchTab>("local");
  const [fromCity, setFromCity] = useState("New Delhi");
  const [toCity, setToCity] = useState("Mumbai");

  const tabs: { id: SearchTab; label: string }[] = [
    { id: "local", label: "Local" },
    { id: "outstation", label: "Outstation" },
    { id: "airport", label: "Airport Transfer" },
  ];

  const swapCities = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  return (
    <section
      className="relative min-h-screen flex flex-col justify-end pb-14"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1920&q=85')",
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(24,119,242,0.3) 0%, rgba(10,50,130,0.15) 40%, rgba(0,15,60,0.82) 100%)",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 px-8 sm:px-16 max-w-2xl mb-10">
        <p className="text-xs font-semibold text-white/70 tracking-[0.12em] uppercase mb-4">
          Trusted by 5 lakh+ riders
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.15] text-white mb-6 tracking-tight">
          Hey Buddy! where are you{" "}
          <span className="font-black italic">Riding</span> to?
        </h1>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 text-white font-bold text-[15px] opacity-90 hover:opacity-100 transition-opacity group"
        >
          Explore Now
          <ArrowRight
            size={17}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Search card */}
      <Card className="relative z-10 mx-4 sm:mx-8 lg:mx-16 rounded-2xl shadow-2xl max-w-4xl border-none p-0 gap-0">
        {/* Tabs */}
        <div className="flex rounded-t-2xl overflow-hidden">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              onPress={() => setActiveTab(tab.id)}
              className={`rounded-none px-7 py-4 text-sm font-bold h-auto ${
                activeTab === tab.id
                  ? "bg-[#1877F2] text-white"
                  : "text-[#65676b] hover:bg-[#f0f2f5]"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-0 px-5 py-3 border-b border-[#dce1e9]">
          {["One Way", "1 Passenger", "AC Car"].map((filter, i) => (
            <div key={filter} className="flex items-center">
              {i > 0 && <div className="w-px h-5 bg-[#dce1e9] mx-1" />}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 rounded text-sm font-semibold text-[#1c1e21] h-auto px-3 py-1.5"
              >
                {filter}
                <ChevronDown size={12} className="text-[#65676b]" />
              </Button>
            </div>
          ))}
        </div>

        {/* Fields row */}
        <div className="flex flex-wrap lg:flex-nowrap items-stretch px-5 pb-5 pt-2">
          {/* From */}
          <div className="flex-1 min-w-[140px] px-2 py-2">
            <p className="text-[10px] font-bold text-[#65676b] tracking-[0.08em] uppercase mb-1">
              From
            </p>
            <Input
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              className="text-[1.5rem] font-black"
              aria-label="From city"
            />
            <p className="text-[11px] text-[#65676b] font-medium mt-1 px-1">
              India &middot;{" "}
              <span className="underline cursor-pointer">Change location</span>
            </p>
          </div>

          {/* Swap button */}
          <div className="flex items-center px-1">
            <Button
              isIconOnly
              variant="ghost"
              onPress={swapCities}
              className="w-9 h-9 rounded-full border border-[#dce1e9] hover:border-[#1877F2]"
              aria-label="Swap cities"
            >
              <ArrowLeftRight size={14} className="text-[#1c1e21]" />
            </Button>
          </div>

          {/* To */}
          <div className="flex-1 min-w-[140px] px-2 py-2">
            <p className="text-[10px] font-bold text-[#65676b] tracking-[0.08em] uppercase mb-1">
              To
            </p>
            <Input
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              className="text-[1.5rem] font-black"
              aria-label="To city"
            />
            <p className="text-[11px] text-[#65676b] font-medium mt-1 px-1">
              India &middot;{" "}
              <span className="underline cursor-pointer">Change location</span>
            </p>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-[#dce1e9] my-3" />

          {/* Departure */}
          <div className="px-4 py-2 cursor-pointer">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#65676b] tracking-[0.08em] uppercase mb-1.5">
              Departure
              <Calendar size={11} />
            </div>
            <p className="text-xl font-black text-[#1c1e21] tracking-tight leading-none">
              Today
            </p>
            <div className="flex gap-3 mt-2 text-[11px] text-[#65676b] font-medium">
              <span className="cursor-pointer hover:text-[#1c1e21]">Prev</span>
              <span className="cursor-pointer hover:text-[#1c1e21]">Next</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-[#dce1e9] my-3" />

          {/* Return */}
          <div className="px-4 py-2 cursor-pointer">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#65676b] tracking-[0.08em] uppercase mb-1.5">
              Return
              <Calendar size={11} />
            </div>
            <p className="text-xl font-black text-[#1c1e21] tracking-tight leading-none">
              —
            </p>
            <div className="flex gap-3 mt-2 text-[11px] text-[#65676b] font-medium">
              <span className="cursor-pointer hover:text-[#1c1e21]">Prev</span>
              <span className="cursor-pointer hover:text-[#1c1e21]">Next</span>
            </div>
          </div>

          {/* Search button */}
          <div className="flex items-center ml-3 mt-2 lg:mt-0">
            <Link href="/book">
              <Button
                variant="primary"
                className="flex items-center gap-2 px-6 h-14 rounded-xl text-sm font-extrabold bg-[#1877F2] text-white hover:bg-[#166FE5] whitespace-nowrap"
              >
                Search Cabs
                <ArrowRight size={17} />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ─── Trust Strip ──────────────────────────────────────────────────────────────

function TrustStrip() {
  return (
    <div className="flex items-center px-8 sm:px-12 py-4 overflow-x-auto bg-[#1877F2]">
      {TRUST_ITEMS.map((item, i) => (
        <div key={item} className="flex items-center shrink-0">
          {i > 0 && (
            <div className="w-1 h-1 rounded-full bg-white/40 mx-7 shrink-0" />
          )}
          <span className="flex items-center gap-2 text-[13px] font-bold text-white whitespace-nowrap">
            <Check size={13} strokeWidth={3} />
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Cars Section ─────────────────────────────────────────────────────────────

function CarsSection() {
  return (
    <section className="py-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-[1.75rem] font-extrabold text-[#1c1e21] tracking-tight">
            Select Your Car
          </h2>
          <p className="text-sm text-[#65676b] font-medium mt-1">
            Choose the perfect ride for every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARS.map((car, i) => {
            const CarSvg = CAR_SVGS[i];
            return (
              <Card
                key={car.name}
                className="relative border border-[#dce1e9] rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <Chip
                  className="absolute top-3.5 right-3.5 bg-[#e8f3ff] text-[#1877F2] text-[11px] font-bold border-none"
                  size="sm"
                >
                  {car.badge}
                </Chip>

                <div className="flex items-center justify-center h-24 mb-4">
                  <CarSvg />
                </div>

                <p className="text-base font-extrabold text-[#1c1e21]">
                  {car.name}
                </p>
                <p className="text-[12px] text-[#65676b] font-medium mt-0.5">
                  {car.meta}
                </p>
                <p className="mt-3 text-[15px] font-extrabold text-[#1c1e21]">
                  {car.price}{" "}
                  <span className="text-[12px] font-medium text-[#65676b]">
                    {car.unit}
                  </span>
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Packages Section ─────────────────────────────────────────────────────────

function PackagesSection() {
  return (
    <section className="py-20 px-6 sm:px-12 bg-[#f0f2f5]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-[1.75rem] font-extrabold text-[#1c1e21] tracking-tight">
            Our Packages
          </h2>
          <p className="text-sm text-[#65676b] font-medium mt-1">
            Flat-rate deals for every kind of journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.name}
              className="border border-[#dce1e9] rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-0 gap-0"
            >
              {/* Image */}
              <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url('${pkg.image}')` }}
              >
                <div className="absolute inset-0 bg-black/35 flex items-end p-4">
                  <span className="text-[10px] font-bold text-white tracking-[0.1em] uppercase">
                    {pkg.label}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <Chip
                  className="bg-[#1877F2] text-white text-[11px] font-bold border-none mb-2"
                  size="sm"
                >
                  {pkg.tag}
                </Chip>
                <p className="text-[17px] font-extrabold text-[#1c1e21] mt-1">
                  {pkg.name}
                </p>
                <p className="text-[13px] text-[#65676b] font-medium mt-1.5 leading-relaxed">
                  {pkg.desc}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-lg font-black text-[#1c1e21]">
                    {pkg.price}{" "}
                    <span className="text-[12px] font-medium text-[#65676b]">
                      {pkg.unit}
                    </span>
                  </p>
                  <Link href={pkg.href}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-full bg-[#1877F2] text-white font-bold hover:bg-[#166FE5] text-[13px]"
                    >
                      {pkg.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why Us Section ───────────────────────────────────────────────────────────

function WhyUsSection() {
  return (
    <section className="py-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-[1.75rem] font-extrabold text-[#1c1e21] tracking-tight">
            Why Choose Mohans Cabs?
          </h2>
          <p className="text-sm text-[#65676b] font-medium mt-1">
            Everything you would want in a cab service — and more
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_ITEMS.map(({ Icon, title, desc }) => (
            <Card
              key={title}
              className="bg-[#f0f2f5] border-none rounded-2xl p-7 shadow-none"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center mb-4">
                <Icon size={22} className="text-white" strokeWidth={1.8} />
              </div>
              <p className="text-base font-extrabold text-[#1c1e21] mb-1.5">
                {title}
              </p>
              <p className="text-[13px] text-[#65676b] font-medium leading-relaxed">
                {desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="py-20 px-6 sm:px-12 bg-[#f0f2f5]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-[1.75rem] font-extrabold text-[#1c1e21] tracking-tight">
            What Our Riders Say
          </h2>
          <p className="text-sm text-[#65676b] font-medium mt-1">
            Real reviews from real customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <Card
              key={t.name}
              className="border border-[#dce1e9] rounded-2xl p-6"
            >
              {/* Star rating */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < t.rating
                        ? "text-[#f59e0b] fill-[#f59e0b]"
                        : "text-[#dce1e9] fill-[#dce1e9]"
                    }
                  />
                ))}
              </div>

              <p className="text-[14px] text-[#65676b] font-medium leading-[1.75] mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-extrabold text-[#1c1e21] shrink-0"
                  style={{ background: t.avatarColor }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1c1e21]">
                    {t.name}
                  </p>
                  <p className="text-[12px] text-[#65676b] font-medium">
                    {t.location}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <div className="px-6 sm:px-12 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#1877F2] rounded-3xl px-10 sm:px-16 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2 className="text-[2.2rem] sm:text-[2.6rem] font-black text-white leading-[1.15] tracking-tight max-w-md">
            Ready to ride with{" "}
            <span className="text-white/80">Mohans Cabs?</span>
          </h2>
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
            <p className="text-white/70 text-sm font-medium">
              Join 5 lakh+ happy riders today
            </p>
            <Link href="/login">
              <Button
                variant="secondary"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#1877F2] font-extrabold text-[15px] border-none hover:bg-white/90 h-auto"
              >
                Create Free Account
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="w-full">
      <HeroSection />
      <TrustStrip />
      <CarsSection />
      <PackagesSection />
      <WhyUsSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
