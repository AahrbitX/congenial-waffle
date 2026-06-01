"use client";

import { Card } from "@heroui/react";
import { Star } from "lucide-react";

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
    text: "The airport package saved me so much stress. Flight was delayed and the driver waited without charging extra. Will always use mohan Cabs!",
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
function TestimonialsSection() {
  return (
    <section className="pb-4 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-center sm:text-left text-2xl font-bold tracking-tight">
            What Our Riders Say
          </h2>
          <p className="text-center sm:text-left text-sm text-muted font-medium mt-1">
            Real reviews from real customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="border rounded-2xl p-6">
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

              <p className="text-sm text-muted font-medium leading-[1.75] mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-extrabold shrink-0"
                  style={{ background: t.avatarColor }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-base font-bold">{t.name}</p>
                  <p className="text-xs text-[#65676b] font-medium">
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

export { TestimonialsSection };
