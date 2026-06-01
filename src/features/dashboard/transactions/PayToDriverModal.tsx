"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  useCreateBalancePayment,
  useNotifyDriver,
  useMarkCashPending,
  useVerifyDriverCode,
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

  // For balance-due rows we create a new payment record and operate on its ID.
  // For regular pending rows we use tx.id directly.
  const [activePaymentId, setActivePaymentId] = useState<string | null>(
    isBalance ? null : tx.id,
  );

  const [notified, setNotified]             = useState(false);
  const [driverAssigned, setDriverAssigned] = useState(true);
  const [resendSent, setResendSent]         = useState(false);
  const [cashMarked, setCashMarked]         = useState(
    !isBalance && tx.status === "cash_pending",
  );
  const [code, setCode]                     = useState("");
  const [success, setSuccess]               = useState(false);
  const [errorMsg, setErrorMsg]             = useState("");

  const createBalance = useCreateBalancePayment();
  const notify        = useNotifyDriver();
  const markCash      = useMarkCashPending();
  const verifyCode    = useVerifyDriverCode();

  // Step 1: On mount, resolve the payment ID (create balance record if needed),
  // then send the driver their code. No status change — just the notification.
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

        const { driverAssigned: assigned } = await notify.mutateAsync(paymentId!);
        if (cancelled) return;
        setDriverAssigned(assigned);
        setNotified(assigned);
      } catch (err: any) {
        if (cancelled) return;
        setErrorMsg(err?.message ?? "Could not contact server. Please try again.");
      }
    }

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend() {
    if (!activePaymentId) return;
    setErrorMsg("");
    try {
      await notify.mutateAsync(activePaymentId);
      setResendSent(true);
      setTimeout(() => setResendSent(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to resend. Try again.");
    }
  }

  // Step 2: On submit — mark as cash_pending (once) then verify the code.
  async function handleConfirm() {
    if (!activePaymentId) return;
    setErrorMsg("");
    try {
      if (!cashMarked) {
        await markCash.mutateAsync(activePaymentId);
        setCashMarked(true);
      }
      await verifyCode.mutateAsync({ paymentId: activePaymentId, code: code.trim() });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Invalid code. Please try again.");
    }
  }

  const isSubmitting = createBalance.isPending || markCash.isPending || verifyCode.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold">Pay to Driver</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
          >
            <IconX size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-light">
              <IconCheckCircle size={32} className="text-success" />
            </div>
            <p className="text-base font-bold text-text-primary">Payment Confirmed!</p>
            <p className="text-sm text-text-secondary">
              Cash collection has been recorded. Admin will verify shortly.
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

            {/* Driver notification status */}
            {(createBalance.isPending || notify.isPending) && (
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary py-1">
                <IconLoader size={14} className="animate-spin" />
                {createBalance.isPending ? "Preparing payment…" : "Checking driver…"}
              </div>
            )}
            {!notify.isPending && !driverAssigned && (
              <div className="rounded-xl bg-surface-muted border border-border px-4 py-3 text-sm text-text-secondary text-center">
                No driver assigned to this booking yet. The Pay to Driver option will be available once a driver is assigned.
              </div>
            )}
            {notified && (
              <div className="flex items-center justify-between rounded-xl bg-warning/10 border border-warning/30 px-4 py-3">
                <p className="text-sm text-warning font-medium">Code sent to driver</p>
                <button
                  onClick={handleResend}
                  disabled={notify.isPending}
                  className="flex items-center gap-1.5 text-xs font-semibold text-warning hover:text-warning/80 transition-colors disabled:opacity-50"
                >
                  {notify.isPending
                    ? <IconLoader size={12} className="animate-spin" />
                    : <IconShare size={12} />}
                  {resendSent ? "Sent!" : "Resend"}
                </button>
              </div>
            )}

            {/* Code input */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-primary">
                Enter the code your driver shares with you
              </p>
              <p className="text-xs text-text-secondary">
                The driver received their code. Ask them for it and enter it below to confirm cash payment.
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD"
                maxLength={10}
                className="w-full text-center text-2xl font-black tracking-[0.4em] uppercase border border-[var(--color-border-strong)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] text-text-primary"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-danger font-medium text-center">{errorMsg}</p>
            )}

            <Button
              onPress={handleConfirm}
              disabled={code.trim().length === 0 || isSubmitting || !notified}
              className="w-full bg-[var(--color-primary)] text-white font-bold rounded-xl py-3"
            >
              {isSubmitting
                ? <IconLoader size={16} className="animate-spin" />
                : "Confirm Payment"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
