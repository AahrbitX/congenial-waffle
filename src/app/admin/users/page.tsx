"use client";

import React from "react";
import { usersColumns } from "./columns";
import { RefreshCcw, Upload } from "lucide-react";
import { DataTable } from "@/components/dataTable/dynamic";
import { Button, SearchField, Surface } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { PaginatedResponse } from "@/types/responseTypes";
import { User } from "@/types/user";
import { request } from "@/lib/api-client";

function AdminUsersPage() {
  const [page, setPage] = React.useState(1);

  const { data: usersData, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ["users"],
    queryFn: async () => {
      return request(`/api/users?page=${page}`, {
        method: "GET",
      });
    },
  });

  const tableData = usersData ? usersData?.data : [];

  return (
    <Surface className="p-4">
      <div className="flex items-center justify-between my-0">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button isIconOnly variant="ghost" name="refresh">
            <RefreshCcw />
          </Button>
        </div>
        <Button variant="secondary">
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
        <DataTable<User>
          isLoading={isLoading}
          data={tableData}
          columns={usersColumns}
          onPageChange={setPage}
          pagination={usersData?.pagination}
        />
      </div>
    </Surface>
  );
}

export default AdminUsersPage;
