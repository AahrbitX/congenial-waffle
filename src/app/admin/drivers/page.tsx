"use client";

import React from "react";
import { driverColumns } from "./columns";
import { Button, SearchField, Surface } from "@heroui/react";
import { DataTable } from "@/components/dataTable";
import { RefreshCcw, Upload } from "lucide-react";
import AddDriver from "./addDriver";

function AdminDriversPage() {
  const data = [
    {
      id: "1234",
      name: "Ravi R",
      phone: "1231212487",
      ratings: 5.0,
      totalTrips: 43,
      joinedAt: "10-12-22",
      totalEarning: "67,123",
    },
  ];

  return (
    <Surface className="px-2 py-4 ">
      <div className="flex items-center justify-between my-0">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Drivers</h1>
          <Button isIconOnly variant="ghost" name="refresh">
            <RefreshCcw />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="primary">
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
        <DataTable columns={driverColumns} data={data} pageSize={5} />
      </div>
    </Surface>
  );
}

export default AdminDriversPage;
