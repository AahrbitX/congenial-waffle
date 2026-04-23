"use client";

import { useMemo, useState } from "react";
import type { SortDescriptor } from "@heroui/react";
import {
  cn,
  Table,
  Pagination,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableContent,
  TableFooter,
  PaginationSummary,
  EmptyState,
} from "@heroui/react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Box, ChevronUp } from "lucide-react";

interface DataTableProps<TData> {
  data: TData[];
  pageSize?: number;
  ariaLabel?: string;
  showPagination?: boolean;
  columns: ColumnDef<TData, any>[];
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    isRowHeader?: boolean;
  }
}

// --- Internal Helpers ---
function toSortDescriptor(sorting: SortingState): SortDescriptor | undefined {
  const first = sorting[0];
  if (!first) return undefined;
  return {
    column: first.id,
    direction: first.desc ? "descending" : "ascending",
  };
}

function toSortingState(descriptor: SortDescriptor): SortingState {
  return [
    {
      desc: descriptor.direction === "descending",
      id: descriptor.column as string,
    },
  ];
}

function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center justify-between w-full">
      {children}
      {!!sortDirection && (
        <ChevronUp
          className={cn(
            "size-3 transform transition-transform duration-100 ease-out",
            sortDirection === "descending" ? "rotate-180" : "",
          )}
        />
      )}
    </span>
  );
}

export function DataTable<TData>({
  columns,
  data,
  pageSize = 15,
  showPagination = true,
  ariaLabel = "Data Table",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize } },
    onSortingChange: setSorting,
    state: { sorting },
  });

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, data.length);

  return (
    <div className="flex flex-col gap-4">
      <Table aria-label={ariaLabel}>
        <TableContent>
          <TableHeader>
            {table.getHeaderGroups()[0]!.headers.map((header) => (
              <TableColumn
                id={header.id}
                key={header.id}
                allowsSorting={header.column.getCanSort()}
                isRowHeader={header.column.columnDef.meta?.isRowHeader}
              >
                {({ sortDirection }) => (
                  <SortableColumnHeader
                    sortDirection={sortDirection as "ascending" | "descending"}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </SortableColumnHeader>
                )}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody
            renderEmptyState={() => (
              <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center my-8">
                <Box className="size-6 text-muted" />
                <span className="text-sm text-muted">No Data found</span>
              </EmptyState>
            )}
          >
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.columnDef.size }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TableContent>
        <TableFooter>
          {showPagination && (
            <Pagination>
              <PaginationSummary>
                Showing {start} to {end} of {data.length} results
              </PaginationSummary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous>
                    <Pagination.PreviousIcon />
                    <span>Previous</span>
                  </Pagination.Previous>
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Link isActive>1</Pagination.Link>
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Ellipsis />
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Link>10</Pagination.Link>
                </Pagination.Item>
                <Pagination.Item>
                  <Pagination.Next>
                    <span>Next</span>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          )}
        </TableFooter>
      </Table>
    </div>
  );
}
