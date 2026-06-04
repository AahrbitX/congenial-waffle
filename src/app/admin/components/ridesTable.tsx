"use client";

import { useState } from "react";
import { Card, SearchField } from "@heroui/react";
import { motion } from "framer-motion";

import { ridesColumns } from "./columns";
import { DataTable } from "@/components/dataTable/dynamic";
import { useDashboardRides } from "@/hooks/dashboard";
import { ResponsiveCard } from "@/components/ui/ResponsiveCard";

type StatusFilter = "" | "ongoing" | "pending" | "confirmed" | "completed" | "cancelled";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "",           label: "All"       },
  { key: "ongoing",   label: "Ongoing"   },
  { key: "pending",   label: "Pending"   },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const RidesTable = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useDashboardRides({
    search: search || undefined,
    status: status || undefined,
    page,
    pageSize: 20,
  });

  return (
    <ResponsiveCard>
      <Card.Header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Card.Title className="shrink-0 text-base font-semibold">
          Today&apos;s Rides
        </Card.Title>

      </Card.Header>

      {/* Search + pill tabs */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
        <SearchField
          name="search"
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          className="w-full md:w-64"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search rides..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        {/* Framer Motion sliding pill tabs */}
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full p-1 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(({ key, label }) => {
            const isActive = status === key;
            return (
              <button
                key={key || "all"}
                onClick={() => { setStatus(key); setPage(1); }}
                className="relative px-4 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap"
              >
                {isActive && (
                  <motion.span
                    layoutId="dashboard-rides-pill"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-full shadow-sm"
                    transition={{ type: "tween", duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-150 ${
                  isActive ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-800"
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <DataTable<any>
        isLoading={isLoading}
        columns={ridesColumns}
        data={data?.rides ?? []}
        pagination={data?.pagination}
        onPageChange={(p) => setPage(p)}
      />
    </ResponsiveCard>
  );
};
