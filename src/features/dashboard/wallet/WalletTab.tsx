"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import { useWalletBalance, useTransactions, usePaymentMethods } from "@/hooks/useWallet";
import { ROUTES } from "@/constants/routes";
import { IconPlus, IconCreditCard, IconCar, IconLoader, IconChevronRight } from "@/constants/icons";

function AddMoneyModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const QUICK = [100, 250, 500, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-black text-[var(--color-text-primary)]">Add Money to Wallet</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">✕</button>
        </div>
        <div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mb-2">Enter amount</p>
          <div className="flex items-center gap-2 border border-[var(--color-border-strong)] rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
            <span className="text-[18px] font-black text-[var(--color-text-tertiary)]">₹</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="flex-1 text-[22px] font-black text-[var(--color-text-primary)] focus:outline-none bg-transparent" />
          </div>
        </div>
        <div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mb-2">Quick add</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK.map((a) => (
              <button key={a} onClick={() => setAmount(String(a))} className={`py-2 rounded-xl text-[12px] font-bold border transition-colors ${amount === String(a) ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}>
                +₹{a}
              </button>
            ))}
          </div>
        </div>
        <Button disabled={!amount || Number(amount) <= 0} onPress={onClose} className="w-full bg-[var(--color-primary)] text-white font-bold rounded-xl py-3">
          Proceed to Pay
        </Button>
      </div>
    </div>
  );
}

export function WalletTab() {
  const [addOpen, setAddOpen] = useState(false);
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: methods = [], isLoading: methodsLoading } = usePaymentMethods();

  if (balanceLoading || txLoading || methodsLoading) {
    return <div className="flex items-center justify-center py-24"><IconLoader size={28} className="animate-spin text-[var(--color-primary)]" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="bg-[var(--color-primary)] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-full bg-white/10 rounded-bl-[50px]" />
        <div className="relative z-10">
          <p className="text-blue-100 text-[13px] font-medium">Wallet Balance</p>
          <p className="text-white text-[42px] font-black tracking-tight leading-tight">₹{balance?.amount ?? 0}</p>
          <p className="text-blue-100 text-[12px] mt-1">Last topped up: {balance?.lastTopUp}</p>
          <Button onPress={() => setAddOpen(true)} className="mt-4 bg-white text-[var(--color-primary)] font-bold rounded-full px-5 py-2.5">
            <IconPlus size={14} className="mr-1.5" /> Add Money
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payment methods */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-black text-[var(--color-text-primary)]">Payment Methods</p>
            <Button className="text-[var(--color-primary)] text-[12px] font-semibold">
              <IconPlus size={12} className="mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-3">
            {methods.map(({ id, label, sub, primary }) => (
              <div key={id} className="flex items-center gap-3 p-3 bg-[var(--color-surface-muted)] rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] shadow-sm flex items-center justify-center">
                  <IconCreditCard size={16} className="text-[var(--color-text-secondary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{label}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{sub}</p>
                </div>
                {primary
                  ? <Chip color="accent" variant="soft" size="sm" className="text-[10px] font-bold">Default</Chip>
                  : <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />}
              </div>
            ))}
            <button className="w-full mt-2 py-2.5 border-2 border-dashed border-[var(--color-border-strong)] rounded-xl text-[13px] font-semibold text-[var(--color-text-tertiary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
              + Add Payment Method
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <p className="text-[14px] font-black text-[var(--color-text-primary)] mb-4">Recent Transactions</p>
          <div className="space-y-2">
            {transactions.map(({ id, type, label, amount, date }) => (
              <Link
                key={id}
                href={ROUTES.dashboard.transaction(id)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${type === "credit" ? "bg-[var(--color-success-light)]" : "bg-[var(--color-surface-muted)]"}`}>
                  {type === "credit"
                    ? <IconPlus size={15} className="text-[var(--color-success)]" />
                    : <IconCar size={15} className="text-[var(--color-text-tertiary)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{label}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{date}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <p className={`text-[13px] font-black ${type === "credit" ? "text-[var(--color-success)]" : "text-[var(--color-text-primary)]"}`}>
                    {amount > 0 ? (type === "credit" ? `+₹${amount}` : `-₹${amount}`) : "—"}
                  </p>
                  <IconChevronRight size={12} className="text-[var(--color-text-tertiary)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {addOpen && <AddMoneyModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
