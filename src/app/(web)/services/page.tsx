import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServicesList } from "@/features/web/services/ServicesList";
import { TextAnimate } from "@/components/ui/text-animate";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore Mohan Cabs' full range of services — city taxi, outstation, airport transfers, car rental, wedding cars, corporate travel & more. Transparent fares for every journey.",
  openGraph: {
    title: "Our Services | Mohan Cabs",
    description:
      "City taxi, outstation, airport transfers, car rental & more. Transparent fares, verified drivers across Trivandrum and Kerala.",
    url: "/services",
  },
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="pt-8 md:pt-0 pb-10 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="relative overflow-hidden pt-24 sm:pt-36 pb-4 sm:pb-8">
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
            {/* Tag */}
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase text-center sm:text-left">
              Our Services
            </p>

            {/* Heading */}
            <h1 className="text-center sm:text-left mb-3 text-5xl font-black leading-[1.05] tracking-[-0.04em] text-black sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem] md:mr-10 mt-4 max-w-xl">
              <TextAnimate once as="span" animation="blurIn">
                {"Every Ride "}
              </TextAnimate>
              <TextAnimate
                once
                as="span"
                animation="blurIn"
                className="text-primary"
              >
                {"Covered."}
              </TextAnimate>
            </h1>

            {/* Paragraph */}
            <TextAnimate
              as="p"
              className="text-sm md:text-base text-muted text-center md:text-left mt-5 max-w-lg leading-relaxed"
            >
              From a quick city trip to a full Kerala tour — mohan Cabs has a
              service for every need, at a fare that never surprises.
            </TextAnimate>
          </div>
        </div>
      </section>

      <ServicesList />

      {/* CTA */}
      <section className="py-16 px-8 sm:px-16 bg-accent">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight max-w-xl text-center sm:text-left text-pretty">
            Not sure which service fits?
          </h2>
          <div className="flex flex-col gap-3 shrink-0 mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-accent font-extrabold text-sm px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group justify-center"
            >
              Book a Ride
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-white/30 transition-colors"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
