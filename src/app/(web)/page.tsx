"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { HeroSection } from "@/components/web/home/heroSection";

import { ASSETS } from "@/constants/assets";
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
import { useAuth } from "@/context/AuthContext";
import type { ServiceTab, TripTab } from "@/types/booking.types";
import { CarsSection } from "@/components/web/home/carsSection";

const LocationInput = dynamic(
  () => import("@/components/map/LocationInput").then((m) => m.LocationInput),
  { ssr: false },
);

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchTab = "local" | "outstation" | "airport";

const PACKAGES = [
  {
    label: "OUTSTATION RIDE",
    tag: "Best Value",
    name: "One-Way Drop",
    service: "Outstation",
    serviceId: "outstation-oneway",
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
    serviceId: "outstation-roundtrip",
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
    serviceId: "airport",
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
    serviceId: "full-day-hire",
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
    serviceId: "weekly-commute",
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

// ─── Packages Section ─────────────────────────────────────────────────────────

function PackagesSection() {
  const { openBooking } = useBooking();
  return (
    <section className="py-10 px-6 sm:px-12 bg-[#f0f2f5]">
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
                      onPress={() =>
                        openBooking({ serviceId: pkg.serviceId ?? "city-taxi" })
                      }
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
    <section className="py-10 px-6 sm:px-12">
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
    <section className="py-10 px-6 sm:px-12 bg-[#f0f2f5]">
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
