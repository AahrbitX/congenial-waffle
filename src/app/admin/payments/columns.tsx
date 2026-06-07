import { Chip } from "@heroui/react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";

export type AdminPayment = {
  id: string;
  bookingId: string;
  bookingRef: string;
  rzpOrderId: string;
  rzpPaymentId: string | null;
  amount: string;
  currency: string;
  status: string;
  mode: string;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
  journeyDate: string;
  totalFare: string;
  bookingStatus: string;
  userName: string;
  userPhone: string;
};

const columnHelper = createColumnHelper<AdminPayment>();

export const STATUS_COLOR: Record<
  string,
  "default" | "success" | "warning" | "danger" | "accent"
> = {
  paid: "success",
  cash_collected: "success",
  created: "warning",
  cash_pending: "warning",
  refunded: "accent",
  failed: "danger",
};

export const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  cash_collected: "Cash Collected",
  created: "Not Paid",
  cash_pending: "Cash Pending",
  refunded: "Refunded",
  failed: "Failed",
};

export const paymentColumns: ColumnDef<AdminPayment, any>[] = [
  columnHelper.accessor("id", {
    header: "Transaction ID",
    cell: ({ getValue }) => {
      const id = getValue() as string;
      return (
        <Link
          href={`/admin/payments/${id}`}
          className="text-accent font-mono font-bold hover:underline underline-offset-2"
        >
          {id.slice(0, 8).toUpperCase()}…
        </Link>
      );
    },
    meta: { isRowHeader: true },
  }),
  columnHelper.accessor("bookingId", {
    header: "Booking",
    cell: (row) => {
      const id = row.row.original.bookingRef;
      return (
        <Link
          href={`/admin/bookings/${id}`}
          className="text-accent font-mono font-bold hover:underline underline-offset-2"
        >
          {id}
        </Link>
      );
    },
  }),
  // columnHelper.accessor("rzpPaymentId", {
  //   header: "Razorpay ID",
  //   cell: ({ getValue, row }) => {
  //     const rzpId = getValue() as string | null;
  //     const orderId = row.original.rzpOrderId;
  //     return (
  //       <div className="font-mono text-xs">
  //         {rzpId ? (
  //           <span className="text-foreground">{rzpId}</span>
  //         ) : (
  //           <span className="text-muted-foreground">{orderId}</span>
  //         )}
  //       </div>
  //     );
  //   },
  // }),
  columnHelper.accessor("userName", {
    header: "Paid By",
    cell: ({ getValue, row }) => (
      <div>
        <p className="font-medium text-sm">{getValue()}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.userPhone}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: ({ getValue, row }) => (
      <div>
        <p className="font-semibold">
          ₹{parseFloat(getValue()).toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {row.original.mode}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("paymentMethod", {
    header: "Method",
    cell: ({ getValue }) => (
      <span className="capitalize text-sm">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: ({ getValue }) =>
      new Date(getValue()).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => (
      <Chip
        size="sm"
        color={STATUS_COLOR[getValue()] ?? "default"}
        variant="soft"
      >
        {STATUS_LABEL[getValue()] ?? getValue()}
      </Chip>
    ),
    size: 30,
  }),
];
