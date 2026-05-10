"use client";

import { useState } from "react";
import { Avatar } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { useReferrals } from "@/hooks/useUser";
import { REFERRAL_CODE } from "@/data/user.mock";
import { initials } from "@/lib/dashboard/helpers";
import { IconShare, IconLoader } from "@/constants/icons";

export function ReferEarn() {
  const [copied, setCopied] = useState(false);
  const { data: referrals = [], isLoading } = useReferrals();

  function handleCopy() {
    navigator.clipboard.writeText(REFERRAL_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="bg-[var(--color-primary)] rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-full bg-white/10 rounded-bl-[50px]" />
        <div className="relative z-10">
          <p className="text-[42px] mb-3">🎁</p>
          <p className="text-[20px] font-black text-white mb-2">Give ₹100, Get ₹100</p>
          <p className="text-blue-100 text-[13px] mb-5 leading-relaxed max-w-sm mx-auto">
            Invite friends to Mohan Cabs. When they complete their first ride, you both get ₹100 off.
          </p>
          <div className="bg-white/20 rounded-xl p-3 flex items-center gap-3 mb-4">
            <p className="flex-1 text-[22px] font-black text-white tracking-widest">{REFERRAL_CODE}</p>
            <Button
              onPress={handleCopy}
              className={`font-bold rounded-lg transition-all ${copied ? "bg-[var(--color-success)] text-white" : "bg-white text-[var(--color-primary)]"}`}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </Button>
          </div>
          <Button className="w-full border border-white/40 text-white hover:bg-white/20 font-semibold rounded-xl">
            <IconShare size={15} className="mr-2" /> Share via WhatsApp
          </Button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
        <p className="text-[14px] font-black text-[var(--color-text-primary)] mb-3">Your Referrals</p>
        {isLoading ? (
          <div className="flex justify-center py-4"><IconLoader size={22} className="animate-spin text-[var(--color-primary)]" /></div>
        ) : (
          referrals.map((r) => (
            <div key={r.name} className="flex items-center gap-3 py-2.5 border-b last:border-0 border-[var(--color-border)]">
              <Avatar size="sm">
                <Avatar.Fallback className="bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold text-[11px]">
                  {initials(r.name)}
                </Avatar.Fallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[var(--color-text-primary)]">{r.name}</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">{r.status}</p>
              </div>
              <p className={`text-[14px] font-black ${r.color}`}>{r.earned}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
