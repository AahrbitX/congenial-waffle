"use client";

import React, { useState } from "react";
import { Edit, XCircle, ArrowUp } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumbs,
  Button,
  Modal,
  ModalBackdrop,
  Separator,
  Description,
  Surface,
  toast,
} from "@heroui/react";
import { Button as CustomButton } from "@/components/ui/Button";

import { Booking } from "@/types/bookings";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

import RiderDetails from "./riderDetails";
import RouteDetails from "./routeDetails";
import ReviewDetails from "./reviewDetail";
import DriverDetails from "./driverDetails";
import PaymentDetails from "./paymentDetails";
import RideInformation from "./rideInformation";
import RoundTripDetails from "./roundTripDetails";
import StatusIndicator from "@/components/data/statusIndicator";
import { PageSkeleton } from "./pageSkeleton";

const CANCELLABLE = ["pending", "confirmed"];

// ── Page ──────────────────────────────────────────────────────────────────────
function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params.id;
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: responseData, isLoading } = useQuery<Booking>({
    queryKey: ["booking", bookingId],
    queryFn: () => request(`/api/bookings/${bookingId}`, { method: "GET" }),
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
    onError: () =>
      toast("Failed to cancel booking", { variant: "danger" }),
  });

  if (isLoading) return <PageSkeleton />;

  if (!responseData?.success || !responseData.data) {
    return (
      <Surface
        className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center"
        variant="secondary"
      >
        <p className="text-sm font-semibold">Booking not found</p>
        <p className="text-xs text-muted">
          This booking may have been deleted or the ID is invalid.
        </p>
        <Button
          size="sm"
          variant="outline"
          onPress={() => router.push("/admin/bookings")}
        >
          Back to Bookings
        </Button>
      </Surface>
    );
  }

  const bookingDetails = responseData.data;
  const canCancel = CANCELLABLE.includes(bookingDetails.status);

  return (
    <>
      <Surface
        className="h-full overflow-y-auto p-4 scrollbar-thin"
        variant="secondary"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Breadcrumbs>
              <Breadcrumbs.Item href="/admin/bookings">
                Bookings
              </Breadcrumbs.Item>
              <Breadcrumbs.Item>
                {bookingDetails.bookingRef ?? bookingId}
              </Breadcrumbs.Item>
            </Breadcrumbs>
            <StatusIndicator status={bookingDetails.status} />
          </div>

          <div className="flex items-center gap-2">
            {/* Master ride button — visible on return leg to jump to the outbound (primary) booking */}
            {bookingDetails.tripType === "roundtrip" &&
              bookingDetails.legType === "return" &&
              bookingDetails.linkedBookingId && (
                <Link
                  href={`/admin/bookings/${bookingDetails.linkedBookingId}`}
                >
                  <CustomButton variant="secondary" size="sm">
                    <ArrowUp size={15} />
                    Master Ride
                  </CustomButton>
                </Link>
              )}
            {canCancel && (
              <CustomButton
                variant="danger-soft"
                size="sm"
                onPress={() => setConfirmOpen(true)}
              >
                <XCircle size={15} />
                Cancel Booking
              </CustomButton>
            )}
            <CustomButton size="sm">
              <Edit size={15} />
              Edit Booking
            </CustomButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-4">
            <RiderDetails rider={bookingDetails.rider} />
            <DriverDetails
              driver={bookingDetails.driver}
              qrToken={(bookingDetails as any).qrToken}
              bookingId={bookingId}
              status={bookingDetails.status}
            />
            <PaymentDetails
              payment={bookingDetails.payment}
              bookingId={bookingId}
              bookingStatus={bookingDetails.status}
              qrToken={(bookingDetails as any).qrToken}
            />
          </div>
          <div className="space-y-4">
            <RideInformation info={bookingDetails.info} />
            <RouteDetails route={bookingDetails.route} />
            <ReviewDetails
              review={bookingDetails.review ?? null}
              bookingId={bookingId}
              bookingStatus={bookingDetails.status}
              qrToken={(bookingDetails as any).qrToken}
            />
            {bookingDetails.tripType === "roundtrip" &&
              bookingDetails.linkedBookingId && (
                <RoundTripDetails
                  bookingRef={bookingDetails.bookingRef}
                  status={bookingDetails.status}
                  legType={bookingDetails.legType}
                  journeyDate={bookingDetails.info?.journeyDate}
                  journeyTime={bookingDetails.info?.journeyTime}
                  driverName={bookingDetails.driver?.name}
                  linkedBookingId={bookingDetails.linkedBookingId}
                  linkedLeg={bookingDetails.linkedLeg ?? null}
                />
              )}
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
                <CustomButton
                  fullWidth
                  variant="danger"
                  isLoading={cancelMutation.isPending}
                  isDisabled={cancelMutation.isPending}
                  onPress={() => cancelMutation.mutate()}
                >
                  Yes, Cancel
                </CustomButton>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </ModalBackdrop>
      </Modal>
    </>
  );
}

export default BookingDetailsPage;
