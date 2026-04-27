import Link from "next/link";
import { User } from "@/types/user";
import { dateParser } from "@/utils/date-parser";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<User>();

export const usersColumns: ColumnDef<User, any>[] = [
  columnHelper.accessor("name", {
    header: "User Name",
    cell: (id) => {
      const userName = id.getValue();
      const userId = id.row.original.id;
      return (
        <Link
          href={`/admin/users/${userId}`}
          className="text-accent font-bold hover:underline cursor-pointer underline-offset-2"
        >
          {userName}
        </Link>
      );
    },
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("phoneNumber", {
    header: "Phone",
  }),
  columnHelper.accessor("createdAt", {
    header: "Joined",
    cell: ({ getValue }) => dateParser({ getValue }),
  }),
  columnHelper.accessor("status", {
    header: "Status",
  }),
];
