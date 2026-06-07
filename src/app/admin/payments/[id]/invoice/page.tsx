"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { request } from "@/lib/api-client";
import Image from "next/image";
import { ASSETS } from "@/constants/assets";
import { Button } from "@heroui/react";

type TransactionDetail = {
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
  cashVerifiedAt: string | null;
  createdAt: string;
  journeyDate: string;
  journeyTime: string;
  totalFare: string;
  bookingStatus: string;
  vehicleType: string;
  members: number;
  userName: string;
  userPhone: string;
  pickupName: string;
  dropName: string;
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  cash_collected: "Cash Collected",
  created: "Not Paid",
  cash_pending: "Cash Pending",
  refunded: "Refunded",
  failed: "Failed",
};

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-4 text-gray-500 text-sm w-44">{label}</td>
      <td className="py-2 text-sm font-medium text-gray-800">{value ?? "—"}</td>
    </tr>
  );
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<{
    success: boolean;
    data: TransactionDetail;
  }>({
    queryKey: ["admin-payment-invoice", id],
    queryFn: () => request(`/api/payments/admin/${id}`),
    enabled: !!id,
  });

  // Auto-trigger print once data is loaded
  // useEffect(() => {
  //   if (data?.data) {
  //     setTimeout(() => window.print(), 400);
  //   }
  // }, [data?.data]);

  if (isLoading || !data?.data) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-400 text-sm">Preparing invoice…</p>
      </div>
    );
  }

  const tx = data.data;
  const isPaid = tx.status === "paid" || tx.status === "cash_collected";
  const invoiceNo = `INV-${tx.id.slice(0, 8).toUpperCase()}`;
  const paidDate = tx.paidAt ?? tx.cashVerifiedAt ?? tx.createdAt;

  return (
    <>
      {/* Print button — hidden in print */}
      <Button
        onPress={() => window.print()}
        className={"absolute top-20 right-8 print:hidden"}
      >
        Print Invoice
      </Button>

      {/* Invoice */}
      <div
        id="invoice"
        className="mx-auto max-w-2xl bg-white p-10 font-sans text-gray-800"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Image
              src={ASSETS.logos.primary.src}
              alt={ASSETS.logos.primary.alt}
              width={120}
              height={40}
              className="mb-2"
            />
            <p className="text-xs text-gray-500 mt-1">mohan-cabs.com</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">
              {isPaid ? "RECEIPT" : "INVOICE"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{invoiceNo}</p>
            <p className="text-sm text-gray-500">{fmt(paidDate)}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-1 border-gray-300 mb-4" />

        {/* Bill To + Payment Info */}
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Bill To
            </p>
            <p className="font-semibold text-gray-900">{tx.userName}</p>
            <p className="text-sm text-gray-500">{tx.userPhone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Payment Status
            </p>
            <span
              className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${
                isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {STATUS_LABEL[tx.status] ?? tx.status}
            </span>
          </div>
        </div>

        {/* Journey Details Table */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Journey Details
          </p>
          <table className="w-full">
            <tbody>
              <Row
                label="Booking Ref"
                value={tx.bookingRef || tx.bookingId.slice(0, 12)}
              />
              <Row label="Journey Date" value={tx.journeyDate} />
              <Row label="Journey Time" value={tx.journeyTime} />
              <Row label="From" value={tx.pickupName} />
              <Row label="To" value={tx.dropName} />
              <Row
                label="Vehicle"
                value={<span className="capitalize">{tx.vehicleType}</span>}
              />
              <Row label="Passengers" value={tx.members} />
            </tbody>
          </table>
        </div>

        {/* Payment Summary Box */}
        <div className=" mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Payment Summary
          </p>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Total Fare</span>
            <span className="font-medium">
              ₹{parseFloat(tx.totalFare).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">
              This Payment{" "}
              <span className="text-xs capitalize">
                ({tx.mode === "partial" ? "Advance" : "Full"})
              </span>
            </span>
            <span className="font-medium">
              ₹{parseFloat(tx.amount).toLocaleString("en-IN")}
            </span>
          </div>
          {tx.mode === "partial" && (
            <div className="flex justify-between text-sm mb-2 text-amber-600">
              <span>Balance Due</span>
              <span className="font-medium">
                ₹
                {(
                  parseFloat(tx.totalFare) - parseFloat(tx.amount)
                ).toLocaleString("en-IN")}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
            <span className="font-semibold text-gray-700">Amount Paid</span>
            <span className="font-bold text-lg text-gray-900">
              ₹{parseFloat(tx.amount).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Payment Method</span>
            <span className="capitalize">{tx.paymentMethod}</span>
          </div>
          {tx.rzpPaymentId && (
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Razorpay ID</span>
              <span className="font-mono">{tx.rzpPaymentId}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          <p>Thank you for choosing Mohan Cabs.</p>
          <p className="mt-1">For support, contact us at mohan-cabs.com</p>
          <p className="mt-3 font-mono text-gray-300">{tx.id}</p>
        </div>
      </div>

      <style>{`
        @media print {
          html,
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: auto;
          }

          #invoice,
          #invoice * {
            visibility: visible;
          }

          #invoice {
            position: absolute;
            inset: 0;
            width: 100%;
            max-width: 100%;
            padding: 24px;
            margin: 0;
            background: white;
          }

          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 16px;
          }

          .invoice-footer {
            margin-top: 32px;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }

          ::-webkit-scrollbar {
            display: none;
          }

          * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        }
      `}</style>
    </>
  );
}
