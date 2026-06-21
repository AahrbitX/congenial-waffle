"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Check,
  ArrowLeft,
  Clock,
  Tag,
} from "lucide-react";
import { useService } from "@/hooks/useServices";
import { useBooking } from "@/context/BookingContext";
import { Button, Card, Chip, Surface } from "@heroui/react";

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

interface ServiceDetailProps {
  slug: string;
}

export function ServiceDetail({ slug }: ServiceDetailProps) {
  const { data: service, isLoading } = useService(slug);
  const { openBooking } = useBooking();
  const router = useRouter();

  if (isLoading) {
    return (
      <main className="w-full">
        <div className="pt-36 pb-20 px-8 sm:px-16 bg-white">
          <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-14 w-2/3 bg-gray-200 rounded" />
            <div className="h-5 w-full bg-gray-100 rounded" />
            <div className="h-5 w-3/4 bg-gray-100 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (!isLoading && !service) {
    router.replace("/services");
    return null;
  }

  const Icon = ICON_MAP[service.iconName] ?? Car;

  return (
    <main className="w-full">
      {/* Hero */}
      <Surface variant="default">
        <div className="relative overflow-hidden pt-24 sm:pt-36 pb-8 sm:pb-16">
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-16">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm mt-2 mb-6 font-semibold text-muted hover:text-accent transition-colors"
            >
              <ArrowLeft size={13} /> All Services
            </Link>

            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Icon size={26} className="text-accent" />
              </div>
              {service.badge && (
                <Chip variant="primary" color="accent">
                  {service.badge}
                </Chip>
              )}
            </div>

            <h1 className="text-[clamp(2.2rem,6vw,4rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f] mb-3">
              {service.name}
            </h1>
            <p className="text-accent text-[15px] mb-5 leading-relaxed max-w-xl font-medium">
              {service.tagline}
            </p>
            <p className="text-gray-600 text-[15px] leading-relaxed max-w-xl">
              {service.description}
            </p>
          </div>
        </div>
      </Surface>

      {/* Details grid */}
      <Surface variant="secondary" className="py-8 sm:py-20 px-6 sm:px-16 ">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Features */}
          <div>
            <p className="text-xs font-semibold tracking-[0.1em] text-accent uppercase mb-5">
              What&apos;s Included
            </p>
            <ul className="space-y-3">
              {(service.vehicleCategories ?? []).map((cat) => (
                <li key={cat} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="text-lg text-muted">{cat}</span>
                </li>
              ))}
              {(service.vehicleCategories ?? []).length === 0 && (
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="text-lg text-muted">Available on request</span>
                </li>
              )}
            </ul>
          </div>

          {/* Pricing & availability */}
          <div className="space-y-4">
            <p className="text-xs font-bold tracking-[0.1em] text-accent uppercase mb-5">
              Pricing & Availability
            </p>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-200 flex items-center justify-center">
                  <Tag size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted font-medium">
                    Starting From
                  </p>
                  <p className="text-xl font-semibold ">Contact us</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-200 flex items-center justify-center">
                  <Clock size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted font-medium">Availability</p>
                  <p className="text-lg font-semibold">24 × 7</p>
                </div>
              </div>
            </Card>

            <Button
              fullWidth
              size="lg"
              onClick={() => openBooking({ serviceId: service.slug })}
            >
              Book Now
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Button>
          </div>
        </div>
      </Surface>
    </main>
  );
}
