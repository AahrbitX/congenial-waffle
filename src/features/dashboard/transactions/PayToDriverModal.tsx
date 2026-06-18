"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  useCreateBalancePayment,
  useNotifyDriver,
  useMarkCashPending,
  useMyTransaction,
} from "@/hooks/useTransactions";
import {
  IconCar,
  IconCheckCircle,
  IconX,
  IconLoader,
  IconShare,
} from "@/constants/icons";
import type { UserTransaction } from "@/types/transactions.types";

interface PayToDriverModalProps {
  tx: UserTransaction;
  amountDue?: number;
  isBalance?: boolean;
  onClose: () => void;
}

export function PayToDriverModal({ tx, amountDue, isBalance, onClose }: PayToDriverModalProps) {
  const amount = amountDue ?? parseFloat(tx.amount);

  const [activePaymentId, setActivePaymentId] = useState<string | null>(
    isBalance ? null : tx.id,
  );

  const [notified, setNotified]             = useState(false);
  const [driverAssigned, setDriverAssigned] = useState(true);
  const [cashCode, setCashCode]             = useState<string | null>(null);
  const [resendSent, setResendSent]         = useState(false);
  const [cashMarked, setCashMarked]         = useState(
    !isBalance && tx.status === "cash_pending",
  );
  const [success, setSuccess]               = useState(false);
  const [errorMsg, setErrorMsg]             = useState("");

  const createBalance = useCreateBalancePayment();
  const notify        = useNotifyDriver();
  const markCash      = useMarkCashPending();

  // Poll payment status every 5 s once notified; stop once success
  const { data: polledTx } = useMyTransaction(
    activePaymentId ?? "",
    notified && !success ? 5000 : undefined,
  );

  // Auto-show success when driver confirms on their page
  useEffect(() => {
    if (polledTx?.status === "cash_collected") {
      setSuccess(true);
    }
  }, [polledTx?.status]);

  // Step 1: On mount, resolve the payment ID (create balance record if needed),
  // mark as cash_pending, then send the customer their OTP via WhatsApp.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        let paymentId = activePaymentId;

        if (isBalance) {
          const res = await createBalance.mutateAsync(tx.id);
          if (cancelled) return;
          paymentId = res.paymentId;
          setActivePaymentId(paymentId);
          setCashMarked(true);
        }

        if (!cashMarked) {
          await markCash.mutateAsync(paymentId!);
          if (cancelled) return;
          setCashMarked(true);
        }

        const { driverAssigned: assigned, cashCode: code } = await notify.mutateAsync(paymentId!);
        if (cancelled) return;
        setDriverAssigned(assigned);
        setNotified(assigned);
        if (code) setCashCode(code);
      } catch (err: any) {
        if (cancelled) return;
        setErrorMsg(err?.message ?? "Could not contact server. Please try again.");
      }
    }

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile]);

  async function handleResend() {
    if (!activePaymentId) return;
    setErrorMsg("");
    try {
      const { cashCode: code } = await notify.mutateAsync(activePaymentId);
      if (code) setCashCode(code);
      setResendSent(true);
      setTimeout(() => setResendSent(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to resend. Try again.");
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex ${isMobile ? "items-end" : "items-center justify-center p-4 bg-black/40 backdrop-blur-sm"}`}
      onClick={isMobile ? onClose : undefined}
    >
      <motion.div
        initial={isMobile ? { y: "100%" } : false}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={isMobile ? (e) => e.stopPropagation() : undefined}
        className={isMobile
          ? "w-full rounded-t-3xl bg-[var(--color-surface)] shadow-2xl max-h-[88svh] overflow-y-auto px-5 pb-6 space-y-5"
          : "bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5"
        }
      >
        {/* Drag handle — mobile only */}
        {isMobile && (
          <div className="flex justify-center pt-4 pb-2">
            <div className="h-1 w-12 rounded-full bg-gray-300" />
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold">Pay to Driver</p>
          {!isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-light">
              <IconCheckCircle size={32} className="text-success" />
            </div>
            <p className="text-base font-bold text-text-primary">Payment Confirmed!</p>
            <p className="text-sm text-text-secondary">
              Driver has confirmed cash collection. Admin will verify shortly.
            </p>
            <Button onPress={onClose} className="w-full mt-2">Done</Button>
          </div>
        ) : (
          <>
            {/* Booking info */}
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <IconCar size={14} />
                <span className="font-medium text-text-primary truncate">
                  {tx.pickupName} → {tx.dropName}
                </span>
              </div>
              <p className="text-xs text-text-tertiary">{tx.bookingRef}</p>
              <p className="text-lg font-bold text-text-primary">
                ₹{amount.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Loading state */}
            {(createBalance.isPending || notify.isPending || markCash.isPending) && (
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary py-1">
                <IconLoader size={14} className="animate-spin" />
                {createBalance.isPending ? "Preparing payment…" : "Sending OTP…"}
              </div>
            )}

            {/* No driver assigned */}
            {!notify.isPending && !driverAssigned && (
              <div className="rounded-xl bg-surface-muted border border-border px-4 py-3 text-sm text-text-secondary text-center">
                No driver assigned to this booking yet. The Pay to Driver option will be available once a driver is assigned.
              </div>
            )}

            {/* OTP display */}
            {notified && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-text-primary">Payment OTP</p>
                  <button
                    onClick={handleResend}
                    disabled={notify.isPending}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                  >
                    {notify.isPending
                      ? <IconLoader size={12} className="animate-spin" />
                      : <IconShare size={12} />}
                    {resendSent ? "Sent!" : "Resend"}
                  </button>
                </div>
                <div className="flex justify-center gap-2">
                  {(cashCode ?? "------").split("").map((d, i) => (
                    <div key={i} className="w-10 h-12 rounded-xl bg-[var(--color-surface)] border-2 border-primary/40 flex items-center justify-center text-2xl font-black text-primary shadow-sm">
                      {cashCode ? d : <span className="text-text-tertiary text-lg">·</span>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-secondary text-center">
                  Read this code to your driver — they&apos;ll enter it to confirm ₹{amount.toLocaleString("en-IN")} cash collection.
                </p>
              </div>
            )}

            {/* Polling indicator */}
            {notified && (
              <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary">
                <IconLoader size={12} className="animate-spin" />
                Waiting for driver to confirm…
              </div>
            )}

            {errorMsg && (
              <p className="text-sm text-danger font-medium text-center">{errorMsg}</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
