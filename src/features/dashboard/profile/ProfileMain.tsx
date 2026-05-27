"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, Card, Input, Label } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { useUserStats } from "@/hooks/useUser";
import { initials } from "@/lib/dashboard/helpers";
import { ROUTES } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  IconCamera,
  IconLogOut,
  IconShield,
  IconBellRing,
  IconHelpCircle,
  IconGift,
  IconSettings,
  IconChevronRight,
} from "@/constants/icons";
import { Edit, Save } from "lucide-react";

const MENU_ITEMS = [
  {
    icon: IconShield,
    label: "Privacy & Safety",
    sub: "Location sharing, emergency contacts",
    href: ROUTES.dashboard.profile.privacy,
  },
  {
    icon: IconBellRing,
    label: "Notifications",
    sub: "Ride alerts, promos",
    href: ROUTES.dashboard.profile.notifications,
  },
  {
    icon: IconHelpCircle,
    label: "Help & Support",
    sub: "FAQs, chat with us",
    href: ROUTES.dashboard.profile.help,
  },
  {
    icon: IconGift,
    label: "Refer & Earn",
    sub: "Invite friends, get ₹100",
    href: ROUTES.dashboard.profile.refer,
  },
  {
    icon: IconSettings,
    label: "Preferences",
    sub: "Language, AC preference",
    href: ROUTES.dashboard.profile.preferences,
  },
];

export function ProfileMain() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { data: stats } = useUserStats();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState((user as any)?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Profile card */}
      <div className="lg:col-span-1 space-y-4">
        <Card className=" flex flex-col items-center text-center gap-3">
          <div className="relative">
            <Avatar size="lg">
              <Avatar.Fallback className="bg-primary text-white text-[24px] font-black">
                {initials(user?.name)}
              </Avatar.Fallback>
            </Avatar>
          </div>
          <div>
            <p className="text-xl font-bold text-primary">
              {user?.name ?? "User"}
            </p>
            {/* <p className="text-base text-muted">{user?.email ?? ""}</p> */}
          </div>
          <div className="flex gap-4 w-full pt-2 border-t border-border">
            {[
              { v: String(stats?.totalRides ?? "—"), l: "Rides" },
              { v: String(stats?.rating ?? "—"), l: "Rating" },
              { v: `₹${stats?.totalSpent ?? 0}`, l: "Spent" },
            ].map(({ v, l }) => (
              <div key={l} className="flex-1 text-center">
                <p className="text-xl font-semibold text-primary">{v}</p>
                <p className="text-sm text-muted">{l}</p>
              </div>
            ))}
          </div>
        </Card>
        <Button
          onPress={() => setShowSignOut(true)}
          variant="danger-soft"
          fullWidth
        >
          <IconLogOut size={15} className="mr-2" /> Sign Out
        </Button>
      </div>

      {/* Edit form + settings */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="">
          <Card.Header className="flex-row items-center justify-between mb-2">
            <Card.Title className="text-lg">Personal Information</Card.Title>
            <div className="space-x-2">
              {editing && (
                <Button size="sm" onPress={() => setEditing((v) => !v)}>
                  <Save size={10} /> Save
                </Button>
              )}
              <Button size="sm" onPress={() => setEditing((v) => !v)}>
                <Edit size={6} /> {editing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </Card.Header>
          <Card.Content className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: name, set: setName, type: "text" },
              {
                label: "Phone Number",
                value: phone,
                set: setPhone,
                type: "tel",
              },
              {
                label: "Email Address",
                value: email,
                set: setEmail,
                type: "email",
              },
            ].map(({ label, value, set, type }) => (
              <div key={label}>
                <Label className="">{label}</Label>
                <Input
                  type={type}
                  value={value}
                  variant="secondary"
                  onChange={(e) => set(e.target.value)}
                  // disabled={!editing}
                />
              </div>
            ))}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="">
            <Card.Title className="text-lg">Account Settings</Card.Title>
          </Card.Header>
          <Card.Content>
            {MENU_ITEMS.map(({ icon: Icon, label, sub, href }) => (
              <Link
                key={href}
                href={href}
                className="w-full flex items-center py-2  transition-colors text-left border-t border-[var(--color-border)] first:border-0 group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-primary-light transition-colors shrink-0 mr-2">
                  <Icon
                    size={22}
                    className="text-muted group-hover:text-accent transition-colors bg-transparent"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold ">{label}</p>
                  <p className="text-xs text-muted">{sub}</p>
                </div>
                <IconChevronRight
                  size={14}
                  className="text-muted group-hover:text-accent transition-colors"
                />
              </Link>
            ))}
          </Card.Content>
        </Card>
      </div>

      {/* Sign-out confirm */}
      {showSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-danger-light)] flex items-center justify-center mx-auto">
              <IconLogOut size={28} className="text-[var(--color-danger)]" />
            </div>
            <p className="text-[18px] font-black text-primary">Sign out?</p>
            <p className="text-[13px] text-muted leading-relaxed">
              You&apos;ll need to log in again with your phone number to access
              your account.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                onPress={() => setShowSignOut(false)}
                className="flex-1 rounded-xl font-semibold border border-[var(--color-border-strong)] text-[var(--color-text-secondary)]"
              >
                Cancel
              </Button>
              <Button
                onPress={() => {
                  setShowSignOut(false);
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        queryClient.clear();
                        router.push("/");
                        router.refresh();
                      },
                    },
                  });
                }}
                className="flex-1 rounded-xl font-bold bg-[var(--color-danger)] text-white"
              >
                Yes, Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
