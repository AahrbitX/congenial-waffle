"use client";

import Link from "next/link";
import {
  ArrowRight,
  Car,
  Key,
  Navigation,
  Plane,
  Train,
  Globe,
  Heart,
  Users,
  Briefcase,
  Palmtree,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/types/service.types";
import { Card } from "@heroui/react";

const ICON_MAP: Record<string, React.ElementType> = {
  IconCar: Car,
  IconKey: Key,
  IconNavigation: Navigation,
  IconPlane: Plane,
  IconTrain: Train,
  IconGlobe: Globe,
  IconHeart: Heart,
  IconUsers: Users,
  IconBriefcase: Briefcase,
  IconPalmtree: Palmtree,
  IconCalendarDays: CalendarDays,
  IconGraduationCap: GraduationCap,
};

function ServiceCard({
  service,
  variant,
}: {
  service: Service;
  variant?: "default" | "secondary";
}) {
  const Icon = ICON_MAP[service.iconName] ?? Car;
  return (
    <Link href={`/services/${service.slug}`} className="">
      <Card
        variant={variant}
        className="group flex flex-col gap-4 hover:-translate-y-1 transition-all duration-200 h-68"
      >
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-accent transition-colors">
            <Icon
              size={20}
              className="text-accent group-hover:text-white transition-colors"
            />
          </div>
          {service.badge && (
            <span className="text-xs font-bold tracking-wide text-accent bg-blue-50 px-2.5 py-1 rounded-full">
              {service.badge}
            </span>
          )}
        </div>
        <div>
          <p className="text-lg font-extrabold mb-1">{service.name}</p>
          <p className="text-sm text-muted leading-relaxed grow">
            {service.description}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent mt-auto group-hover:gap-2 transition-all">
          Learn more <ArrowRight size={13} />
        </span>
      </Card>
    </Link>
  );
}

export function ServicesList() {
  const { data: services = [], isLoading } = useServices();

  const rides = services.filter((s) => s.category === "ride");
  const special = services.filter((s) => s.category === "special");

  if (isLoading) {
    return (
      <div className="px-8 sm:px-16 py-8 md:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="shadow-sm h-68 bg-white rounded-3xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Book A Ride */}
      <section className="py-8 md:py-20 px-8 sm:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-center sm:text-left text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2">
              Book A Ride
            </p>
            <h2 className="text-center sm:text-left text-2xl font-black tracking-tight text-black">
              Get where you need to go.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rides.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Special Services */}
      <section className="py-8 md:py-20 px-8 sm:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-center sm:text-left text-xs font-bold tracking-[0.2em] text-accent uppercase mb-2">
              Special Services
            </p>
            <h2 className="text-center sm:text-left text-2xl font-black tracking-tight text-[#0f0f0f]">
              Beyond the everyday ride.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {special.map((s) => (
              <ServiceCard variant="secondary" key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
