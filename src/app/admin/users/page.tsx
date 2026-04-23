"use client";

import React from "react";
import { usersColumns } from "./columns";
import { RefreshCcw, Upload } from "lucide-react";
import { DataTable } from "@/components/dataTable";
import { Button, SearchField, Surface } from "@heroui/react";

function AdminUsersPage() {
  const data = [
    {
      userId: "123",
      userName: "Karthikeyan J",
      phone: "1234567699",
      totalTrips: "12",
      status: "active",
      joinedAt: "10-12-2002",
    },
  ];

  return (
    <Surface className="px-2 py-4 ">
      <div className="flex items-center justify-between my-0">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button isIconOnly variant="ghost" name="refresh">
            <RefreshCcw />
          </Button>
        </div>
        <Button variant="primary">
          <Upload /> Export
        </Button>
      </div>
      <div className="w-full my-4 flex items-center justify-between">
        <div className="flex items-center gap-2 justify-start">
          <SearchField name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search with User Name" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
      </div>
      <div>
        <DataTable columns={usersColumns} data={data} pageSize={5} />
      </div>
    </Surface>
  );
}

export default AdminUsersPage;
