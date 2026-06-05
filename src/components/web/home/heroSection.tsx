"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, ArrowRight, MapPin, Plane, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { useBooking } from "@/context/BookingContext";
import type { ServiceTab, TripTab } from "@/types/booking.types";
import { TextAnimate } from "@/components/ui/text-animate";

// ─── Booking widget constants ─────────────────────────────────────────────────

const SERVICE_TABS = [
  { id: "local"      as ServiceTab, label: "Local",      Icon: MapPin        },
  { id: "outstation" as ServiceTab, label: "Outstation", Icon: ArrowLeftRight },
  { id: "airport"    as ServiceTab, label: "Airport",    Icon: Plane         },
];

const TRIP_TABS: { id: TripTab; label: string; Icon: typeof ArrowRight }[] = [
  { id: "oneway",    label: "One Way",    Icon: ArrowRight  },
  { id: "roundtrip", label: "Round Trip", Icon: RotateCcw   },
];

const DIRECTION_TABS = [
  { id: "to"   as const, label: "To Airport"   },
  { id: "from" as const, label: "From Airport" },
];

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

function HeroSectionImpl() {
  const [serviceTab, setServiceTab] = useState<ServiceTab>("local");
  const [tripTab,        setTripTab]        = useState<TripTab>("oneway");
  const [direction,      setDirection]      = useState<"to" | "from">("to");
  const [pickup,     setPickup]     = useState("");
  const [destination, setDestination] = useState("");
  const [date,       setDate]       = useState("");
  const [time,       setTime]       = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");

  const { openBooking } = useBooking();
  const { requireAuth } = useAuth();

  function switchService(tab: ServiceTab) {
    setServiceTab(tab);
    setTripTab("oneway");
    setReturnDate("");
    setReturnTime("");
    setDirection("to");
  }

  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBodyHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
            <h1 className="text-center sm:text-left mb-3 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-black sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem] md:mr-10">
              <TextAnimate once as="span" animation="slideLeft">
                {"Hey Buddy! Where are you "}
              </TextAnimate>
              <TextAnimate
                once
                as="span"
                animation="slideLeft"
                className="text-primary"
              >
                {"Riding"}
              </TextAnimate>
              <TextAnimate once as="span" animation="slideLeft">
                {" to?"}
              </TextAnimate>
            </h1>

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

            {/* ── Service tabs ─────────────────────────────────────────────── */}
            <div className="flex border-b border-[var(--color-border)]">
              {SERVICE_TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => switchService(id)}
                  className="relative flex flex-1 flex-col items-center gap-1 py-3 sm:py-3.5 z-0"
                >
                  {/* Active underline pill */}
                  {serviceTab === id && (
                    <motion.span
                      layoutId="service-underline"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      className="absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-[var(--color-primary)]"
                    />
                  )}
                  <Icon
                    size={15}
                    className={`shrink-0 transition-colors duration-150 ${
                      serviceTab === id ? "text-[var(--color-primary)]" : "text-muted"
                    }`}
                  />
                  <span className={`text-[11px] sm:text-[12px] font-semibold transition-colors duration-150 ${
                    serviceTab === id ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"
                  }`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Animated form body ───────────────────────────────────────── */}
            <motion.div
              animate={{ height: bodyHeight ?? "auto" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
            <div ref={bodyRef} style={{ position: "relative" }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={serviceTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-3 p-4 sm:p-5 w-full"
              >

                {/* Trip tabs (local / outstation) */}
                {serviceTab !== "airport" && (
                  <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--background)] p-1">
                    {TRIP_TABS.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => { setTripTab(id); if (id === "oneway") setReturnDate(""); }}
                        className="relative flex-1 rounded-full py-2 text-xs font-semibold z-0"
                      >
                        {tripTab === id && (
                          <motion.span
                            layoutId={`trip-pill-${serviceTab}`}
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                            className="absolute inset-0 rounded-full bg-[var(--color-primary)] shadow-sm"
                            style={{ zIndex: -1 }}
                          />
                        )}
                        <span className={`relative flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                          tripTab === id ? "text-white" : "text-[var(--color-text-secondary)]"
                        }`}>
                          <Icon size={12} strokeWidth={2.5} />
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Airport direction toggle */}
                {serviceTab === "airport" && (
                  <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--background)] p-1">
                    {DIRECTION_TABS.map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setDirection(id)}
                        className="relative flex-1 rounded-full py-2 text-xs font-semibold z-0"
                      >
                        {direction === id && (
                          <motion.span
                            layoutId="direction-pill"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                            className="absolute inset-0 rounded-full bg-[var(--color-primary)] shadow-sm"
                            style={{ zIndex: -1 }}
                          />
                        )}
                        <span className={`relative flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                          direction === id ? "text-white" : "text-[var(--color-text-secondary)]"
                        }`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Pickup / Your Address */}
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                    {serviceTab === "airport"
                      ? (direction === "to" ? "Your Pickup Address" : "Your Drop Address")
                      : serviceTab === "outstation" ? "From City" : "Pickup Location"}
                  </p>
                  <LocationInput
                    value={pickup}
                    onChange={setPickup}
                    placeholder={serviceTab === "airport" ? "Enter your address" : "Enter pickup location"}
                    onBeforeOpen={(open) => requireAuth(open)}
                  />
                </div>

                {/* Destination (not for airport) */}
                {serviceTab !== "airport" && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                      {serviceTab === "outstation" ? "To City" : "Destination"}
                    </p>
                    <LocationInput
                      value={destination}
                      onChange={setDestination}
                      placeholder="Enter destination"
                      onBeforeOpen={(open) => requireAuth(open)}
                    />
                  </div>
                )}

                {/* Date + Time */}
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                    {serviceTab === "airport" ? "Flight Date & Time" : "Journey Date & Time"}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-9 w-full rounded-xl border border-[var(--color-border)] bg-[var(--background)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-9 w-full rounded-xl border border-[var(--color-border)] bg-[var(--background)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                {/* Return date — fade in/out; height is driven by outer ResizeObserver */}
                <AnimatePresence initial={false}>
                  {serviceTab !== "airport" && tripTab === "roundtrip" && (
                    <motion.div
                      key="return-date"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div>
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                          Return Date &amp; Time
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                          <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="h-9 w-full rounded-xl border border-[var(--color-border)] bg-[var(--background)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                          />
                          <input
                            type="time"
                            value={returnTime}
                            onChange={(e) => setReturnTime(e.target.value)}
                            className="h-9 w-full rounded-xl border border-[var(--color-border)] bg-[var(--background)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <Button
                  onPress={() => openBooking({
                    serviceId:   serviceTab === "local" ? "city-taxi" : serviceTab,
                    serviceTab,
                    tripTab:     serviceTab !== "airport" ? tripTab : undefined,
                    pickup,
                    destination: serviceTab !== "airport" ? destination : undefined,
                    date:        date || undefined,
                    time:        time || undefined,
                    returnDate:  serviceTab !== "airport" && tripTab === "roundtrip"
                                   ? returnDate || undefined
                                   : undefined,
                    returnTime:  serviceTab !== "airport" && tripTab === "roundtrip"
                                   ? returnTime || undefined
                                   : undefined,
                  })}
                  className="mt-1 h-12 w-full rounded-xl bg-[var(--color-primary)] text-[15px] font-bold text-[var(--color-text-inverted)] hover:bg-[var(--color-primary-hover)]"
                >
                  Explore Cabs
                </Button>

              </motion.div>
            </AnimatePresence>
            </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// HeroSection is SSR-safe (no direct window/document access outside useEffect).
// LocationInput inside already handles its own ssr:false for mapbox.
export { HeroSectionImpl as HeroSection };
