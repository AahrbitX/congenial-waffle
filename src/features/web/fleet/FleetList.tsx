"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Briefcase,
  Wind,
  Fuel,
  Check,
  ArrowRight,
} from "lucide-react";
import { useFleet } from "@/hooks/useFleet";
import { useBooking } from "@/context/BookingContext";
import type { FleetCategory } from "@/types/fleet.types";
import { Button, Card, Chip, Modal, Surface } from "@heroui/react";

const CATEGORIES: FleetCategory[] = [
  "All",
  "Hatchback",
  "Sedan",
  "MUV",
  "Luxury",
  "Traveller",
];

export function FleetList() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") as FleetCategory | null;
  const validCategory =
    urlCategory && CATEGORIES.includes(urlCategory) ? urlCategory : "All";

  const [activeCategory, setActiveCategory] =
    useState<FleetCategory>(validCategory);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  const { data: fleet = [], isLoading } = useFleet();

  const selectedCar = fleet.find((c) => c.id === selectedCarId) ?? null;
  const carLoading = isLoading;

  const { openBooking } = useBooking();

  const filtered =
    activeCategory === "All"
      ? fleet
      : fleet.filter((c) => c.category === activeCategory);

  return (
    <Surface className="py-12 px-8 sm:px-16" variant="secondary">
      <div className="max-w-7xl mx-auto">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10 items-center justify-center">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={cat === activeCategory ? "primary" : "secondary"}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Cars grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((car) => (
              <Card
                key={car.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCarId(car.id);
                }}
                className="text-left bg-white border border-gray-100 rounded-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={car.image ?? undefined}
                  alt={car.name}
                  className="w-full h-40 object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-200 mb-2"
                />
                <Card.Header>
                  <Card.Title className="font-semibold text-xl">
                    {car.name}
                  </Card.Title>
                  <Card.Description> {car.tagline}</Card.Description>
                </Card.Header>

                <div className="flex items-center gap-2 ">
                  <Chip className="flex items-center gap-1">
                    <Users size={12} /> {car.seats} Seats
                  </Chip>
                  <Chip className="flex items-center gap-1">
                    <Briefcase size={12} /> {car.bags} Bags
                  </Chip>
                  {car.ac && (
                    <Chip className="flex items-center gap-1">
                      <Wind size={12} /> AC
                    </Chip>
                  )}
                </div>

                <Card.Footer className="flex items-end justify-between">
                  <p className="text-sm font-bold">
                    From <span className="text-accent ">{car.priceFrom}</span>
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCarId(car.id);
                    }}
                  >
                    View Details
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal.Backdrop
        isOpen={!!selectedCarId}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedCarId(null);
          }
        }}
      >
        <Modal.Container size="cover" scroll="outside">
          <Modal.Dialog onClick={(e) => e.stopPropagation()}>
            <Modal.CloseTrigger />

            <Modal.Body>
              {carLoading || !selectedCar ? (
                <div className="p-8 animate-pulse space-y-4">
                  <div className="h-56 bg-gray-100 rounded-xl" />
                  <div className="h-6 w-1/2 bg-gray-100 rounded" />
                  <div className="h-4 w-1/3 bg-gray-100 rounded" />
                </div>
              ) : (
                <>
                  <Modal.Header className="gap-2">
                    <span className="text-sm font-bold tracking-[0.18em] text-accent  uppercase">
                      {selectedCar.category}
                    </span>
                    <Modal.Heading className="text-2xl font-bold">
                      {selectedCar.name}
                    </Modal.Heading>
                    <p className="text-muted text-[13px]">
                      {selectedCar.tagline}
                    </p>
                  </Modal.Header>

                  {/* Modal body — 2 col on md+ */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image */}
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedCar.image ?? undefined}
                        alt={selectedCar.name}
                        className="w-full h-52 sm:h-full object-cover rounded-2xl"
                      />
                      <div className="flex items-center justify-between gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-400 font-medium">
                            Starting From
                          </p>
                          <p className="text-2xl font-semibold text-black">
                            {selectedCar.priceFrom}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedCarId(null);
                            openBooking({
                              serviceId: "city-taxi",
                              preselectedCategory: selectedCar.category,
                            });
                          }}
                        >
                          Book this Vehicle
                          <ArrowRight
                            size={15}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </Button>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                      {/* Specs */}
                      <div>
                        <p className="text-sm font-bold tracking-[0.18em] text-accent  uppercase mb-4">
                          Specifications
                        </p>
                        <div className="grid grid-cols-2 gap-2.5 text-black">
                          {[
                            {
                              Icon: Users,
                              label: "Capacity",
                              value: `${selectedCar.seats} Passengers`,
                            },
                            {
                              Icon: Briefcase,
                              label: "Luggage",
                              value: `${selectedCar.bags} Bags`,
                            },
                            {
                              Icon: Wind,
                              label: "Climate",
                              value: selectedCar.ac ? "AC" : "Non-AC",
                            },
                            {
                              Icon: Fuel,
                              label: "Fuel",
                              value: selectedCar.fuel,
                            },
                          ].map(({ Icon, label, value }) => (
                            <Card
                              key={label}
                              className="gap-1"
                              variant="secondary"
                            >
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <Icon size={14} className="text-accent" />
                                <p className="text-xs font-semibold tracking-widest  uppercase text-accent">
                                  {label}
                                </p>
                              </div>
                              <p className="text-sm font-semibold">{value}</p>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <p className="text-sm font-bold tracking-[0.18em] text-accent  uppercase mb-4">
                          Key Features
                        </p>
                        <div className="grid grid-cols-2 gap-y-1.5">
                          {selectedCar.features.map((f) => (
                            <div key={f} className="flex items-center gap-1.5">
                              <Check
                                size={14}
                                className="text-accent  shrink-0"
                              />
                              <span className="text-sm text-muted">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Surface>
  );
}
