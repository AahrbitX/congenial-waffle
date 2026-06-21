import Link from "next/link";
import { Edit, RefreshCw } from "lucide-react";
import { Button, Chip } from "@heroui/react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import AssignDriver from "./assignDriver";
import { Booking } from "@/types/bookings";
import { tableDateParser } from "@/utils/tableDateParser";
import StatusIndicator from "@/components/data/statusIndicator";

const columnHelper = createColumnHelper<Booking>();


export const bookingColumns: ColumnDef<Booking, any>[] = [
  columnHelper.accessor("id", {
    header: "Booking ID",
    size: 50,
    cell: (info) => {
      const bookingId = info.getValue();
      const tripType = info.row.original.tripType;
      const legType = info.row.original.legType;
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/admin/bookings/${bookingId}`}
            className="text-accent font-bold hover:underline cursor-pointer underline-offset-2"
          >
            {bookingId}
          </Link>
          {tripType === "roundtrip" && (
            <Chip
              size="sm"
              variant="soft"
              color="accent"
              className="gap-1 px-1.5 text-xs"
            >
              <RefreshCw size={10} className="shrink-0" />
              {legType === "return" ? "Return" : "Outbound"}
            </Chip>
          )}
        </div>
      );
    },
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("rider", {
    header: "Rider",
    size: 10,
  }),
  columnHelper.accessor("source", {
    header: "Source",
    size: 15,
    cell: ({ getValue }) => {
      const source = getValue();
      if (source === "admin") return "Staff Booked";
      else return "Self Booked";
    },
  }),
  columnHelper.accessor("bookingDate", {
    header: "Booking Date",
    size: 18,
    cell: ({ getValue }) => tableDateParser({ getValue }),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    size: 10,
    cell: (cell) => <StatusIndicator status={cell.getValue()} />,
  }),
  columnHelper.accessor("driver", {
    header: "Driver",
    size: 10,
    cell: (info) => {
      const driver = info.getValue();
      const bookingId = info.row.original.id;
      const driverId = info.row.original.driverId;
      const status = info.row.original.status;
      if (!driver) {
        if (status === "confirmed")
          return <AssignDriver bookingId={bookingId} />;
        return <span className="text-xs text-muted">—</span>;
      }

      return (
        <div className="flex items-center justify-start gap-2">
          <Link
            href={`/admin/drivers/${driverId}`}
            className="text-accent font-bold hover:underline underline-offset-2"
          >
            {driver}
          </Link>
          <Button isIconOnly size="sm" variant="outline">
            <Edit size={16} />
          </Button>
        </div>
      );
    },
  }),
  columnHelper.accessor("fare", {
    size: 10,
    header: "Fare",
  }),
];
