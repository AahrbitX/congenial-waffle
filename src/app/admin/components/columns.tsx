import Link from "next/link";
import { dateParser } from "@/utils/date-parser";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { ArrowRightLeft } from "lucide-react";
import StatusIndicator from "@/components/data/statusIndicator";

// Trip ID
// Rider
// Driver
// Route
// Vehicle
// Fare
// Time
// Status

const columnHelper = createColumnHelper<any>();

export const ridesColumns: ColumnDef<any, any>[] = [
  columnHelper.accessor("id", {
    header: "Booking Id",
    cell: (cell) => {
      const bookingId = cell.getValue();
      return (
        <Link
          href={`/admin/bookings/${bookingId}`}
          className="text-accent font-bold hover:underline cursor-pointer underline-offset-2"
        >
          {bookingId}
        </Link>
      );
    },
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("rider", {
    header: "Rider",
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("driver", {
    header: "Driver",
    cell: (cell) => cell.getValue() ?? "Unassigned",
  }),
  columnHelper.accessor("vehicle", {
    header: "Vehicle",
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("route", {
    header: "Route",
    cell: (cell) => {
      const route = cell.getValue();

      return (
        <div className="flex items-center gap-2">
          <span>{route.pickup}</span>
          <span>
            <ArrowRightLeft size={14} color="var(--color-muted)" />
          </span>
          <span>{route.drop}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (cell) => <StatusIndicator status={cell.getValue()} />,
  }),
  columnHelper.accessor("time", {
    header: "Time",
    cell: ({ getValue }) => dateParser({ getValue }),
  }),
  columnHelper.accessor("fare", {
    header: "Fare",
    meta: { isRowHeader: true },
  }),
];
