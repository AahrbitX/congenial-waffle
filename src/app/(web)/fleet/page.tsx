"use client";

import { ArrowRight } from "lucide-react";
import { FleetList } from "@/features/web/fleet/FleetList";

export default function FleetPage() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="pt-36 pb-12 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">Our Fleet</span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f] mt-4 max-w-2xl">
            The right car<br />
            <span className="text-blue-500 italic">for every ride.</span>
          </h1>
          <p className="text-gray-400 text-[15px] mt-4 max-w-lg leading-relaxed">
            From budget hatchbacks to luxury sedans — all AC, all verified, all at transparent fares.
          </p>
        </div>
      </section>

      <FleetList />

      {/* CTA */}
      <section className="py-20 px-8 sm:px-16 bg-blue-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight max-w-xl">
            Don&apos;t see what you need? Just ask.
          </h2>
          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-500 font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group shrink-0"
          >
            Chat on WhatsApp
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>
    </main>
  );
}
