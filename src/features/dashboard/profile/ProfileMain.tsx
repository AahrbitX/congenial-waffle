"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, Card, Input, Label, ListBox, Select } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { useUserStats, useHasPassword } from "@/hooks/useUser";
import { initials } from "@/lib/dashboard/helpers";
import { ROUTES } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  IconLogOut,
  IconShield,
  IconBellRing,
  IconHelpCircle,
  IconGift,
  IconSettings,
  IconChevronRight,
  IconLock,
} from "@/constants/icons";
import { Edit, Save } from "lucide-react";
import { PasswordModal } from "./PasswordModal";
import { request } from "@/lib/api-client";

const MENU_ITEMS = [
  {
    icon: IconShield,
    label: "Privacy & Safety",
    sub: "Location sharing, emergency contacts",
    href: ROUTES.dashboard.profile.privacy,
    disabled: true,
  },
  {
    icon: IconBellRing,
    label: "Notifications",
    sub: "Ride alerts, promos",
    href: ROUTES.dashboard.profile.notifications,
    disabled: true,
  },
  {
    icon: IconHelpCircle,
    label: "Help & Support",
    sub: "FAQs, chat with us",
    href: ROUTES.dashboard.profile.help,
    disabled: false,
  },
  {
    icon: IconGift,
    label: "Refer & Earn",
    sub: "Invite friends, get ₹100",
    href: ROUTES.dashboard.profile.refer,
    disabled: true,
  },
  {
    icon: IconSettings,
    label: "Preferences",
    sub: "Language, AC preference",
    href: ROUTES.dashboard.profile.preferences,
    disabled: true,
  },
];

export function ProfileMain() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const { data: stats } = useUserStats();
  const { data: pwData } = useHasPassword();

  const router = useRouter();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [gender, setGender] = useState<
    "male" | "female" | "other" | "prefer_not_to_say" | ""
  >((user as any)?.gender ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Sync state once session loads (session is async)
  useEffect(() => {
    if (user?.name) setName(user.name);
    if ((user as any)?.gender) setGender((user as any).gender);
  }, [user?.id]);

  const [showSignOut, setShowSignOut] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const phone = (user as any)?.phoneNumber ?? "";

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      await request("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name, gender: gender || undefined }),
      });
      await authClient.getSession();
      setEditing(false);
    } catch {
      setSaveError("Failed to save. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Profile card */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="flex flex-col items-center text-center gap-3">
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
        <Card>
          <Card.Header className="flex-row items-center justify-between mb-2">
            <Card.Title className="">Personal Information</Card.Title>
            <div className="space-x-2">
              {editing && (
                <Button size="sm" onPress={handleSave} isLoading={saving}>
                  <Save size={10} /> Save
                </Button>
              )}
              <Button
                size="sm"
                onPress={() => {
                  if (editing) {
                    setName(user?.name ?? "");
                    setGender((user as any)?.gender ?? "");
                    setSaveError("");
                  }
                  setEditing((v) => !v);
                }}
              >
                <Edit size={6} /> {editing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </Card.Header>
          <Card.Content className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="block" htmlFor="name">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                fullWidth
                variant="secondary"
                onChange={(e) => setName(e.target.value)}
                disabled={!editing || saving}
              />
            </div>

            <div className="space-y-2">
              <Label className="block" htmlFor="phone">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                fullWidth
                value={phone}
                variant="secondary"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label className="block">Gender</Label>
              <Select
                value={gender}
                onChange={(key) =>
                  setGender(
                    (key?.toString() as
                      | "male"
                      | "female"
                      | "other"
                      | "prefer_not_to_say") ?? "",
                  )
                }
                isDisabled={!editing}
                variant="secondary"
                placeholder="Select gender"
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>

                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="male">Male</ListBox.Item>
                    <ListBox.Item id="female">Female</ListBox.Item>
                    <ListBox.Item id="other">Other</ListBox.Item>
                    <ListBox.Item id="prefer_not_to_say">
                      Prefer not to say
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </Card.Content>
          {saveError && (
            <p className="px-4 pb-3 text-sm text-danger">{saveError}</p>
          )}
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="">Account Settings</Card.Title>
          </Card.Header>
          <Card.Content>
            {MENU_ITEMS.map(({ icon: Icon, label, sub, href, disabled }) =>
              disabled ? (
                <div
                  key={label}
                  className="w-full flex items-center py-2 border-t border-[var(--color-border)] first:border-0 opacity-40 pointer-events-none"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mr-2">
                    <Icon size={22} className="text-muted" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted">{sub}</p>
                  </div>
                  <span className="text-[10px] bg-default-100 text-muted px-2 py-0.5 rounded-full mr-1">
                    Soon
                  </span>
                </div>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="w-full flex items-center py-2 transition-colors text-left border-t border-[var(--color-border)] first:border-0 group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-primary-light transition-colors shrink-0 mr-2">
                    <Icon
                      size={22}
                      className="text-muted group-hover:text-accent transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted">{sub}</p>
                  </div>
                  <IconChevronRight
                    size={14}
                    className="text-muted group-hover:text-accent transition-colors"
                  />
                </Link>
              ),
            )}

            {/* Password row */}
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center py-2 transition-colors text-left border-t border-[var(--color-border)] group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-primary-light transition-colors shrink-0 mr-2">
                <IconLock
                  size={22}
                  className="text-muted group-hover:text-accent transition-colors"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {pwData ? "Reset Password" : "Create Password"}
                </p>
                <p className="text-xs text-muted">
                  {pwData
                    ? "Change your password via OTP"
                    : "Set a password for your account"}
                </p>
              </div>
              <IconChevronRight
                size={14}
                className="text-muted group-hover:text-accent transition-colors"
              />
            </button>
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

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        hasPassword={!!pwData}
        phoneNumber={phone}
      />
    </div>
  );
}
