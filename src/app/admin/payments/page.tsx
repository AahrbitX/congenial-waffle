"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  ListBox,
  SearchField,
  Select,
  Skeleton,
  Surface,
} from "@heroui/react";
import {
  BadgeIndianRupee,
  Banknote,
  Clock,
  CreditCard,
} from "lucide-react";
import { request } from "@/lib/api-client";
import { DataTable } from "@/components/dataTable/dynamic";
import { AdminPayment, paymentColumns } from "./columns";
import { PaginationData } from "@/types/responseTypes";

type AdminPaymentsResponse = {
  success: boolean;
  summary: {
    totalRevenue: string;
    totalTransactions: number;
    cashPayments: number;
    pendingPayments: number;
  };
  data: AdminPayment[];
  pagination: PaginationData;
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
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("");
  const [methodFilter, setMethod]     = useState("");

  const hasFilters = !!(search || statusFilter || methodFilter);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setMethod("");
    setPage(1);
  };

  const { data, isLoading } = useQuery<AdminPaymentsResponse>({
    queryKey: ["admin-payments", page, search, statusFilter, methodFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search)       params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (methodFilter) params.set("method", methodFilter);
      return request(`/api/payments/admin?${params.toString()}`);
    },
  });

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
    <Surface className="h-full flex flex-col overflow-hidden p-4" variant="secondary">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Payments</h1>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <StatCardsSkeleton />
      ) : statCards.length > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6 shrink-0">
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchField
            name="search"
            variant="secondary"
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search by name, phone, txn ID…" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <Select
            className="w-44"
            placeholder="All Statuses"
            variant="secondary"
            selectedKey={statusFilter}
            onSelectionChange={(key) => { setStatus(key as string ?? ""); setPage(1); }}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="" textValue="All Statuses">All Statuses<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="paid" textValue="Paid">Paid<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="cash_collected" textValue="Cash Collected">Cash Collected<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="created" textValue="Not Paid">Not Paid<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="cash_pending" textValue="Cash Pending">Cash Pending<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="refunded" textValue="Refunded">Refunded<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="failed" textValue="Failed">Failed<ListBox.ItemIndicator /></ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>

          <Select
            className="w-36"
            placeholder="All Methods"
            variant="secondary"
            selectedKey={methodFilter}
            onSelectionChange={(key) => { setMethod(key as string ?? ""); setPage(1); }}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="" textValue="All Methods">All Methods<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="online" textValue="Online">Online<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="cash" textValue="Cash">Cash<ListBox.ItemIndicator /></ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="secondary" onPress={resetFilters}>Reset Filter</Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0">
        <DataTable<AdminPayment>
          isLoading={isLoading}
          data={data?.data ?? []}
          columns={paymentColumns}
          pagination={data?.pagination}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </Surface>
  );
}
