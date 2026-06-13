"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Drawer, Modal, Button, TextArea, Input, Label } from "@heroui/react";

import { useDashboard } from "@/context/DashboardContext";
import { raiseTicket } from "@/api/rides.api";

import {
  IconTicket,
  IconCheckCircle,
  IconLoader,
} from "@/constants/icons";

const CATEGORIES = [
  { value: "payment", label: "Payment Issue" },
  { value: "driver_issue", label: "Driver Issue" },
  { value: "route_issue", label: "Route Issue" },
  { value: "other", label: "Others" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export function RaiseTicketModal() {
  const { ticketRide, closeTicketModal } = useDashboard();

  const [category, setCategory] = useState<Category>("other");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);


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

  const sheetContent = (
    <div className="w-full flex flex-col max-h-[90vh]">
      {submitted ? (
        <Modal.Body>
          <div className="flex flex-col items-center gap-4 text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <IconCheckCircle size={34} className="text-success" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Ticket Raised Successfully</h3>
              <p className="mt-1 text-sm text-muted">
                Our support team will get back to you shortly.
              </p>
            </div>
          </div>
        </Modal.Body>
      ) : (
        <>
          <Modal.Header className="px-5 py-4">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2 text-muted">
                <IconTicket size={16} />
                <span>Support Ticket</span>
              </div>
              <p>For Booking: #{ticketRide.bookingRef}</p>
            </div>
          </Modal.Header>

          <Modal.Body className="overflow-y-auto flex-1 px-5 py-2 space-y-4">
            <div>
              <Label className="mb-2 block text-muted">Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors duration-100 ${
                      category === item.value
                        ? "bg-primary text-white"
                        : "bg-[var(--color-default)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-1">
              <Label htmlFor="subject" className="mb-2 block text-muted">
                Subject
              </Label>
              <Input
                fullWidth
                id="subject"
                value={subject}
                variant="secondary"
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Charged twice for this trip"
              />
            </div>

            <div className="px-1">
              <Label htmlFor="description" className="mb-2 block text-muted">
                Description
              </Label>
              <TextArea
                rows={5}
                fullWidth
                id="description"
                variant="secondary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
              />
            </div>
          </Modal.Body>

          <Modal.Footer className="px-5 pb-6 pt-3">
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
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        isOpen={!!ticketRide}
        onOpenChange={(open) => { if (!open) closeTicketModal(); }}
      >
        <Drawer.Backdrop className="bg-black/40 backdrop-blur-sm">
          <Drawer.Content placement="bottom">
            <Drawer.Dialog className="p-0 pt-2">
              <Drawer.Handle />
              {sheetContent}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );
  }

  return (
    <Modal
      isOpen={!!ticketRide}
      onOpenChange={(open) => { if (!open) closeTicketModal(); }}
    >
      <Modal.Backdrop className="bg-black/40 backdrop-blur-sm">
        <Modal.Container>
          <Modal.Dialog className="max-w-lg">
            {sheetContent}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
