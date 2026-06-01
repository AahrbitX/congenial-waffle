"use client";

import { Card } from "@heroui/react";
import { Clock, IndianRupee, Phone, Shield } from "lucide-react";

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

function WhyUsSection() {
  return (
    <section className="pb-10 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-center sm:text-left text-2xl font-bold tracking-tight text-balance">
            Why Choose Mohan Cabs?
          </h2>
          <p className="text-center sm:text-left text-sm text-muted font-medium mt-1 text-pretty">
            Everything you would want in a cab service - and more
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_ITEMS.map(({ Icon, title, desc }) => (
            <Card key={title}>
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-2">
                <Icon size={22} className="text-white" strokeWidth={1.8} />
              </div>
              <p className="text-xl font-bold">{title}</p>
              <p className="text-sm text-muted font-medium">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export { WhyUsSection };
