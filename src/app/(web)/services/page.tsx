"use client";

import Link from "next/link";
import { ArrowRight, Car, Key, Navigation, Plane, Train, Globe, Heart, Users, Briefcase, Palmtree, CalendarDays, GraduationCap } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const BOOK_A_RIDE = [
  {
    Icon: Car,
    label: "City Taxi",
    desc: "Quick, reliable rides anywhere within Trivandrum. Metered fare, no surge pricing.",
    badge: "Most Popular",
    href: "/services/city-taxi",
  },
  {
    Icon: Key,
    label: "Rent a Car",
    desc: "Self-drive options with well-maintained vehicles. Hourly and daily packages available.",
    badge: null,
    href: "/services/rent-a-car",
  },
  {
    Icon: Navigation,
    label: "Outstation",
    desc: "One-way and round-trip inter-city travel packages at flat, transparent fares.",
    badge: "Best Value",
    href: "/services/outstation",
  },
  {
    Icon: Plane,
    label: "Airport Transfer",
    desc: "Flight-tracked pickups and drops. Fixed price, no waiting charges.",
    badge: "Fixed Fare",
    href: "/services/airport",
  },
  {
    Icon: Train,
    label: "Railway Transfer",
    desc: "Station pickups and drops timed to your arrival. Never miss a connection.",
    badge: null,
    href: "/services/railway",
  },
  {
    Icon: Globe,
    label: "Nationwide Pickup",
    desc: "Travelling to Trivandrum from anywhere in India? We pick you up.",
    badge: null,
    href: "/services/nationwide",
  },
];

const SPECIAL_SERVICES = [
  {
    Icon: Heart,
    label: "Wedding Cars",
    desc: "Luxury fleet for weddings and events. Decorated cars, professional chauffeurs.",
    badge: "Premium",
    href: "/services/wedding",
  },
  {
    Icon: Users,
    label: "Tempo Traveller",
    desc: "Group travel for 10–20 passengers. Ideal for picnics, pilgrimages, and family trips.",
    badge: null,
    href: "/services/tempo",
  },
  {
    Icon: Briefcase,
    label: "Corporate",
    desc: "Managed billing, GST invoices, and priority support for businesses.",
    badge: "For Teams",
    href: "/services/corporate",
  },
  {
    Icon: Palmtree,
    label: "Tour Packages",
    desc: "Curated Kerala tours with experienced driver-guides. Customisable itineraries.",
    badge: "Trending",
    href: "/services/tours",
  },
  {
    Icon: CalendarDays,
    label: "Events",
    desc: "Logistics and transport support for conferences, weddings, and large events.",
    badge: null,
    href: "/services/events",
  },
  {
    Icon: GraduationCap,
    label: "School Transport",
    desc: "Safe, GPS-tracked student transport with verified drivers and fixed routes.",
    badge: null,
    href: "/services/school",
  },
];

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  Icon, label, desc, badge, href,
}: {
  Icon: React.ElementType; label: string; desc: string; badge: string | null; href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
          <Icon size={20} className="text-blue-500 group-hover:text-white transition-colors" />
        </div>
        {badge && (
          <span className="text-[10px] font-bold tracking-wide text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[15px] font-extrabold text-[#0f0f0f] mb-1">{label}</p>
        <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-500 mt-auto group-hover:gap-2 transition-all">
        Learn more <ArrowRight size={13} />
      </span>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <main className="w-full">

      {/* Hero */}
      <section className="pt-36 pb-20 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">Our Services</span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f] mt-4 max-w-2xl">
            Every ride,<br />
            <span className="text-blue-500 italic">covered.</span>
          </h1>
          <p className="text-gray-400 text-[15px] mt-5 max-w-lg leading-relaxed">
            From a quick city trip to a full Kerala tour — Mohans Cabs has a service for every need, at a fare that never surprises.
          </p>
        </div>
      </section>

      {/* Book A Ride */}
      <section className="py-20 px-8 sm:px-16 bg-[#f8f9fe]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-2">Book A Ride</p>
            <h2 className="text-[1.75rem] font-black tracking-tight text-[#0f0f0f]">Get where you need to go.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BOOK_A_RIDE.map((s) => <ServiceCard key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* Special Services */}
      <section className="py-20 px-8 sm:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-2">Special Services</p>
            <h2 className="text-[1.75rem] font-black tracking-tight text-[#0f0f0f]">Beyond the everyday ride.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPECIAL_SERVICES.map((s) => <ServiceCard key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 sm:px-16 bg-blue-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight max-w-xl">
            Not sure which service fits?
          </h2>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-white text-blue-500 font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group"
            >
              Book a Ride
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-semibold text-[14px] px-8 py-3.5 rounded-full hover:bg-white/30 transition-colors"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
