import Link from "next/link";
import { User } from "@/types/user";
import { Driver } from "@/types/driver";
import { dateParser } from "@/utils/date-parser";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Driver>();

export const driverColumns: ColumnDef<Driver, any>[] = [
  columnHelper.accessor("id", {
    header: "Driver Id",
  }),
  columnHelper.accessor("name", {
    header: "Driver Name",
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("phoneNumber", {
    header: "Phone",
  }),
  columnHelper.accessor("createdAt", {
    header: "Joined At",
    cell: ({ getValue }) => dateParser({ getValue }),
  }),
  columnHelper.accessor("vehicleType", {
    header: "Vehicle Type",
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link
        href={`/admin/drivers/${row.original.id}`}
        className="text-accent hover:underline underline-offset-2 font-bold"
      >
        View Details
      </Link>
    ),
  }),
];
