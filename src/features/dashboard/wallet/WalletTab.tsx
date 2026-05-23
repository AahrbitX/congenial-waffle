"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Chip } from "@heroui/react";
import { Button } from "@/components/ui/Button";
import {
  useWalletBalance,
  useTransactions,
  usePaymentMethods,
} from "@/hooks/useWallet";
import { ROUTES } from "@/constants/routes";
import {
  IconPlus,
  IconCreditCard,
  IconCar,
  IconLoader,
  IconChevronRight,
} from "@/constants/icons";

function AddMoneyModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const QUICK = [100, 250, 500, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold">Add Money to Wallet</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
          >
            ✕
          </button>
        </div>
        <div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mb-2">
            Enter amount
          </p>
          <div className="flex items-center gap-2 border border-[var(--color-border-strong)] rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
            <span className="text-[18px] font-black text-[var(--color-text-tertiary)]">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 text-[22px] font-black text-primary focus:outline-none bg-transparent"
            />
          </div>
        </div>
        <div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mb-2">
            Quick add
          </p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`py-2 rounded-xl text-[12px] font-bold border transition-colors ${amount === String(a) ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}
              >
                +₹{a}
              </button>
            ))}
          </div>
        </div>
        <Button
          disabled={!amount || Number(amount) <= 0}
          onPress={onClose}
          className="w-full bg-[var(--color-primary)] text-white font-bold rounded-xl py-3"
        >
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
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader
          size={28}
          className="animate-spin text-[var(--color-primary)]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <Card className="bg-accent relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-full bg-white/10 rounded-bl-[50px]" />
        <div className="relative z-10">
          <p className="text-blue-100 text-lg">Wallet Balance</p>
          <p className="text-white text-5xl font-bold">
            ₹{balance?.amount ?? 0}
          </p>
          <p className="text-blue-100 text-sm mt-1">
            Last topped up: {balance?.lastTopUp}
          </p>
          <Button
            onPress={() => setAddOpen(true)}
            className="mt-4 bg-white text-accent"
          >
            <IconPlus size={14} /> Add Money
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Payment Methods */}
        <Card className="">
          <Card.Header className="flex flex-row items-center justify-between ">
            <div>
              <Card.Title className="text-base font-semibold">
                Payment Methods
              </Card.Title>

              <p className="text-xs text-muted">
                Saved cards and payment options
              </p>
            </div>

            <Button size="sm" className="rounded-xl">
              <IconPlus size={14} />
              Add
            </Button>
          </Card.Header>

          <Card.Content className="flex flex-col gap-3">
            {methods.map(({ id, label, sub, primary }) => (
              <div
                key={id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface-muted p-4 transition-colors hover:border-primary"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                  <IconCreditCard size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {label}
                  </p>

                  <p className="truncate text-xs text-text-secondary">{sub}</p>
                </div>

                {primary ? (
                  <Chip
                    color="accent"
                    variant="soft"
                    size="sm"
                    className="rounded-full px-2 text-[10px] font-semibold"
                  >
                    Default
                  </Chip>
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-success" />
                )}
              </div>
            ))}

            <Button variant="secondary" fullWidth>
              <IconPlus size={14} />
              Add Payment Method
            </Button>
          </Card.Content>
        </Card>

        {/* Transactions */}
        <Card>
          <Card.Header className="flex flex-row items-center justify-between">
            <div>
              <Card.Title className="text-base font-semibold">
                Recent Transactions
              </Card.Title>

              <p className="text-xs text-muted">
                Latest wallet activities and ride payments
              </p>
            </div>
          </Card.Header>

          <Card.Content className="flex flex-col gap-3">
            {transactions.map(({ id, type, label, amount, date }) => (
              <Link
                key={id}
                href={ROUTES.dashboard.transaction(id)}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface-muted p-4 transition-all hover:border-primary hover:bg-surface"
              >
                <div
                  className={`flex size-4 shrink-0 items-center justify-center rounded-2xl ${
                    type === "credit"
                      ? "bg-success-light text-success"
                      : "bg-surface text-text-secondary"
                  }`}
                >
                  {type === "credit" ? (
                    <IconPlus size={18} />
                  ) : (
                    <IconCar size={18} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {label}
                  </p>

                  <p className="text-xs text-text-secondary">{date}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        type === "credit" ? "text-success" : "text-text-primary"
                      }`}
                    >
                      {amount > 0
                        ? type === "credit"
                          ? `+₹${amount}`
                          : `-₹${amount}`
                        : "—"}
                    </p>

                    <p className="text-xs text-text-tertiary">
                      {type === "credit" ? "Wallet Topup" : "Ride Payment"}
                    </p>
                  </div>

                  <IconChevronRight size={14} className="text-text-tertiary" />
                </div>
              </Link>
            ))}
          </Card.Content>
        </Card>
      </div>

      {addOpen && <AddMoneyModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
