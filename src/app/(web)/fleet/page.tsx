"use client";

import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { FleetList } from "@/features/web/fleet/FleetList";
import { TextAnimate } from "@/components/ui/text-animate";

export default function FleetPage() {
  return (
    <main className="w-full">
      <section className="pt-8 md:pt-0 pb-10 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="relative overflow-hidden pt-24 sm:pt-36 pb-4 sm:pb-8">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
            {/* Tag */}
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase text-center sm:text-left">
              Our Fleet
            </p>

            {/* Heading */}
            <h1 className="text-center sm:text-left mb-3 text-5xl font-black leading-[1.05] tracking-[-0.04em] text-black sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem] md:mr-10 mt-4 max-w-xl">
              <TextAnimate once as="span" animation="blurIn">
                {"The right car "}
              </TextAnimate>
              <TextAnimate
                once
                as="span"
                animation="blurIn"
                className="text-primary"
              >
                {"for every ride."}
              </TextAnimate>
            </h1>

            {/* Paragraph */}
            <TextAnimate
              as="p"
              once
              className="text-sm md:text-base text-muted text-center md:text-left mt-5 max-w-lg leading-relaxed"
            >
              From budget hatchbacks to luxury sedans — all AC, all verified,
              all at transparent fares.
            </TextAnimate>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="py-16 px-8 bg-[#f8f9fe]">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-white rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        }
      >
        <FleetList />
      </Suspense>

      {/* CTA */}
      <section className="py-12 px-8 sm:px-16 bg-accent ">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight max-w-xl">
            Don&apos;t see what you need? Just ask.
          </h2>
          <a
            href="https://wa.me/917904377385"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-accent  font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group shrink-0"
          >
            Chat on WhatsApp
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </div>
      </section>
    </main>
  );
}
