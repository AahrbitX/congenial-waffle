import Link from "next/link";
import { Driver } from "@/types/driver";
import { tableDateParser } from "@/utils/tableDateParser";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Chip } from "@heroui/react";

const columnHelper = createColumnHelper<Driver>();

export const driverColumns: ColumnDef<Driver, any>[] = [
  columnHelper.accessor("id", {
    header: "Driver Id",
    cell: (id) => {
      const userName = id.getValue();
      const userId = id.row.original.id;
      return (
        <Link
          href={`/admin/drivers/${userId}`}
          className="text-accent font-bold hover:underline cursor-pointer underline-offset-2"
        >
          {userName}
        </Link>
      );
    },
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("name", {
    header: "Driver Name",
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("phoneNumber", {
    header: "Phone",
  }),
  columnHelper.accessor("isAvailable", {
    header: "Availability",
    cell: ({ getValue }) => {
      return (
        <Chip
          size="sm"
          variant="soft"
          color={getValue() ? "success" : "danger"}
        >
          {getValue() ? "Available" : "Unavailable"}
        </Chip>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Joined At",
    cell: ({ getValue }) => tableDateParser({ getValue }),
  }),
  columnHelper.accessor("vehicleType", {
    header: "Vehicle Type",
  }),
  // columnHelper.display({
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <Link
  //       href={`/admin/drivers/${row.original.id}`}
  //       className="text-accent hover:underline underline-offset-2 font-bold"
  //     >
  //       View Details
  //     </Link>
  //   ),
  // }),
];
