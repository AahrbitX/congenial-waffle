"use client";

import Link from "next/link";
import { Button, Card, Chip } from "@heroui/react";
import { useBooking } from "@/context/BookingContext";

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
    price: "",
    unit: "Custom pricing",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    cta: "Contact Us",
    href: "/contact",
  },
];

function PackagesSection() {
  const { openBooking } = useBooking();
  return (
    <section className="py-6 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h2 className="text-center sm:text-left text-[1.75rem] font-extrabold  tracking-tight">
            Our Packages
          </h2>
          <p className="text-center sm:text-left text-sm text-muted font-medium">
            Flat-rate deals for every kind of journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PACKAGES.map((pkg) => (
            <Card key={pkg.name} className="overflow-hidden p-0 gap-0">
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
              <div className="p-4">
                <Chip
                  className="bg-accent text-white text-[11px] font-bold border-none mb-2"
                  size="sm"
                >
                  {pkg.tag}
                </Chip>
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                <p className="font-medium mt-1.5 text-muted text-sm">
                  {pkg.desc}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xl font-black text-[#1c1e21]">
                    {pkg.price}{" "}
                    <span className="text-xs font-medium text-[#65676b]">
                      {pkg.unit}
                    </span>
                  </p>
                  {pkg.href ? (
                    <Link href={pkg.href}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-white font-bold"
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

export { PackagesSection };
