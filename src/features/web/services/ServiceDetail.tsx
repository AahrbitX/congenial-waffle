"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Car, Key, Navigation, Plane, Train, Globe, Heart, Users, Briefcase, Palmtree, CalendarDays, GraduationCap, Check, ArrowLeft, Clock, Tag } from "lucide-react";
import { useService } from "@/hooks/useServices";
import { useBooking } from "@/context/BookingContext";

const ICON_MAP: Record<string, React.ElementType> = {
  IconCar:           Car,
  IconKey:           Key,
  IconNavigation:    Navigation,
  IconPlane:         Plane,
  IconTrain:         Train,
  IconGlobe:         Globe,
  IconHeart:         Heart,
  IconUsers:         Users,
  IconBriefcase:     Briefcase,
  IconPalmtree:      Palmtree,
  IconCalendarDays:  CalendarDays,
  IconGraduationCap: GraduationCap,
};

interface ServiceDetailProps {
  slug: string;
}

export function ServiceDetail({ slug }: ServiceDetailProps) {
  const { data: service, isLoading } = useService(slug);
  const { openBooking } = useBooking();

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

  if (!service) {
    notFound();
  }

  const Icon = ICON_MAP[service.iconName] ?? Car;

  return (
    <main className="w-full">
      {/* Hero */}
      <section className="pt-36 pb-20 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-blue-500 transition-colors mb-8"
          >
            <ArrowLeft size={13} /> All Services
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Icon size={28} className="text-blue-500" />
            </div>
            {service.badge && (
              <span className="text-[11px] font-bold tracking-wide text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full">
                {service.badge}
              </span>
            )}
          </div>

          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f] mb-3">
            {service.name}
          </h1>
          <p className="text-gray-400 text-[15px] mb-6 leading-relaxed max-w-xl">{service.tagline}</p>
          <p className="text-gray-600 text-[16px] leading-relaxed max-w-xl">{service.description}</p>
        </div>
      </section>

      {/* Details grid */}
      <section className="py-20 px-8 sm:px-16 bg-[#f8f9fe]">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Features */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-5">What&apos;s Included</p>
            <ul className="space-y-3">
              {service.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                  <span className="text-[14px] text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing & availability */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-5">Pricing & Availability</p>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Tag size={15} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Starting From</p>
                  <p className="text-[18px] font-black text-[#0f0f0f]">{service.basePrice}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Clock size={15} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Availability</p>
                  <p className="text-[15px] font-bold text-[#0f0f0f]">{service.availability}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => openBooking(service.name)}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[15px] py-4 rounded-2xl transition-colors group"
            >
              Book Now
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
