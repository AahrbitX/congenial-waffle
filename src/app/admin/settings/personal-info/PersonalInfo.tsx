"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Description,
  Input,
  Label,
  Skeleton,
  toast,
} from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { useHasPassword } from "@/hooks/useUser";
import { PasswordModal } from "@/features/dashboard/profile/PasswordModal";
import {
  IconUser,
  IconPhone,
  IconCheck,
  IconLoader,
  IconLock,
  IconBellRing,
  IconShield,
  IconSettings,
  IconChevronRight,
  IconHelpCircle,
  IconAlert,
  IconClock,
  IconArrowLeftRight,
  IconCopy,
} from "@/constants/icons";
import { Car } from "lucide";

/* ── helpers ─────────────────────────────────────────────────────────────── */
function getInitials(name: string) {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "A"
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function SectionSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 pt-5 pb-2">
      <Skeleton className="h-3 w-28 rounded mb-2" />
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-2.5 border-t border-border"
        >
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-3 w-44 rounded" />
          </div>
          <Skeleton className="h-5 w-10 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

function PersonalInfoSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
      {/* Left column */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <Skeleton className="h-24 w-full" />
          <div className="px-6 pb-5 -mt-10 flex items-end gap-4">
            <Skeleton className="w-20 h-20 rounded-2xl shrink-0 ring-4 ring-white dark:ring-zinc-900" />
            <div className="pb-1 space-y-2 flex-1">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-3.5 w-28 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-52 rounded" />
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        {/* Help & Support skeleton in left column */}
        <SectionSkeleton rows={2} />
      </div>
      {/* Right column */}
      <div className="space-y-4">
        <SectionSkeleton rows={4} />
        <SectionSkeleton rows={3} />
        <div className="rounded-2xl border border-border bg-surface px-5 pt-4 pb-4">
          <Skeleton className="h-3 w-24 rounded mb-3" />
          <div className="flex items-center gap-3 py-2">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Action item ─────────────────────────────────────────────────────────── */
interface ActionItemProps {
  icon: React.ElementType;
  label: string;
  sub: string;
  onClick?: () => void;
  badge?: string;
  disabled?: boolean;
  badgeColor?: "primary" | "success" | "warning" | "muted";
}

function ActionItem({
  icon: Icon,
  label,
  sub,
  onClick,
  badge,
  disabled,
  badgeColor = "muted",
}: ActionItemProps) {
  const badgeClass =
    badgeColor === "primary"
      ? "bg-primary/10 text-primary"
      : badgeColor === "success"
        ? "bg-success/10  text-success"
        : badgeColor === "warning"
          ? "bg-warning/10  text-warning"
          : "bg-surface-muted text-text-tertiary";

  const inner = (
    <>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center  shrink-0 transition-colors ${
          disabled
            ? "bg-surface-muted"
            : "bg-surface-muted group-hover:bg-primary/10"
        }`}
      >
        <Icon
          size={17}
          className={
            disabled
              ? "text-muted"
              : "text-text-secondary group-hover:text-primary"
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold ${disabled ? "text-muted" : "text-primary text-start"}`}
        >
          {label}
        </p>
        <p className="text-xs text-text-secondary text-start mt-0.5">{sub}</p>
      </div>
      {badge ? (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}
        >
          {badge}
        </span>
      ) : !disabled ? (
        <IconChevronRight
          size={14}
          className="text-text-tertiary group-hover:text-primary transition-colors shrink-0"
        />
      ) : null}
    </>
  );

  if (disabled) {
    return (
      <div className="flex items-center gap-3 py-2.5 border-t border-border opacity-40 select-none">
        {inner}
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3 py-2.5 border-t border-border hover:bg-surface-muted/50 transition-colors mx-auto cursor-pointer"
    >
      {inner}
    </button>
  );
}

/* ── Section card ────────────────────────────────────────────────────────── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 pt-5 mb-10">
      <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */
interface Props {
  isLoading: boolean;
  user?: { name?: string | null; [key: string]: any } | null;
}

export default function PersonalInfo({ isLoading, user }: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { data: hasPw } = useHasPassword();

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const isDirty = name !== (user?.name ?? "");

  const handleSave = async () => {
    if (!name.trim() || !isDirty) return;
    setSaving(true);
    setSaveError("");
    const { error } = await authClient.updateUser({ name } as any);
    if (error) {
      setSaveError(error.message || "Failed to save.");
    } else {
      setSaved(true);
      toast.success("Profile updated");
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div>
      {isLoading ? (
        <PersonalInfoSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_386px] gap-4">
          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Profile card */}
            <Card className="overflow-hidden border border-border p-0">
              <div className="h-32 bg-gradient-to-r from-primary/30 via-primary/20 to-violet-500/20" />

              <div className="px-6 pb-5 pt-0">
                <div className="-mt-10 flex items-end gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shrink-0">
                    <span className="text-white text-2xl font-black tracking-tight">
                      {getInitials(user?.name ?? "Admin")}
                    </span>
                  </div>

                  <div className="pb-1 min-w-0 flex-1">
                    <p className="font-bold text-lg text-text-primary leading-tight truncate">
                      {user?.name ?? "Admin"}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Admin
                      </span>

                      <span className="text-xs text-text-secondary truncate">
                        {user?.phoneNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Edit form */}
            <Card>
              <Card.Header>
                <Card.Title>Account Details</Card.Title>
                <Card.Description>
                  Update your display name for the admin panel.
                </Card.Description>
              </Card.Header>

              <div className="space-y-4">
                <Label htmlFor="name" className="text-sm mb-2">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <IconUser size={15} className="text-text-tertiary" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    variant="secondary"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSaveError("");
                    }}
                    placeholder="Your full name"
                    className="w-full pl-10 "
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm mb-2">Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <IconPhone size={15} className="text-text-tertiary" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    variant="secondary"
                    value={user?.phoneNumber ?? ""}
                    readOnly
                    className="w-full pl-10 pr-4"
                  />
                </div>
                <Description className="text-xs text-muted">
                  Phone is tied to your login and cannot be changed.
                </Description>
              </div>

              {saveError && (
                <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-2.5">
                  {saveError}
                </p>
              )}

              <Card.Footer className="flex items-center justify-end gap-4">
                {isDirty && !saving && (
                  <Button
                    onClick={() => {
                      setName(user?.name ?? "");
                      setSaveError("");
                    }}
                    variant="ghost"
                  >
                    Reset
                  </Button>
                )}
                <Button
                  onPress={handleSave}
                  isDisabled={saving || !isDirty || !name.trim()}
                >
                  {saving ? (
                    <>
                      <IconLoader size={14} className="animate-spin" /> Saving…
                    </>
                  ) : saved ? (
                    <>
                      <IconCheck size={14} /> Saved!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </Card.Footer>
            </Card>

            {/* Help & Support */}
            <Card className="mb-10">
              <Card.Header>
                <Card.Title>Help & Support</Card.Title>
              </Card.Header>
              <div>
                <ActionItem
                  icon={IconHelpCircle}
                  label="Help Center"
                  sub="Docs, guides, and FAQs"
                  disabled
                  badge="Soon"
                />
                <ActionItem
                  icon={IconAlert}
                  label="Report an Issue"
                  sub="Let us know if something's broken"
                  disabled
                  badge="Soon"
                />
              </div>
            </Card>
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Account Settings */}
            <Card>
              <Card.Header>
                <Card.Title>Account Settings</Card.Title>
              </Card.Header>
              <div>
                <ActionItem
                  icon={IconLock}
                  label={hasPw ? "Reset Password" : "Create Password"}
                  sub={
                    hasPw
                      ? "Change your password via OTP"
                      : "Set a password for email sign-in"
                  }
                  onClick={() => setShowPasswordModal(true)}
                  badge={hasPw ? undefined : "Set up"}
                  badgeColor="primary"
                />
                <ActionItem
                  icon={IconBellRing}
                  label="Notifications"
                  sub="Manage email and SMS alerts"
                  disabled
                  badge="Soon"
                />
                <ActionItem
                  icon={IconShield}
                  label="Privacy & Security"
                  sub="Sessions, login history, 2FA"
                  disabled
                  badge="Soon"
                />
                <ActionItem
                  icon={IconSettings}
                  label="Preferences"
                  sub="Theme, language, timezone"
                  disabled
                  badge="Soon"
                />
              </div>
            </Card>

            {/* Admin Tools */}
            <Card>
              <Card.Header>
                <Card.Title>Admin Tools</Card.Title>
              </Card.Header>
              <div>
                <ActionItem
                  icon={IconClock}
                  label="Activity Log"
                  sub="View recent admin actions and changes"
                  disabled
                  badge="Soon"
                />
                <ActionItem
                  icon={IconArrowLeftRight}
                  label="Integrations"
                  sub="SMS gateway, payment provider config"
                  disabled
                  badge="Soon"
                />
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="rounded-2xl border border-danger/20 bg-danger/[0.03] px-5 pt-4 pb-4 space-y-3">
              <Card.Title className="text-xs font-bold text-danger/70 uppercase tracking-wider mb-0">
                Danger Zone
              </Card.Title>
              <div className="flex items-start gap-3 opacity-40 pointer-events-none select-none">
                <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                  <IconUser size={17} className="text-danger" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-danger">
                    Delete Account
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Permanently remove your admin account and all data.
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-muted text-text-tertiary shrink-0 self-center">
                  Soon
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        hasPassword={hasPw ?? false}
        phoneNumber={user?.phoneNumber ?? ""}
      />
    </div>
  );
}
