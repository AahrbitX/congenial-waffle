"use client";

import React, { useEffect, useState } from "react";
import { Skeleton, toast } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { useHasPassword } from "@/hooks/useUser";
import { PasswordModal } from "@/features/dashboard/profile/PasswordModal";
import {
  IconUser, IconPhone, IconCheck, IconLoader,
  IconLock, IconBellRing, IconShield, IconSettings,
  IconChevronRight, IconHelpCircle, IconAlert, IconClock,
  IconArrowLeftRight, IconCopy,
} from "@/constants/icons";

/* ── helpers ─────────────────────────────────────────────────────────────── */
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "A";
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function SectionSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 pt-5 pb-2">
      <Skeleton className="h-3 w-28 rounded mb-2" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-t border-border">
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

function ActionItem({ icon: Icon, label, sub, onClick, badge, disabled, badgeColor = "muted" }: ActionItemProps) {
  const badgeClass =
    badgeColor === "primary" ? "bg-primary/10 text-primary" :
    badgeColor === "success"  ? "bg-success/10  text-success"  :
    badgeColor === "warning"  ? "bg-warning/10  text-warning"  :
    "bg-surface-muted text-text-tertiary";

  const inner = (
    <>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
        disabled ? "bg-surface-muted" : "bg-surface-muted group-hover:bg-primary/10"
      }`}>
        <Icon size={17} className={disabled ? "text-text-tertiary" : "text-text-secondary group-hover:text-primary"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${disabled ? "text-text-tertiary" : "text-text-primary"}`}>{label}</p>
        <p className="text-xs text-text-secondary mt-0.5 truncate">{sub}</p>
      </div>
      {badge ? (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>{badge}</span>
      ) : !disabled ? (
        <IconChevronRight size={14} className="text-text-tertiary group-hover:text-primary transition-colors shrink-0" />
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
      className="group w-full flex items-center gap-3 py-2.5 border-t border-border hover:bg-surface-muted/50 -mx-5 px-5 transition-colors"
    >
      {inner}
    </button>
  );
}

/* ── Section card ────────────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 pt-5 pb-1">
      <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">{title}</p>
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
  const [name, setName]           = useState("");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Profile card */}
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/20 to-violet-500/20" />
              <div className="px-6 pb-5 -mt-10 flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-zinc-900 shrink-0">
                  <span className="text-white text-2xl font-black tracking-tight">
                    {getInitials(user?.name ?? "Admin")}
                  </span>
                </div>
                <div className="pb-1 min-w-0">
                  <p className="font-bold text-lg text-text-primary leading-tight truncate">
                    {user?.name ?? "Admin"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Admin</span>
                    <span className="text-xs text-text-secondary truncate">{user?.phoneNumber ?? ""}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Account Details</h3>
                <p className="text-xs text-text-secondary mt-0.5">Update your display name for the admin panel.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <IconUser size={15} className="text-text-tertiary" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setSaveError(""); }}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <IconPhone size={15} className="text-text-tertiary" />
                  </div>
                  <input
                    type="tel"
                    value={user?.phoneNumber ?? ""}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-muted/60 text-sm text-text-secondary cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[11px] text-text-tertiary">Phone is tied to your login and cannot be changed.</p>
              </div>

              {saveError && (
                <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-2.5">{saveError}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !isDirty || !name.trim()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                    saved
                      ? "bg-success text-white shadow-success/30"
                      : "bg-primary text-white hover:bg-primary/90 shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  }`}
                >
                  {saving ? <><IconLoader size={14} className="animate-spin" /> Saving…</>
                    : saved ? <><IconCheck size={14} /> Saved!</>
                    : "Save Changes"}
                </button>
                {isDirty && !saving && (
                  <button
                    onClick={() => { setName(user?.name ?? ""); setSaveError(""); }}
                    className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Help & Support */}
            <Section title="Help & Support">
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
            </Section>

          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Account Settings */}
            <Section title="Account Settings">
              <ActionItem
                icon={IconLock}
                label={hasPw ? "Reset Password" : "Create Password"}
                sub={hasPw ? "Change your password via OTP" : "Set a password for email sign-in"}
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
            </Section>

            {/* Admin Tools */}
            <Section title="Admin Tools">
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
              <ActionItem
                icon={IconCopy}
                label="API Access"
                sub="Generate and manage API keys"
                disabled
                badge="Soon"
              />
            </Section>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-danger/20 bg-danger/[0.03] px-5 pt-4 pb-4 space-y-3">
              <p className="text-xs font-bold text-danger/70 uppercase tracking-wider">Danger Zone</p>
              <div className="flex items-start gap-3 opacity-40 pointer-events-none select-none">
                <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                  <IconUser size={17} className="text-danger" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-danger">Delete Account</p>
                  <p className="text-xs text-text-secondary mt-0.5">Permanently remove your admin account and all data.</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-muted text-text-tertiary shrink-0 self-center">
                  Soon
                </span>
              </div>
            </div>

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
