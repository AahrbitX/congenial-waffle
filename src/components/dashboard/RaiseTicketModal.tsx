"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDashboard } from "@/context/DashboardContext";
import { raiseTicket } from "@/api/rides.api";
import { Button } from "@heroui/react";
import {
  IconTicket,
  IconCheckCircle,
  IconX,
  IconMapPin,
  IconLoader,
} from "@/constants/icons";

const CATEGORIES = [
  { value: "payment",      label: "Payment Issue" },
  { value: "driver_issue", label: "Driver Issue" },
  { value: "route_issue",  label: "Route / Pickup Issue" },
  { value: "other",        label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export function RaiseTicketModal() {
  const { ticketRide, closeTicketModal } = useDashboard();

  const [category, setCategory]   = useState<Category>("other");
  const [subject, setSubject]     = useState("");
  const [description, setDesc]    = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      raiseTicket({
        bookingId:   ticketRide?.id,
        category,
        subject:     subject.trim(),
        description: description.trim(),
      }),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(closeTicketModal, 2500);
    },
  });

  if (!ticketRide) return null;

  const canSubmit = subject.trim().length >= 3 && description.trim().length >= 5;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) closeTicketModal(); }}
    >
      <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 px-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <IconCheckCircle size={34} className="text-success" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground">Ticket Raised!</p>
              <p className="text-sm text-default-400 mt-1">
                Our team will get back to you shortly.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-divider">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <IconTicket size={14} className="text-primary shrink-0" />
                  <p className="text-[11px] text-default-400 font-semibold uppercase tracking-wider">
                    Raise a Ticket
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground truncate">
                  <IconMapPin size={13} className="text-primary shrink-0" />
                  <span className="truncate">{ticketRide.from}</span>
                  <span className="text-default-400 shrink-0 text-xs">→</span>
                  <span className="truncate">{ticketRide.to}</span>
                </div>
                <p className="text-xs text-default-400 mt-0.5">#{ticketRide.bookingRef}</p>
              </div>
              <button
                onClick={() => closeTicketModal()}
                className="p-1.5 rounded-lg hover:bg-default-100 text-default-400 ml-3 shrink-0"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70svh] overflow-y-auto">

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-default-500 uppercase tracking-wide block mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors text-left ${
                        category === c.value
                          ? "bg-primary text-white border-primary"
                          : "bg-zinc-50 dark:bg-zinc-800 text-default-600 border-zinc-200 dark:border-zinc-700 hover:border-primary/50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-default-500 uppercase tracking-wide block mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Charged twice for this trip"
                  maxLength={200}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-default-500 uppercase tracking-wide block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pb-1">
                <Button variant="secondary" className="flex-1" onPress={() => closeTicketModal()}>
                  Cancel
                </Button>
                <button
                  onClick={() => submit.mutate()}
                  disabled={!canSubmit || submit.isPending}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    !canSubmit || submit.isPending
                      ? "bg-primary/40 text-white cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {submit.isPending ? (
                    <><IconLoader size={14} className="animate-spin" /> Submitting…</>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
