import React from "react";
import { Card, Avatar, Chip, Button, Surface } from "@heroui/react";
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  MessageCircle,
  UserX,
  Star,
} from "lucide-react";
import { User } from "@/types/user";
import UserAvatar from "@/components/user/avatar";

export default function UserProfileHeader({ user }: { user: User }) {
  const stats = [
    { label: "Total Rides", value: "28" },
    { label: "Avg Rating", value: "4.3", icon: true },
    { label: "Total Spent", value: "₹2370" },
    { label: "Balance Due", value: "₹520", isAlert: true },
    { label: "Member Since", value: "Jan 2025" },
    { label: "Open Tickets", value: "1", isAlert: true },
  ];

  return (
    <Card variant="secondary" className="p-6 border-none shadow-sm my-4">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* Left Side: Profile Info */}
        <div className="flex gap-5">
          <UserAvatar username={user.name} />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              <Chip size="sm" variant="soft" color="success">
                Active
              </Chip>
            </div>

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-default-500">
              <InfoItem icon={<FileText size={16} />} text="R-501" />
              <InfoItem icon={<Phone size={16} />} text="98765 43210" />
              <InfoItem
                icon={<Mail size={16} />}
                text="priya.sharma@gmail.com"
              />
              <InfoItem icon={<MapPin size={16} />} text="Mumbai" />
            </div>

            {/* Stats Grid */}
            <div className="flex flex-wrap gap-3 mt-2">
              {stats.map((stat, i) => (
                <Surface
                  key={i}
                  variant="default"
                  className="flex flex-col items-center justify-center min-w-[100px] py-3 px-4 rounded-xl"
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "text-lg font-bold",
                        stat.isAlert && stat.label !== "Member Since"
                          ? "text-danger"
                          : "text-default-900",
                        stat.label === "Avg Rating" ? "text-orange-500" : "",
                      )}
                    >
                      {stat.value}
                    </span>
                    {stat.icon && (
                      <Star
                        size={14}
                        className="fill-orange-500 text-orange-500 mb-0.5"
                      />
                    )}
                  </div>
                  <span className="text-[12px] font-medium">{stat.label}</span>
                </Surface>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col gap-3 min-w-[180px]">
          <Button
            fullWidth
            className={"text-emerald-600 bg-emerald-200 border-2"}
          >
            <MessageCircle size={20} fill="currentColor" /> WhatsApp
          </Button>
          <Button variant="danger" fullWidth>
            <UserX size={20} /> Suspend Rider
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Small helper for meta info
function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

// Utility for class merging
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
