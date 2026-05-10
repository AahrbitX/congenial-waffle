"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { useUserStats } from "@/hooks/useUser";
import { useDashboard } from "@/context/DashboardContext";
import { initials } from "@/lib/dashboard/helpers";
import { ROUTES } from "@/constants/routes";
import {
  IconCamera, IconEdit, IconLogOut, IconShield,
  IconBellRing, IconHelpCircle, IconGift, IconSettings, IconChevronRight,
} from "@/constants/icons";

const MENU_ITEMS = [
  { icon: IconShield,    label: "Privacy & Safety",   sub: "Location sharing, emergency contacts", href: ROUTES.dashboard.profile.privacy       },
  { icon: IconBellRing,  label: "Notifications",       sub: "Ride alerts, promos",                  href: ROUTES.dashboard.profile.notifications  },
  { icon: IconHelpCircle,label: "Help & Support",      sub: "FAQs, chat with us",                   href: ROUTES.dashboard.profile.help           },
  { icon: IconGift,      label: "Refer & Earn",        sub: "Invite friends, get ₹100",             href: ROUTES.dashboard.profile.refer          },
  { icon: IconSettings,  label: "Preferences",         sub: "Language, AC preference",              href: ROUTES.dashboard.profile.preferences    },
];

export function ProfileMain() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { data: stats } = useUserStats();
  const { setActiveTrip } = useDashboard();

  const [editing, setEditing]     = useState(false);
  const [name, setName]           = useState(user?.name ?? "");
  const [phone, setPhone]         = useState((user as any)?.phone ?? "");
  const [email, setEmail]         = useState(user?.email ?? "");
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Profile card */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-3">
          <div className="relative">
            <Avatar size="lg">
              <Avatar.Fallback className="bg-[var(--color-primary)] text-white text-[24px] font-black">
                {initials(user?.name)}
              </Avatar.Fallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-surface)] shadow-md flex items-center justify-center border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]">
              <IconCamera size={12} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>
          <div>
            <p className="text-[16px] font-black text-[var(--color-text-primary)]">{user?.name ?? "User"}</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">{user?.email ?? ""}</p>
          </div>
          <div className="flex gap-4 w-full pt-2 border-t border-[var(--color-border)]">
            {[
              { v: String(stats?.totalRides ?? "—"), l: "Rides"  },
              { v: String(stats?.rating ?? "—"),     l: "Rating" },
              { v: `₹${stats?.walletBalance ?? 0}`,  l: "Wallet" },
            ].map(({ v, l }) => (
              <div key={l} className="flex-1 text-center">
                <p className="text-[18px] font-black text-[var(--color-text-primary)]">{v}</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <Button onPress={() => setShowSignOut(true)} className="w-full rounded-2xl font-semibold py-3 border border-[var(--color-danger-light)] text-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <IconLogOut size={15} className="mr-2" /> Sign Out
        </Button>
      </div>

      {/* Edit form + settings */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-black text-[var(--color-text-primary)]">Personal Information</p>
            <Button onPress={() => setEditing((v) => !v)} className="text-[var(--color-primary)] text-[12px] font-semibold">
              <IconEdit size={12} className="mr-1" /> {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name",     value: name,  set: setName,  type: "text"  },
              { label: "Phone Number",  value: phone, set: setPhone, type: "tel"   },
              { label: "Email Address", value: email, set: setEmail, type: "email" },
            ].map(({ label, value, set, type }) => (
              <div key={label}>
                <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  disabled={!editing}
                  className="w-full mt-1 text-[14px] font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] disabled:bg-transparent border border-transparent disabled:border-transparent focus:border-[var(--color-primary)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] transition-colors"
                />
              </div>
            ))}
          </div>
          {editing && (
            <Button onPress={() => setEditing(false)} className="mt-4 bg-[var(--color-primary)] text-white font-bold rounded-xl px-6">
              Save Changes
            </Button>
          )}
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase px-5 pt-4 pb-2">Account Settings</p>
          {MENU_ITEMS.map(({ icon: Icon, label, sub, href }) => (
            <Link
              key={href}
              href={href}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--color-surface-muted)] transition-colors text-left border-t border-[var(--color-border)] first:border-0 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center group-hover:bg-[var(--color-primary-light)] transition-colors shrink-0">
                <Icon size={16} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{label}</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">{sub}</p>
              </div>
              <IconChevronRight size={14} className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Sign-out confirm */}
      {showSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-danger-light)] flex items-center justify-center mx-auto">
              <IconLogOut size={28} className="text-[var(--color-danger)]" />
            </div>
            <p className="text-[18px] font-black text-[var(--color-text-primary)]">Sign out?</p>
            <p className="text-[13px] text-[var(--color-text-tertiary)] leading-relaxed">You'll need to log in again with your phone number to access your account.</p>
            <div className="flex gap-3 pt-2">
              <Button onPress={() => setShowSignOut(false)} className="flex-1 rounded-xl font-semibold border border-[var(--color-border-strong)] text-[var(--color-text-secondary)]">Cancel</Button>
              <Button onPress={() => { setShowSignOut(false); authClient.signOut(); }} className="flex-1 rounded-xl font-bold bg-[var(--color-danger)] text-white">
                Yes, Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
