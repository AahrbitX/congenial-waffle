"use client";

import React from "react";
import AddDriver from "./addDriver";
import { driverColumns } from "./columns";

import { Driver } from "@/types/driver";
import { request } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/dataTable/dynamic";
import { RefreshCcw, Upload } from "lucide-react";
import { PaginatedResponse } from "@/types/responseTypes";
import { Button, SearchField, Surface } from "@heroui/react";

function AdminDriversPage() {
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { data: driversData, isLoading, refetch } = useQuery<PaginatedResponse<Driver>>({
    queryKey: ["drivers"],
    queryFn: async () => {
      return request(`/api/drivers?page=${page}&limit=${limit}`, {
        method: "GET",
      });
    },
  });

  return (
    <Surface className="p-4 min-h-full">
      <div className="flex items-center justify-between my-0">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl font-bold">Drivers</h1>
          <Button isIconOnly variant="ghost" size="sm" onPress={() => refetch()}>
            <RefreshCcw size={16} />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm">
            <Upload /> Export
          </Button>
          <AddDriver />
        </div>
      </div>
      <div className="w-full my-4 flex items-center justify-between">
        <div className="flex items-center gap-2 justify-start">
          <SearchField name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search with Driver Name" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
      </div>
      <div>
        <DataTable<Driver>
          isLoading={isLoading}
          onPageChange={setPage}
          pagination={driversData?.pagination}
          columns={driverColumns}
          data={driversData?.data ?? []}
        />
      </div>
    </Surface>
  );
}

export default AdminDriversPage;
