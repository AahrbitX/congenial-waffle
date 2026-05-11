"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, Chip } from "@heroui/react";
import {
  ArrowRight,
  Shield,
  Clock,
  IndianRupee,
  Phone,
  ArrowLeftRight,
  Calendar,
  Star,
  MapPin,
} from "lucide-react";
import { useBooking } from "@/context/BookingContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchTab = "local" | "outstation" | "airport";

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
    service: "Outstation",
    desc: "Travel to your destination without worrying about return fare. Ideal for one-time trips to any city.",
    price: "₹999",
    unit: "onwards",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
    cta: "Book Now",
    href: null,
  },
  {
    label: "ROUND TRIP",
    tag: "Popular",
    name: "Round Trip Package",
    service: "Outstation",
    desc: "Go and come back at your own schedule. Driver waits for you at the destination.",
    price: "₹1,799",
    unit: "/ day",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    cta: "Book Now",
    href: null,
  },
  {
    label: "AIRPORT TRANSFER",
    tag: "Fixed Fare",
    name: "Airport Transfer",
    service: "Airport Transfer",
    desc: "Stress-free airport pickup and drops. Fixed pricing, flight-tracking, and on-time guarantee.",
    price: "₹599",
    unit: "flat",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    cta: "Book Now",
    href: null,
  },
  {
    label: "FULL DAY HIRE",
    tag: "Flexible",
    name: "Full Day Hire",
    service: "City Taxi",
    desc: "A dedicated cab for the whole day. Meetings, errands, sightseeing — your driver stays with you.",
    price: "₹1,299",
    unit: "/ 8 hrs",
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    cta: "Book Now",
    href: null,
  },
  {
    label: "WEEKLY PLAN",
    tag: "Save 20%",
    name: "Weekly Commute",
    service: "City Taxi",
    desc: "Book for 5 or 7 days at a flat weekly rate. Perfect for office commuters and regular travellers.",
    price: "₹3,999",
    unit: "/ week",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    cta: "Book Now",
    href: null,
  },
  {
    label: "CORPORATE",
    tag: "For Teams",
    name: "Corporate Plan",
    service: null,
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
  const [serviceTab, setServiceTab] = useState<string>("local");
  const [tripTab, setTripTab] = useState<string>("oneway");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const { openBooking } = useBooking();

  const serviceTabs = [
    { id: "local", label: "Local", Icon: MapPin },
    { id: "outstation", label: "Outstation", Icon: ArrowLeftRight },
    { id: "airport", label: "Airport", Icon: Calendar },
  ];

  const tripTabs = [
    { id: "oneway", label: "One Way" },
    { id: "roundtrip", label: "Round Trip" },
  ];

  return (
    <section
      className="relative min-h-screen flex flex-col justify-end pb-14 pt-20 bg-white/80 backdrop-blur-md rounded-3xl mr-2 ml-4 shadow-lg"
          style={{
          background:
            "linear-gradient(to bottom, rgb(255, 255, 255) 0%, rgba(241, 244, 251, 0.96) 40%, rgba(236, 239, 250, 0.61) 100%)",
        }}
    >

      {/* Hero content */}
      <div className="flex mx-20 w-full max-w-7xl gap-12">
        <div className="px-8 sm:px-16 max-w-2xl item-center justify-center h-full">
          <p className="text-xs font-semibold text-black/70 tracking-[0.12em] uppercase mb-4">
            Trusted by 5 lakh+ riders
          </p>
          <h1 className="text-4xl sm:text-5xl text-black lg:text-[3.6rem] font-extrabold leading-[1.15] mb-6 tracking-tight">
            Hey Buddy! where are you{" "}
            <span className="font-black italic text-blue-500">Riding</span> to?
          </h1>

          <div className="right-0 w-full">
          <img className=""
            src="/images/car.png"
            alt="Hero background"
          />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => openBooking()}
            className="inline-flex items-center gap-2 text-white bg-blue-500 rounded-full px-4 py-2 font-bold text-[15px] hover:bg-blue-600 transition-colors group"
          >
            Book Now
          </button>

          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-full p-2 font-bold text-[15px] hover:bg-[#1ebe5d] transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.121 1.523 5.854L.057 23.882a.5.5 0 0 0 .61.611l6.101-1.497A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.651-.523-5.158-1.432l-.36-.217-3.742.918.95-3.655-.234-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </a>

          <a
            href="tel:+91XXXXXXXXXX"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 rounded-full  p-2 font-bold text-[15px] hover:bg-gray-50 transition-colors"
          >
            <Phone size={15} className="text-blue-500" />
          </a>
        </div>


        </div>
        </div>
        <div className="hidden lg:block flex-1 px-8 pt-10">
          <Card className="rounded-2xl shadow-2xl overflow-hidden p-0 gap-0">
            {/* Service tabs */}
            <div className="flex border-b border-gray-100">
              {serviceTabs.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setServiceTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                    serviceTab === id
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            {/* Trip sub-tabs */}
            <div className="flex gap-1 p-3 bg-gray-50 border-b border-gray-100">
              {tripTabs.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTripTab(id)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-full transition-colors ${
                    tripTab === id
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {/* Pickup location */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                  Pickup Location
                </p>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                  <MapPin size={16} className="text-blue-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter pickup location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                  Pickup Date &amp; Time
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3">
                    <Calendar size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="flex-1 text-sm text-gray-500 outline-none bg-transparent w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3">
                    <Clock size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="flex-1 text-sm text-gray-500 outline-none bg-transparent w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1.5">
                  Destination
                </p>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                  <MapPin size={16} className="text-green-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* CTA */}
              <Button
                onPress={() => openBooking()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-base h-12 rounded-xl"
              >
                Explore Cabs
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}


// ─── Cars Section ─────────────────────────────────────────────────────────────

function CarsSection() {
  const { openBooking } = useBooking();
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
                onClick={() => openBooking(car.name)}
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
  const { openBooking } = useBooking();
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
                  {pkg.href ? (
                    <Link href={pkg.href}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-full bg-[#1877F2] text-white font-bold hover:bg-[#166FE5] text-[13px]"
                      >
                        {pkg.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => openBooking(pkg.service ?? pkg.name)}
                      className="rounded-full bg-[#1877F2] text-white font-bold hover:bg-[#166FE5] text-[13px]"
                    >
                      {pkg.cta}
                    </Button>
                  )}
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
      {/* <TrustStrip /> */}
      <CarsSection />
      <PackagesSection />
      <WhyUsSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
