"use client";

import { ASSETS } from "@/constants/assets";
import { Card, Chip, Link } from "@heroui/react";
import Image from "next/image";
import { TextAnimate } from "@/components/ui/text-animate";
import { usePricing } from "@/hooks/usePricing";
import { useFleet } from "@/hooks/useFleet";

const CAR_META: Record<string, { meta: string; badge: string }> = {
  Hatchback: { meta: "4 seats · AC · Compact",    badge: "Most Booked" },
  Sedan:     { meta: "4 seats · AC · Comfortable", badge: "Top Rated"  },
  SUV:       { meta: "6 seats · AC · Spacious",    badge: "Trending"   },
  Luxury:    { meta: "4 seats · AC · Executive",   badge: "Premium"    },
};

const CAR_IMAGES: Record<string, { src: string; alt: string }> = {
  Hatchback: ASSETS.cars.hatchback,
  Sedan:     ASSETS.cars.sedan,
  SUV:       ASSETS.cars.muv,
  Luxury:    ASSETS.cars.luxury,
};

// display name → fleet category
const CAR_CATEGORY: Record<string, string> = {
  Hatchback: "Hatchback",
  Sedan:     "Sedan",
  SUV:       "MUV",
  Luxury:    "Luxury",
};

const CAR_ORDER = ["Hatchback", "Sedan", "SUV", "Luxury"] as const;

function CarsSection() {
  const { data: pricing } = usePricing();
  const { data: fleet }   = useFleet();

  // pricing is keyed by model name ("Maruti Swift"), fleet has category per model
  // Build category → cheapest defaultAmount
  const categoryPriceMap = (() => {
    if (!pricing?.length || !fleet?.length) return {} as Record<string, { amount: string; unit: string }>;
    const priceByModel = Object.fromEntries(pricing.map((p) => [p.vehicleType, p]));
    const result: Record<string, { amount: string; unit: string }> = {};
    for (const vehicle of fleet) {
      const p = priceByModel[vehicle.name];
      if (!p) continue;
      const cat = vehicle.category;
      const amt = parseFloat(p.defaultAmount);
      if (!result[cat] || amt < parseFloat(result[cat].amount)) {
        result[cat] = { amount: p.defaultAmount, unit: p.defaultUnit };
      }
    }
    return result;
  })();

  return (
    <section className="px-4 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <TextAnimate
            as="h2"
            className="text-center sm:text-left text-2xl font-bold tracking-tight"
          >
            Select Your Car
          </TextAnimate>
          <p className="text-sm text-muted font-medium mt-1 text-center sm:text-left">
            Choose the perfect ride for every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAR_ORDER.map((name) => {
            const img             = CAR_IMAGES[name];
            const { meta, badge } = CAR_META[name];
            const category        = CAR_CATEGORY[name];
            const p               = categoryPriceMap[category];
            const price           = p ? `₹${parseFloat(p.amount).toLocaleString("en-IN")}` : "—";
            const unit            = p?.unit ?? "";

            return (
              <Link
                key={name}
                href={`/fleet?category=${category}`}
                className="relative no-underline w-full"
              >
                <Card className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg w-full">
                  <Chip
                    className="absolute right-[18px] top-[18px] border-none text-[10px] font-bold sm:text-[11px] rounded-br-none rounded-tl-none"
                    size="sm"
                    color="accent"
                    variant="primary"
                  >
                    {badge}
                  </Chip>

                  <div className="h-40 rounded-3xl bg-gray-100 flex items-center justify-center">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={240}
                      height={144}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-extrabold text-[#1c1e21]">{name}</p>
                    <p className="text-sm font-medium text-muted">{meta}</p>
                    <p className="text-sm font-extrabold">
                      {price}{" "}
                      <span className="text-sm font-medium text-muted">{unit}</span>
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { CarsSection };
