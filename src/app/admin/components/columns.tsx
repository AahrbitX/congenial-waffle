import Link from "next/link";
import { tableDateParser } from "@/utils/tableDateParser";
import { RouteCell } from "@/components/dataTable/routeCell";
import StatusIndicator from "@/components/data/statusIndicator";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

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

      return <RouteCell from={route.pickup} to={route.drop} />;
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (cell) => <StatusIndicator status={cell.getValue()} />,
  }),
  columnHelper.accessor("time", {
    header: "Time",
    cell: ({ getValue }) => tableDateParser({ getValue }),
  }),
  columnHelper.accessor("fare", {
    header: "Fare",
    meta: { isRowHeader: true },
  }),
];
