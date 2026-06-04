import Link from "next/link";
import { Edit } from "lucide-react";
import { Button } from "@heroui/react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import AssignDriver from "./assignDriver";
import { Booking } from "@/types/bookings";
import { tableDateParser } from "@/utils/tableDateParser";
import StatusIndicator from "@/components/data/statusIndicator";

const columnHelper = createColumnHelper<Booking>();

const statusColorMap: Record<
  string,
  "default" | "accent" | "success" | "danger" | "warning" | undefined
> = {
  pending: "warning",
  confirmed: "accent",
  completed: "success",
  cancelled: "danger",
};

export const bookingColumns: ColumnDef<Booking, any>[] = [
  columnHelper.accessor("id", {
    header: "Booking ID",
    size: 30,
    cell: (id) => {
      const bookingId = id.getValue();
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
  }),
  columnHelper.accessor("source", {
    header: "Source",
    cell: ({ getValue }) => {
      const source = getValue();
      if (source === "admin") return "Staff Booked";
      else return "Self Booked";
    },
  }),
  columnHelper.accessor("bookingDate", {
    header: "Booking Date",
    cell: ({ getValue }) => tableDateParser({ getValue }),
  }),
  columnHelper.accessor("driver", {
    header: "Driver",
    cell: (info) => {
      const driver = info.getValue();
      const bookingId = info.row.original.id;
      const driverId = info.row.original.driverId;
      const status = info.row.original.status;
      if (!driver) {
        if (status === "confirmed") return <AssignDriver bookingId={bookingId} />;
        return <span className="text-xs text-muted">—</span>;
      }

      return (
        <p className="flex items-center justify-start gap-2">
          <Link
            href={`/admin/drivers/${driverId}`}
            className="text-accent font-bold hover:underline underline-offset-2"
          >
            {driver}
          </Link>
          <Button isIconOnly size="sm" variant="outline">
            <Edit size={16} />
          </Button>
        </p>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (cell) => <StatusIndicator status={cell.getValue()} />,
  }),
  columnHelper.accessor("fare", {
    header: "Fare",
  }),
];
