"use client";

import { ASSETS } from "@/constants/assets";
import { Card, Chip, Link } from "@heroui/react";
import Image from "next/image";
import { TextAnimate } from "@/components/ui/text-animate";

const CARS = [
  {
    name: "Hatchback",
    meta: "4 seats · AC · Compact",
    price: "₹9",
    unit: "/ km · Min ₹150",
    badge: "Most Booked",
  },
  {
    name: "Sedan",
    meta: "4 seats · AC · Comfortable",
    price: "₹12",
    unit: "/ km · Min ₹200",
    badge: "Top Rated",
  },
  {
    name: "SUV",
    meta: "6 seats · AC · Spacious",
    price: "₹16",
    unit: "/ km · Min ₹280",
    badge: "Trending",
  },
  {
    name: "Luxury",
    meta: "4 seats · AC · Executive",
    price: "₹24",
    unit: "/ km · Min ₹500",
    badge: "Premium",
  },
];

const CAR_IMAGES: Record<string, { src: string; alt: string }> = {
  Hatchback: ASSETS.cars.hatchback,
  Sedan: ASSETS.cars.sedan,
  SUV: ASSETS.cars.muv,
  Luxury: ASSETS.cars.luxury,
};

// Maps landing page car names to vehicle mock categories
const CAR_CATEGORY_MAP: Record<string, string> = {
  Hatchback: "Hatchback",
  Sedan: "Sedan",
  SUV: "MUV", // displayed as SUV on landing, stored as MUV in mock
  Luxury: "Luxury",
};

function CarsSection() {
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
          {CARS.map((car) => {
            const img = CAR_IMAGES[car.name];
            return (
              <Link
                key={car.name}
                href={`/fleet?category=${CAR_CATEGORY_MAP[car.name] ?? car.name}`}
                className="relative no-underline w-full"
              >
                <Card className=" cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg w-full">
                  <Chip
                    className="absolute right-[18px] top-[18px] border-none text-[10px] font-bold sm:text-[11px] rounded-br-none rounded-tl-none"
                    size="sm"
                    color="accent"
                    variant="primary"
                  >
                    {car.badge}
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
                    <p className="text-2xl font-extrabold text-[#1c1e21]">
                      {car.name}
                    </p>
                    <p className="text-sm font-medium text-muted">{car.meta}</p>
                    <p className="text-sm font-extrabold">
                      {car.price}{" "}
                      <span className="text-sm font-medium text-muted ">
                        {car.unit}
                      </span>
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
