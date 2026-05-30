"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Modal, Button } from "@heroui/react";

import { useDashboard } from "@/context/DashboardContext";
import { raiseTicket } from "@/api/rides.api";

import {
  IconTicket,
  IconCheckCircle,
  IconMapPin,
  IconLoader,
} from "@/constants/icons";

const CATEGORIES = [
  { value: "payment", label: "Payment Issue" },
  { value: "driver_issue", label: "Driver Issue" },
  { value: "route_issue", label: "Route / Pickup Issue" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export function RaiseTicketModal() {
  const { ticketRide, closeTicketModal } = useDashboard();

  const [category, setCategory] = useState<Category>("other");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      raiseTicket({
        bookingId: ticketRide?.id,
        category,
        subject: subject.trim(),
        description: description.trim(),
      }),
    onSuccess: () => {
      setSubmitted(true);

      setTimeout(() => {
        closeTicketModal();
        setSubmitted(false);
        setSubject("");
        setDescription("");
        setCategory("other");
      }, 2000);
    },
  });

  if (!ticketRide) return null;

  const canSubmit =
    subject.trim().length >= 3 && description.trim().length >= 5;

  return (
    <Modal
      onOpenChange={(open) => {
        if (!open) closeTicketModal();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-lg">
            {submitted ? (
              <>
                <Modal.Body className="py-10">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                      <IconCheckCircle size={34} className="text-success" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold">
                        Ticket Raised Successfully
                      </h3>

                      <p className="mt-1 text-sm text-muted">
                        Our support team will get back to you shortly.
                      </p>
                    </div>
                  </div>
                </Modal.Body>
              </>
            ) : (
              <>
                <Modal.Header>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <IconTicket size={14} />
                      <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                        Support Ticket
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <IconMapPin size={14} />

                      <span className="truncate">{ticketRide.from}</span>

                      <span className="text-muted">→</span>

                      <span className="truncate">{ticketRide.to}</span>
                    </div>

                    <p className="text-xs text-muted">
                      #{ticketRide.bookingRef}
                    </p>
                  </div>
                </Modal.Header>

                <Modal.Body className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                      Category
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setCategory(item.value)}
                          className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all ${
                            category === item.value
                              ? "border-primary bg-primary text-white"
                              : "border-border bg-secondary hover:border-primary"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                      Subject
                    </label>

                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Charged twice for this trip"
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                      Description
                    </label>

                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      className="w-full resize-none rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="secondary" onPress={closeTicketModal}>
                    Cancel
                  </Button>

                  <Button
                    isDisabled={!canSubmit || submit.isPending}
                    onPress={() => submit.mutate()}
                  >
                    {submit.isPending ? (
                      <div className="flex items-center gap-2">
                        <IconLoader size={14} className="animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      "Submit Ticket"
                    )}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
