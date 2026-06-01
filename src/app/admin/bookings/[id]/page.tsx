"use client";

import React, { useState } from "react";
import { Edit, XCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Breadcrumbs,
  Surface,
  Modal,
  ModalBackdrop,
  Separator,
  Description,
  toast,
} from "@heroui/react";
import { Button } from "@/components/ui/Button";

import { Booking } from "@/types/bookings";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

import RiderDetails from "./riderDetails";
import RouteDetails from "./routeDetails";
import ReviewDetails from "./reviewDetail";
import DriverDetails from "./driverDetails";
import PaymentDetails from "./paymentDetails";
import RideInformation from "./rideInformation";

const CANCELLABLE = ["pending", "confirmed"];

function BookingDetailsPage() {
  const params    = useParams<{ id: string }>();
  const bookingId = params.id;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: responseData, isLoading } = useQuery<Booking>({
    queryKey: ["booking", bookingId],
    queryFn: async () => request(`/api/bookings/${bookingId}`, { method: "GET" }),
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      request(`/api/bookings/${bookingId}/cancel`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setConfirmOpen(false);
      toast.success("Booking cancelled");
    },
    onError: (err: any) => {
      toast.danger(err?.message ?? "Failed to cancel booking");
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (!responseData || !responseData.success) return <p>No data found</p>;

  const bookingDetails = responseData.data;
  const canCancel = CANCELLABLE.includes(bookingDetails.status);

  return (
    <>
      <Surface className="h-full overflow-y-auto p-4 scrollbar-thin" variant="secondary">
        <div className="flex items-center justify-between">
          <Breadcrumbs>
            <Breadcrumbs.Item href="/admin/bookings">Bookings</Breadcrumbs.Item>
            <Breadcrumbs.Item>{bookingDetails.bookingRef ?? bookingId}</Breadcrumbs.Item>
          </Breadcrumbs>

          <div className="flex items-center gap-2">
            {canCancel && (
              <Button
                variant="secondary"
                size="sm"
                onPress={() => setConfirmOpen(true)}
              >
                <XCircle size={15} />
                Cancel Booking
              </Button>
            )}
            <Button size="sm">
              <Edit size={15} />
              Edit Booking
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-4">
            <RiderDetails rider={bookingDetails.rider} />
            <DriverDetails driver={bookingDetails.driver} />
            <PaymentDetails payment={bookingDetails.payment} bookingId={bookingId} />
          </div>
          <div className="space-y-4">
            <RideInformation info={bookingDetails.info} />
            <RouteDetails route={bookingDetails.route} />
            <ReviewDetails review={bookingDetails.review ?? null} />
          </div>
        </div>
      </Surface>

      {/* Cancel confirmation modal */}
      <Modal isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
        <ModalBackdrop>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header className="gap-1">
                <Modal.Heading>Cancel Booking</Modal.Heading>
                <Description>This action cannot be undone.</Description>
              </Modal.Header>

              <Separator className="my-4" />

              <p className="text-sm text-text-secondary px-1">
                Are you sure you want to cancel booking{" "}
                <span className="font-semibold text-text-primary">
                  {bookingDetails.bookingRef ?? bookingId}
                </span>
                ?{" "}
                {bookingDetails.driver
                  ? "The assigned driver will be notified."
                  : ""}
              </p>

              <Separator className="my-4" />

              <Modal.Footer>
                <Button
                  variant="secondary"
                  fullWidth
                  onPress={() => setConfirmOpen(false)}
                  isDisabled={cancelMutation.isPending}
                >
                  Keep Booking
                </Button>
                <Button
                  fullWidth
                  className="bg-danger text-white"
                  isLoading={cancelMutation.isPending}
                  isDisabled={cancelMutation.isPending}
                  onPress={() => cancelMutation.mutate()}
                >
                  Yes, Cancel
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </ModalBackdrop>
      </Modal>
    </>
  );
}

export default BookingDetailsPage;
