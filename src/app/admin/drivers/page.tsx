"use client";

import React, { useState } from "react";
import AddDriver from "./addDriver";
import { driverColumns } from "./columns";

import { Driver } from "@/types/driver";
import { request } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/dataTable/dynamic";
import { Upload } from "lucide-react";
import { PaginatedResponse } from "@/types/responseTypes";
import { Button, ListBox, SearchField, Select, Surface } from "@heroui/react";

function AdminDriversPage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [available, setAvailable] = useState("");
  const limit = 10;

  const hasFilters = !!(search || available);

  const resetFilters = () => {
    setSearch("");
    setAvailable("");
    setPage(1);
  };

  const { data: driversData, isLoading } = useQuery<PaginatedResponse<Driver>>({
    queryKey: ["drivers", page, search, available],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search)    params.set("search", search);
      if (available) params.set("isAvailable", available);
      return request(`/api/drivers?${params.toString()}`, { method: "GET" });
    },
  });

  return (
    <Surface className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-xl font-bold">Drivers</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Upload /> Export
          </Button>
          <AddDriver />
        </div>
      </div>

      <div className="w-full mb-4 flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchField
            name="search"
            variant="secondary"
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search by name or vehicle number" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <Select
            className="w-44"
            placeholder="All Availability"
            variant="secondary"
            selectedKey={available}
            onSelectionChange={(key) => { setAvailable(key as string ?? ""); setPage(1); }}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="" textValue="All">All<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="true" textValue="Available">Available<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="false" textValue="Unavailable">Unavailable<ListBox.ItemIndicator /></ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="secondary" onPress={resetFilters}>Reset Filter</Button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <DataTable<Driver>
          isLoading={isLoading}
          onPageChange={(p) => setPage(p)}
          pagination={driversData?.pagination}
          columns={driverColumns}
          data={driversData?.data ?? []}
        />
      </div>
    </Surface>
  );
}

export default AdminDriversPage;
