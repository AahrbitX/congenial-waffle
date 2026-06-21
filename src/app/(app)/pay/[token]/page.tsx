"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PayInfo = {
  bookingUserId: string;
  bookingRef: string;
  customerName: string;
  journeyDate: string;
  journeyTime: string;
  pickupName: string;
  dropName: string;
  totalFare: string;
  totalPaid: string;
  amountDue: string;
  keyId: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function PublicPayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [info, setInfo] = useState<PayInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pay/${token}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) { setError(res.message ?? "Booking not found"); return; }
        setInfo(res.data);
      })
      .catch(() => setError("Failed to load payment details."))
      .finally(() => setLoading(false));

    // Load Razorpay script
    if (!document.querySelector('script[src*="razorpay"]')) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, [token]);

  // Auth + ownership guard
  useEffect(() => {
    if (sessionLoading || loading || error) return;
    if (!session?.user) {
      router.replace(`/login?redirect=/pay/${token}`);
      return;
    }
    if (info && (session.user as any).id !== info.bookingUserId) {
      router.replace("/");
    }
  }, [sessionLoading, session, loading, info, error, token, router]);

  const handlePay = async () => {
    if (!info) return;
    setPaying(true);
    setPayError(null);

    try {
      // Create order
      const orderRes = await fetch(`/api/pay/${token}/order`, { method: "POST" });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setPayError(orderData.message ?? "Failed to create payment order");
        setPaying(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderData.data;

      // Open Razorpay
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "Mohan Cabs",
        description: `Booking #${info.bookingRef}`,
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch(`/api/pay/${token}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId:   response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPaid(true);
          } else {
            setPayError("Payment verification failed. Please contact support.");
          }
          setPaying(false);
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        prefill: {
          name: info.customerName,
        },
        theme: { color: "#6366f1" },
      });

      rzp.open();
    } catch {
      setPayError("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center bg-[var(--color-background)]">
        <div className="w-16 h-16 rounded-3xl bg-[var(--color-danger)]/10 flex items-center justify-center text-3xl">⚠</div>
        <p className="text-lg font-bold text-[var(--color-text-primary)]">Unable to load payment</p>
        <p className="text-sm text-[var(--color-text-tertiary)]">{error ?? "This payment link is invalid or has already been used."}</p>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-[var(--color-background)]">
        <div className="w-20 h-20 rounded-3xl bg-[var(--color-success)]/10 flex items-center justify-center text-4xl">✓</div>
        <div>
          <p className="text-xl font-black text-[var(--color-text-primary)]">Payment Successful!</p>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-2">
            Thank you, {info.customerName.split(" ")[0]}. Your payment of ₹{parseFloat(info.amountDue).toLocaleString("en-IN")} has been received.
          </p>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">Booking #{info.bookingRef}</p>
      </div>
    );
  }

  const amountDue = parseFloat(info.amountDue);
  const totalFare = parseFloat(info.totalFare);
  const totalPaid = parseFloat(info.totalPaid);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] px-5 pt-12 pb-8">
        <p className="text-white/70 text-xs font-medium mb-1">Mohan Cabs — Payment</p>
        <p className="text-white font-bold text-xl">#{info.bookingRef}</p>
        <p className="text-white/80 text-sm mt-1">{formatDate(info.journeyDate)} at {formatTime(info.journeyTime)}</p>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-4 pb-28">

        {/* Trip summary */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-stretch gap-3 mb-3">
            <div className="flex flex-col items-center py-0.5 shrink-0">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-0.5" />
              <div className="flex-1 w-px bg-[var(--color-border)] my-1" />
              <div className="w-2 h-2 rounded-full bg-[var(--color-danger)] mb-0.5" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Pick Up</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{info.pickupName}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Drop Off</p>
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{info.dropName}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] pt-3 flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-tertiary)]">Customer</p>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">{info.customerName}</p>
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
          <p className="text-sm font-bold text-[var(--color-text-primary)]">Payment Summary</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Total Fare</span>
              <span className="font-semibold text-[var(--color-text-primary)]">₹{totalFare.toLocaleString("en-IN")}</span>
            </div>
            {totalPaid > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Already Paid</span>
                <span className="font-semibold text-[var(--color-success)]">- ₹{totalPaid.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="border-t border-[var(--color-border)] pt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--color-text-primary)]">Amount Due</span>
              <span className="text-2xl font-black text-[var(--color-primary)]">₹{amountDue.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {payError && (
          <p className="text-sm text-[var(--color-danger)] font-medium text-center">{payError}</p>
        )}
      </div>

      {/* Sticky pay button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-background)] border-t border-[var(--color-border)]">
        <button
          onClick={handlePay}
          disabled={paying}
          className={`w-full max-w-md mx-auto flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all ${
            !paying
              ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 active:scale-[0.98]"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-tertiary)] cursor-not-allowed"
          }`}
        >
          {paying ? (
            <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Processing…</>
          ) : (
            <>💳 Pay ₹{amountDue.toLocaleString("en-IN")}</>
          )}
        </button>
      </div>
    </div>
  );
}
