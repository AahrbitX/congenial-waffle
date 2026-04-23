import { User } from "@/types/user";
import { createColumnHelper } from "@tanstack/react-table";
import DriverProfile from "./driverProfile";

const columnHelper = createColumnHelper<User>();

export const driverColumns = [
  columnHelper.accessor("id", {
    header: "Driver ID",
    cell: (id) => <DriverProfile id={id.getValue()} />,
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("name", {
    header: "Driver Name",
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
  }),
  columnHelper.accessor("ratings", {
    header: "Ratings",
  }),
  columnHelper.accessor("totalTrips", {
    header: "Total Trips",
  }),
  columnHelper.accessor("joinedAt", {
    header: "Joined At",
  }),
  columnHelper.accessor("totalEarning", {
    header: "Total Earning",
  }),
];
