import Link from "next/link";
import { User } from "@/types/user";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<User>();

export const usersColumns = [
  columnHelper.accessor("userId", {
    header: "User ID",
    cell: (id) => {
      const userId = id.getValue();
      return (
        <Link
          href={`/admin/users/${userId}`}
          className="text-accent font-bold hover:underline cursor-pointer underline-offset-2"
        >
          {userId}
        </Link>
      );
    },
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("userName", {
    header: "User Name",
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
  }),
  columnHelper.accessor("totalTrips", {
    header: "Total Trips",
  }),
  columnHelper.accessor("joinedAt", {
    header: "Joined At",
  }),
  columnHelper.accessor("status", {
    header: "Status",
  }),
];
