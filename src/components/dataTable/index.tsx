"use client";

import { useState } from "react";
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
  Skeleton,
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
import { PaginationData } from "@/types/responseTypes";

export interface DataTableProps<TData> {
  data?: TData[];
  isLoading: boolean;
  ariaLabel?: string;
  pagination?: PaginationData;
  columns: ColumnDef<TData, any>[];
  onPageChange?: (page: number) => void;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    isRowHeader?: boolean;
  }
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

/** Build the list of page numbers to show (first, window around current, last) with -1 as ellipsis. */
function buildPageWindows(current: number, total: number): (number | -1)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | -1)[] = [1];
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  if (lo > 2) pages.push(-1);
  for (let p = lo; p <= hi; p++) pages.push(p);
  if (hi < total - 1) pages.push(-1);
  pages.push(total);
  return pages;
}

function DataTable<TData>({
  columns,
  data = [],
  isLoading,
  pagination,
  onPageChange,
  ariaLabel = "Data Table",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    page = 1,
    pageSize = 10,
    totalCount = 0,
    totalPages = 1,
  } = pagination || {};

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

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, rowIndex) => (
      <TableRow key={`skeleton-row-${rowIndex}`}>
        {columns.map((_, colIndex) => (
          <TableCell key={`skeleton-col-${colIndex}`}>
            <Skeleton className="h-4 w-full rounded-lg" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const showPagination =
    !!pagination?.totalCount && pagination.totalCount > pageSize;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Scrollable body — header stays sticky inside */}
      <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-hide min-h-0">
        <Table aria-label={ariaLabel}>
          <TableContent>
            <TableHeader className="sticky top-0 z-10">
              {table.getHeaderGroups()[0]!.headers.map((header) => (
                <TableColumn
                  id={header.id}
                  key={header.id}
                  allowsSorting={header.column.getCanSort()}
                  isRowHeader={header.column.columnDef.meta?.isRowHeader}
                >
                  {({ sortDirection }) => (
                    <SortableColumnHeader
                      sortDirection={
                        sortDirection as "ascending" | "descending"
                      }
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
              {isLoading
                ? renderLoadingRows()
                : table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.columnDef.size }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </TableContent>
          {showPagination && (
            <TableFooter>
              <Pagination>
                <PaginationSummary>
                  Showing {start} to {end} of {totalCount} results
                </PaginationSummary>
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous
                      isDisabled={page <= 1}
                      onPress={() => onPageChange?.(page - 1)}
                    >
                      <Pagination.PreviousIcon />
                      <span>Previous</span>
                    </Pagination.Previous>
                  </Pagination.Item>

                  {buildPageWindows(page, totalPages).map((p, i) =>
                    p === -1 ? (
                      <Pagination.Item key={`ellipsis-${i}`}>
                        <Pagination.Ellipsis />
                      </Pagination.Item>
                    ) : (
                      <Pagination.Item key={p}>
                        <Pagination.Link
                          isActive={p === page}
                          onPress={() => onPageChange?.(p)}
                        >
                          {p}
                        </Pagination.Link>
                      </Pagination.Item>
                    ),
                  )}

                  <Pagination.Item>
                    <Pagination.Next
                      isDisabled={page >= totalPages}
                      onPress={() => onPageChange?.(page + 1)}
                    >
                      <span>Next</span>
                      <Pagination.NextIcon />
                    </Pagination.Next>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Fixed pagination footer */}
    </div>
  );
}

export { DataTable };
