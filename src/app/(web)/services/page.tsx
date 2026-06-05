import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServicesList } from "@/features/web/services/ServicesList";

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
      <section className="pt-36 pb-20 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">
            Our Services
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f] mt-4 max-w-2xl">
            Every ride,
            <br />
            <span className="text-blue-500 italic">covered.</span>
          </h1>
          <p className="text-gray-400 text-[15px] mt-5 max-w-lg leading-relaxed">
            From a quick city trip to a full Kerala tour — mohan Cabs has a
            service for every need, at a fare that never surprises.
          </p>
        </div>
      </section>

      <ServicesList />

      {/* CTA */}
      <section className="py-20 px-8 sm:px-16 bg-blue-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight max-w-xl">
            Not sure which service fits?
          </h2>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-blue-500 font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group"
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
