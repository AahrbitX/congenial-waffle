"use client";

import Link from "next/link";
import { useTransaction } from "@/hooks/useWallet";
import {
  IconArrowLeft,
  IconPlus,
  IconCar,
  IconLoader,
} from "@/constants/icons";
import { ROUTES } from "@/constants/routes";

interface TransactionDetailProps {
  id: string;
}

export function TransactionDetail({ id }: TransactionDetailProps) {
  const { data: tx, isLoading } = useTransaction(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <IconLoader
          size={28}
          className="animate-spin text-[var(--color-primary)]"
        />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <IconCar size={48} className="text-[var(--color-border-strong)]" />
        <p className="text-[16px] font-bold text-[var(--color-text-secondary)]">
          Transaction not found
        </p>
        <Link
          href={ROUTES.dashboard.wallet}
          className="text-[var(--color-primary)] text-[14px] font-semibold hover:underline"
        >
          ← Back to Wallet
        </Link>
      </div>
    );
  }

  const isCredit = tx.type === "credit";

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Back nav */}
      <Link
        href={ROUTES.dashboard.wallet}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:text-primary transition-colors"
      >
        <IconArrowLeft size={14} /> Back to Wallet
      </Link>

      {/* Amount hero */}
      <div
        className={`rounded-2xl p-6 flex flex-col items-center gap-3 ${isCredit ? "bg-[var(--color-success-light)]" : "bg-[var(--color-surface-muted)]"}`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isCredit ? "bg-[var(--color-success)]" : "bg-[var(--color-surface)]"} shadow-sm`}
        >
          {isCredit ? (
            <IconPlus size={24} className="text-white" />
          ) : (
            <IconCar size={24} className="text-[var(--color-text-secondary)]" />
          )}
        </div>
        <p
          className={`text-[36px] font-black tracking-tight ${isCredit ? "text-[var(--color-success)]" : "text-primary"}`}
        >
          {isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
        </p>
        <span
          className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${isCredit ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-border-strong)] text-[var(--color-text-secondary)]"}`}
        >
          {isCredit ? "Money Added" : "Payment"}
        </span>
      </div>

      {/* Details */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-3">
        <p className="text-[12px] font-bold tracking-widest text-[var(--color-text-tertiary)] uppercase">
          Details
        </p>
        {[
          { label: "Description", value: tx.label },
          { label: "Date & Time", value: tx.date },
          { label: "Transaction ID", value: tx.id },
          { label: "Type", value: isCredit ? "Credit" : "Debit" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <p className="text-[13px] text-[var(--color-text-tertiary)] shrink-0">
              {label}
            </p>
            <p className="text-[13px] font-semibold text-primary text-right break-all">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Ride link for debit transactions */}
      {!isCredit && (
        <Link
          href={ROUTES.dashboard.rides}
          className="flex items-center justify-between w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm hover:border-[var(--color-primary)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center">
              <IconCar
                size={15}
                className="text-[var(--color-text-tertiary)]"
              />
            </div>
            <p className="text-[13px] font-semibold text-primary">
              View related ride
            </p>
          </div>
          <IconArrowLeft
            size={14}
            className="text-[var(--color-text-tertiary)] rotate-180"
          />
        </Link>
      )}
    </div>
  );
}
