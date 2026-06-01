"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  SearchField,
  Skeleton,
  Surface,
} from "@heroui/react";
import {
  BadgeIndianRupee,
  Banknote,
  Clock,
  CreditCard,
  RefreshCcw,
} from "lucide-react";
import { request } from "@/lib/api-client";
import { DataTable } from "@/components/dataTable/dynamic";
import { AdminPayment, paymentColumns } from "./columns";

type AdminPaymentsResponse = {
  success: boolean;
  summary: {
    totalRevenue: string;
    totalTransactions: number;
    cashPayments: number;
    pendingPayments: number;
  };
  data: AdminPayment[];
};

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <Card.Content className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, refetch } = useQuery<AdminPaymentsResponse>({
    queryKey: ["admin-payments"],
    queryFn: () => request("/api/payments/admin"),
  });

  const filtered = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((p) => {
      const matchesSearch =
        !search ||
        p.userName.toLowerCase().includes(search.toLowerCase()) ||
        p.userPhone.includes(search) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        (p.rzpPaymentId ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.bookingRef ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data?.data, search, statusFilter]);

  const summary = data?.summary;

  const statCards = summary
    ? [
        {
          label: "Total Revenue",
          value: `₹${parseFloat(summary.totalRevenue || "0").toLocaleString("en-IN")}`,
          icon: BadgeIndianRupee,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Total Transactions",
          value: summary.totalTransactions.toLocaleString("en-IN"),
          icon: CreditCard,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Cash Payments",
          value: summary.cashPayments.toLocaleString("en-IN"),
          icon: Banknote,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          label: "Pending",
          value: summary.pendingPayments.toLocaleString("en-IN"),
          icon: Clock,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
      ]
    : [];

  return (
    <Surface className="h-full overflow-y-auto p-4 scrollbar-thin" variant="secondary">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Payments</h1>
          <Button isIconOnly variant="ghost" onPress={() => refetch()}>
            <RefreshCcw size={16} />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <StatCardsSkeleton />
      ) : statCards.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <Card.Content className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} shrink-0`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchField
            name="search"
            variant="secondary"
            value={search}
            onChange={setSearch}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search by name, phone, txn ID, Razorpay ID…" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="cash_collected">Cash Collected</option>
            <option value="created">Not Paid</option>
            <option value="cash_pending">Cash Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {(search || statusFilter) && (
          <Button
            variant="secondary"
            onPress={() => { setSearch(""); setStatusFilter(""); }}
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable<AdminPayment>
        isLoading={isLoading}
        data={filtered}
        columns={paymentColumns}
      />
    </Surface>
  );
}
