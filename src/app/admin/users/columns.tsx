import Link from "next/link";
import { User } from "@/types/user";
import { tableDateParser } from "@/utils/tableDateParser";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Chip } from "@heroui/react";

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
    cell: ({ getValue }) => tableDateParser({ getValue }),
  }),
  columnHelper.accessor("dob", {
    header: "Date of Birth",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (row) => {
      const banned = row.row.original.banned;
      const isActive = banned === false;
      return (
        <Chip size="sm" variant="soft" color={isActive ? "success" : "danger"}>
          {isActive ? "Active" : "Suspended"}
        </Chip>
      );
    },
  }),
];
