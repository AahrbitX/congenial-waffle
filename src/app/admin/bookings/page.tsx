"use client";

import { useState } from "react";
import { Booking } from "@/types/bookings";
import { bookingColumns } from "./columns";
import { DataTable } from "@/components/dataTable/dynamic";
import {
  Button,
  DateField,
  DateRangePicker,
  RangeCalendar,
  SearchField,
  Surface,
} from "@heroui/react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import AddBookings from "./addBookings";
import { useQuery } from "@tanstack/react-query";
import { PaginatedResponse } from "@/types/responseTypes";
import { request } from "@/lib/api-client";
import type { DateValue } from "@heroui/react";

type DateRange = { start: DateValue; end: DateValue } | null;

type StatusFilter = "" | "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "",           label: "All"       },
  { key: "ongoing",   label: "Ongoing"   },
  { key: "pending",   label: "Pending"   },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BookingsPage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState<StatusFilter>("");
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const limit = 10;

  const hasFilters = !!(search || dateRange);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setDateRange(null);
    setPage(1);
  };

  const handleFilterChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const { data: bookingData, isLoading } = useQuery<PaginatedResponse<Booking>>({
    queryKey: ["bookings", page, search, status, dateRange?.start?.toString(), dateRange?.end?.toString()],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search)           params.set("search", search);
      if (status)           params.set("status", status);
      if (dateRange?.start) params.set("dateFrom", dateRange.start.toString());
      if (dateRange?.end)   params.set("dateTo", dateRange.end.toString());
      return request(`/api/bookings?${params.toString()}`, { method: "GET" });
    },
  });

  return (
    <Surface className="p-4 h-full flex flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Upload /> Export
          </Button>
          <AddBookings />
        </div>
      </div>

      {/* Search + Status tabs row */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 shrink-0">
        {/* Left: search + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <SearchField
            name="search"
            variant="secondary"
            value={search}
            onChange={handleFilterChange(setSearch)}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search rides..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <DateRangePicker value={dateRange as any} onChange={(v) => { handleFilterChange(setDateRange)(v as DateRange); }}>
            <DateField.Group variant="secondary">
              <DateField.InputContainer>
                <DateField.Input slot="start">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateRangePicker.RangeSeparator />
                <DateField.Input slot="end">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.InputContainer>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover>
              <RangeCalendar aria-label="Choose trip dates">
                <RangeCalendar.Header>
                  <RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.YearPickerTriggerHeading />
                    <RangeCalendar.YearPickerTriggerIndicator />
                  </RangeCalendar.YearPickerTrigger>
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>

          {hasFilters && (
            <Button variant="secondary" onPress={resetFilters}>Reset Filter</Button>
          )}
        </div>

        {/* Right: pill tabs */}
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full p-1">
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
                    layoutId="booking-status-pill"
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

      <div className="flex-1 min-h-0">
        <DataTable<Booking>
          isLoading={isLoading}
          onPageChange={(p) => setPage(p)}
          pagination={bookingData?.pagination}
          data={bookingData?.data ?? []}
          columns={bookingColumns}
        />
      </div>
    </Surface>
  );
}
