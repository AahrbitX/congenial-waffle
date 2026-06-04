"use client";

import React, { useState } from "react";
import { usersColumns } from "./columns";
import { Upload } from "lucide-react";
import { DataTable } from "@/components/dataTable/dynamic";
import { Button, SearchField, Surface } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { PaginatedResponse } from "@/types/responseTypes";
import { User } from "@/types/user";
import { request } from "@/lib/api-client";

function AdminUsersPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");

  const { data: usersData, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ["users", page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      return request(`/api/users?${params.toString()}`, { method: "GET" });
    },
  });

  return (
    <Surface className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button variant="secondary" size="sm">
          <Upload /> Export
        </Button>
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
              <SearchField.Input placeholder="Search by name or phone" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>

        {search && (
          <Button variant="secondary" onPress={() => { setSearch(""); setPage(1); }}>
            Reset Filter
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <DataTable<User>
          isLoading={isLoading}
          data={usersData?.data ?? []}
          columns={usersColumns}
          onPageChange={(p) => setPage(p)}
          pagination={usersData?.pagination}
        />
      </div>
    </Surface>
  );
}

export default AdminUsersPage;
