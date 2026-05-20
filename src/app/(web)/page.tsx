"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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

const LocationInput = dynamic(
  () => import("@/components/map/LocationInput").then((m) => m.LocationInput),
  { ssr: false }
);

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

/** Maps landing page car name → ASSETS image entry */
const CAR_IMAGES: Record<string, { src: string; alt: string }> = {
  Hatchback: ASSETS.cars.hatchback,
  Sedan:     ASSETS.cars.sedan,
  SUV:       ASSETS.cars.muv,
  Luxury:    ASSETS.cars.luxury,
};

// Maps landing page car names to vehicle mock categories
const CAR_CATEGORY_MAP: Record<string, string> = {
  "Hatchback": "Hatchback",
  "Sedan":     "Sedan",
  "SUV":       "MUV",     // displayed as SUV on landing, stored as MUV in mock
  "Luxury":    "Luxury",
};

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

// Every element uses the same fade-up — uniform feel
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.6, ease: EASE } },
};

// Tight stagger so elements feel simultaneous, not sequential
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const [serviceTab, setServiceTab] = useState<string>("local");
  const [tripTab, setTripTab]       = useState<string>("oneway");
  const [pickup,      setPickup]      = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const { openBooking }  = useBooking();
  const { requireAuth }  = useAuth();

  // Scroll-based parallax
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll — subtle upward drift only, no fade
  const contentY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -60]), { stiffness: 60, damping: 20 });

  // Background blobs: slow lateral drift
  const blob1X = useTransform(scrollYProgress, [0, 1], [0,  120]);
  const blob2X = useTransform(scrollYProgress, [0, 1], [0, -90]);

  const serviceTabs = [
    { id: "local",      label: "Local",      Icon: MapPin        },
    { id: "outstation", label: "Outstation", Icon: ArrowLeftRight },
    { id: "airport",    label: "Airport",    Icon: Calendar      },
  ];

  const tripTabs = [
    { id: "oneway",    label: "One Way"    },
    { id: "roundtrip", label: "Round Trip" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] sm:mx-5 rounded-xl drop-shadow-2xl overflow-hidden"
    >
      {/* Parallax ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          style={{ x: blob1X }}
          className="absolute -top-40 right-0 h-[700px] w-[700px] rounded-full bg-[var(--color-primary-soft)]/60 blur-3xl"
        />
        <motion.div
          style={{ x: blob2X }}
          className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--color-primary-soft)]/40 blur-3xl"
        />
      </div>

      {/* Main content — unified scroll: everything moves up + fades together */}
      <motion.div
        style={{ y: contentY }}
        className="relative mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-10 lg:py-20 xl:gap-16 xl:px-16"
      >

        {/* ── LEFT ── */}
        <div className="flex w-full flex-col lg:flex-1">
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Trust badge */}
            <motion.div variants={fadeUp} className="mb-5 inline-flex w-fit items-center gap-2 px-2 py-1.5 text-[11px] font-semibold tracking-wide">
              {/* <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> */}
              Trusted by 5,00,000+ Riders across India
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mb-4 text-[1.6rem] font-extrabold leading-[1.1] tracking-tight text-[var(--color-text-primary)] sm:text-[2.1rem] lg:text-[2.4rem] xl:text-[2.75rem]"
            >
              Hey Buddy! Where are you{" "}
              <span className="font-black italic text-[var(--color-primary)]">Riding</span> to?
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mb-7 max-w-lg text-[12px] font-medium leading-relaxed text-[var(--color-text-secondary)] sm:text-[13px]"
            >
              Safe, reliable cabs — city rides, outstation trips &amp; airport transfers.
              Fixed fares, verified drivers, available 24/7.
            </motion.p>

            {/* Stats */}


            {/* Car image — desktop only: drives in from bottom-left, scales small → full */}
            <motion.div
              initial={{ opacity: 0, x: -120, y: 60, scale: 0.45 }}
              animate={{ opacity: 1, x: 0,    y: 0,  scale: 1    }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
              className="mb-8 hidden w-full max-w-[480px] lg:block xl:max-w-[540px]"
            >
              <img src="/images/car.png" alt="Mohan Cabs vehicle" className="w-full drop-shadow-xl" />
            </motion.div>

            <div className="sm:flex flex flex-col sm:flex-row sm:items-center gap-5">
              <motion.div variants={fadeUp} className=" flex flex-wrap gap-x-10 gap-y-4">
                {[
                  { value: "5L",  label: "Happy Riders" },
                  { value: "4.8", label: "Avg Rating"   },
                  { value: "24/7", label: "Support"       },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-[1.2rem] font-black text-[var(--color-text-primary)] sm:text-xl">{value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
                  </div>
                ))}


              </motion.div>

              {/* Action buttons */}
              <motion.div variants={fadeUp} className="flex gap-4 px-10">
                <Button
                  onPress={() => openBooking()}
                  className="h-11 rounded-xl bg-[var(--color-primary)] px-7 text-[14px] font-bold text-[var(--color-text-inverted)] hover:bg-[var(--color-primary-hover)]"
                >
                  Book Now →
                </Button>
              </motion.div>
            </div>


          </motion.div>
        </div>

        {/* ── RIGHT: booking widget ── */}
        <motion.div
          variants={fadeUp}
          className="mt-10 w-full shrink-0 lg:mt-0 lg:w-[440px] xl:w-[500px]"
        >
          {/* Car image — mobile & tablet only */}
          <motion.div
            initial={{ opacity: 0, x: -80, y: 40, scale: 0.5 }}
            animate={{ opacity: 1, x: 0,   y: 0,  scale: 1   }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className="mb-6 lg:hidden"
          >
            <img
              src="/images/car.png"
              alt="Mohan Cabs vehicle"
              className="mx-auto w-full max-w-[260px] drop-shadow-lg sm:max-w-[360px]"
            />
          </motion.div>

          {/* Booking widget card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            transition={{ duration: 0.65, delay: 0.25, ease: EASE }}
            className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-2xl"
          >
            {/* Service tabs */}
            <div className="flex border-b border-[var(--color-border)]">
              {serviceTabs.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setServiceTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 py-3.5 text-[12px] font-semibold transition-colors sm:py-4 sm:text-[13px] ${
                    serviceTab === id
                      ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  }`}
                >
                  <Icon size={13} className="shrink-0" />
                  {label}
                </button>
              ))}
            </div>

            {/* Trip sub-tabs */}
            <div className="flex gap-1.5 border-b border-[var(--color-border)] bg-[var(--background)] p-2.5">
              {tripTabs.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTripTab(id)}
                  className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold transition-colors sm:text-xs ${
                    tripTab === id
                      ? "bg-[var(--color-primary)] text-[var(--color-text-inverted)] shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Form fields */}
            <div className="space-y-3 p-4 sm:p-5">
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Pickup Location
                </p>
                <LocationInput
                  value={pickup}
                  onChange={(addr) => setPickup(addr)}
                  placeholder="Enter pickup location"
                  onBeforeOpen={(open) => requireAuth(open)}
                />
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Pickup Date &amp; Time
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--background)] px-3 py-2.5">
                    <Calendar size={13} className="shrink-0 text-[var(--color-text-muted)]" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full flex-1 bg-transparent text-[13px] text-[var(--color-text-secondary)] outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--background)] px-3 py-2.5">
                    <Clock size={13} className="shrink-0 text-[var(--color-text-muted)]" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full flex-1 bg-transparent text-[13px] text-[var(--color-text-secondary)] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Destination
                </p>
                <LocationInput
                  value={destination}
                  onChange={(addr) => setDestination(addr)}
                  placeholder="Enter destination"
                  onBeforeOpen={(open) => requireAuth(open)}
                />
              </div>

              <Button
                onPress={() =>
                  openBooking({
                    serviceTab:  serviceTab  as ServiceTab,
                    tripTab:     tripTab     as TripTab,
                    pickup,
                    destination,
                    date,
                    time,
                  })
                }
                className="mt-1 h-12 w-full rounded-xl bg-[var(--color-primary)] text-[15px] font-bold text-[var(--color-text-inverted)] hover:bg-[var(--color-primary-hover)]"
              >
                Explore Cabs
              </Button>
            </div>
          </motion.div>
        </motion.div>

      </motion.div>
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
          {CARS.map((car) => {
            const img = CAR_IMAGES[car.name];
            return (
              <Card
                key={car.name}
                onClick={() => openBooking({ serviceId: "city-taxi", preselectedCategory: CAR_CATEGORY_MAP[car.name] ?? car.name })}
                className="relative border border-[#dce1e9] rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <Chip
                  className="absolute top-3.5 right-3.5 bg-[#e8f3ff] text-[#1877F2] text-[11px] font-bold border-none"
                  size="sm"
                >
                  {car.badge}
                </Chip>

                <div className="flex items-center justify-center h-36 mb-4">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={220}
                    height={144}
                    className="object-contain h-full w-auto"
                  />
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
                      onPress={() => openBooking({ serviceId: pkg.serviceId ?? "city-taxi" })}
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
