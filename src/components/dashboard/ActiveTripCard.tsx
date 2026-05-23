"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { IconStar, IconPhone, IconMessageCircle } from "@/constants/icons";

interface ActiveTripCardProps {
  onEnd: () => void;
}

const ACTIVE_DRIVER = {
  name: "Ravi Kumar",
  initials: "RK",
  vehicle: "Sedan · KL-01-AB-1234",
  phone: "+919876543210",
  stats: [
    { v: "2 km", l: "Driver Away" },
    { v: "~18 min", l: "To Dropoff" },
    { v: "₹340", l: "Fare" },
  ],
};

export function ActiveTripCard({ onEnd }: ActiveTripCardProps) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-primary-light)] shadow-md overflow-hidden mb-6">
      <div className="bg-[var(--color-primary)] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[14px] font-bold">Ride In Progress</span>
        </div>
        <span className="text-white text-[15px] font-black tabular-nums">
          {mins}:{secs}
        </span>
      </div>
      <MapPlaceholder height={140} />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 bg-[var(--color-surface-muted)] rounded-xl p-3">
          <Avatar size="md">
            <Avatar.Fallback className="bg-[var(--color-primary)] text-white font-bold">
              {ACTIVE_DRIVER.initials}
            </Avatar.Fallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-primary">
              {ACTIVE_DRIVER.name}
            </p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">
              {ACTIVE_DRIVER.vehicle}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${ACTIVE_DRIVER.phone}`}
              className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-md hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              <IconPhone size={14} className="text-white" />
            </a>
            <a
              href={`https://wa.me/${ACTIVE_DRIVER.phone}`}
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            >
              <IconMessageCircle size={14} className="text-white" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ACTIVE_DRIVER.stats.map((s) => (
            <div
              key={s.l}
              className="bg-[var(--color-surface-muted)] rounded-xl p-2.5 text-center"
            >
              <p className="text-[14px] font-black text-primary">{s.v}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                {s.l}
              </p>
            </div>
          ))}
        </div>
        <Button
          onPress={onEnd}
          className="w-full bg-[var(--color-primary)] text-white font-bold rounded-xl"
        >
          <IconStar size={14} className="mr-1.5" /> End Trip & Rate Driver
        </Button>
      </div>
    </div>
  );
}
