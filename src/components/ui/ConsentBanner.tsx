"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { saveMarketingConsent } from "@/api/user.api";

const CONSENT_KEY = "mohan-cabs-consent";

export function ConsentBanner() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  async function handleChoice(accepted: boolean) {
    localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "declined");
    setVisible(false);

    if (session?.user) {
      await saveMarketingConsent(accepted).catch(() => {});
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-lg">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
        <p className="flex-1 text-xs text-[var(--color-text-secondary)] leading-relaxed">
          We use your data to send booking updates &amp; offers via WhatsApp. See our{" "}
          <a href="/privacy" className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors">
            Privacy Policy
          </a>.
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => handleChoice(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice(true)}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
