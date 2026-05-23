"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { ArrowLeftRight, Calendar, MapPin, Clock } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { useBooking } from "@/context/BookingContext";
import type { ServiceTab, TripTab } from "@/types/booking.types";
import { TextAnimate } from "@/components/ui/text-animate";

const LocationInput = dynamic(
  () => import("@/components/map/LocationInput").then((m) => m.LocationInput),
  { ssr: false },
);

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

// Every element uses the same fade-up — uniform feel
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// Tight stagger so elements feel simultaneous, not sequential
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

function HeroSection() {
  const [serviceTab, setServiceTab] = useState<string>("local");
  const [tripTab, setTripTab] = useState<string>("oneway");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const { openBooking } = useBooking();
  const { requireAuth } = useAuth();

  // Scroll-based parallax
  const sectionRef = useRef<HTMLElement>(null);

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
    <section className="relative min-h-[100svh] sm:mx-4 p-4 sm:p-0 rounded-xl drop-shadow-2xl overflow-hidden">
      {/* Parallax ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[700px] w-[700px] rounded-full bg-primary-soft/60 blur-3xl" />
        <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-primary-soft/40 blur-3xl" />
      </div>

      {/* Main content — unified scroll: everything moves up + fades together */}
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-center justify-center pb-10 pt-20 sm:pt-24 sm:px-6 lg:flex-row lg:items-center lg:gap-8 lg:px-10 lg:pt-24">
        {/* ── LEFT ── */}
        <div className="flex w-full flex-col lg:flex-1">
          <motion.div variants={stagger} initial="hidden" animate="show">
            {/* Trust badge */}
            <TextAnimate
              as="p"
              by="word"
              className="mb-2 text-xs sm:text-sm text-muted text-center sm:text-left "
            >
              Trusted by 1,00,000+ Riders across Tamil Nadu
            </TextAnimate>

            {/* Headline */}
            <TextAnimate
              once
              as="h1"
              animation="slideLeft"
              className="text-center sm:text-left mb-3 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem] md:mr-10"
            >
              Hey Buddy! Where are you Riding to?
            </TextAnimate>

            {/* Subtitle */}
            <TextAnimate
              as="p"
              once
              className="mb-7 max-w-lg text-muted text-sm md:text-base text-center sm:text-left "
            >
              Safe, reliable cabs — city rides, outstation trips &amp; airport
              transfers. Fixed fares, verified drivers, available 24/7.
            </TextAnimate>

            {/* Stats */}

            {/* Car image — desktop only: drives in from bottom-left, scales small → full */}
            <motion.div
              initial={{ opacity: 0, x: 120, y: 60, scale: 0.45 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
              className="mb-8 hidden w-full max-w-[480px] lg:block xl:max-w-[540px] md:ml-12"
            >
              <img
                src="/images/car.png"
                alt="Mohan Cabs vehicle"
                className="w-full drop-shadow-xl"
              />
            </motion.div>

            <div className="sm:flex flex flex-col sm:flex-row sm:items-center sm:gap-5">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                {[
                  { value: "5L", label: "Happy Riders" },
                  { value: "4.8", label: "Avg Rating" },
                  { value: "24/7", label: "Support" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-bold text-primary text-3xl text-center sm:text-left ">
                      {value}
                    </p>
                    <p className="text-xs text-muted text-center sm:text-left ">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              {/* <motion.div
                variants={fadeUp}
                className="mt-6 flex sm:gap-4 sm:mt-0"
              >
                <Button
                  onPress={() => openBooking()}
                  className="h-11 rounded-xl bg-[var(--color-primary)] sm:px-7 text-[14px] font-bold text-[var(--color-text-inverted)] hover:bg-[var(--color-primary-hover)]"
                >
                  Book Now <ChevronRight />
                </Button>
              </motion.div> */}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: booking widget ── */}
        <motion.div
          variants={fadeUp}
          className="mt-10 w-full shrink-0 lg:mt-0 lg:w-[520px] "
        >
          {/* Car image — mobile & tablet only */}
          <motion.div
            initial={{ opacity: 0, x: 100, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className="mb-6 lg:hidden"
          >
            <img
              src="/images/car.png"
              alt="Mohan Cabs vehicle"
              className="mx-auto w-full drop-shadow-lg sm:max-w-[590px]"
            />
          </motion.div>

          {/* Booking widget card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.25, ease: EASE }}
            className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-xl"
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
            <div className="flex gap-1.5 border-b border-[var(--color-border)] bg-[var(--background)] p-2">
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
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
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
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                  Pickup Date &amp; Time
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--background)] px-3 py-2.5">
                    <Calendar
                      size={13}
                      className="shrink-0 text-[var(--color-text-muted)]"
                    />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full flex-1 bg-transparent text-[13px] text-[var(--color-text-secondary)] outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--background)] px-3 py-2.5">
                    <Clock
                      size={13}
                      className="shrink-0 text-[var(--color-text-muted)]"
                    />
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
                    serviceTab: serviceTab as ServiceTab,
                    tripTab: tripTab as TripTab,
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
      </div>
    </section>
  );
}

export { HeroSection };
