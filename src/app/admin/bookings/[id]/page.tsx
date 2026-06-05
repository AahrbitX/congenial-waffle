"use client";

import React, { useState } from "react";
import { Edit, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumbs,
  Button,
  Card,
  Modal,
  ModalBackdrop,
  Separator,
  Description,
  Skeleton,
  Surface,
  toast,
} from "@heroui/react";
import { Button as CustomButton } from "@/components/ui/Button";

import { Booking } from "@/types/bookings";
import { request } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

import RiderDetails     from "./riderDetails";
import RouteDetails     from "./routeDetails";
import ReviewDetails    from "./reviewDetail";
import DriverDetails    from "./driverDetails";
import PaymentDetails   from "./paymentDetails";
import RideInformation  from "./rideInformation";
import RoundTripDetails from "./roundTripDetails";
import StatusIndicator  from "@/components/data/statusIndicator";

const CANCELLABLE = ["pending", "confirmed"];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function CardSkeleton({ rows = 3, headerWidth = "w-28" }: { rows?: number; headerWidth?: string }) {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Skeleton className={`h-4 ${headerWidth} rounded`} />
      </Card.Header>
      <Separator />
      <Card.Content className="space-y-3">
        {/* Avatar row */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-muted">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        </div>
        {/* Detail grid */}
        <div className={`grid grid-cols-3 gap-4`}>
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-14 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function PaymentSkeleton() {
  return (
    <Card className="gap-2">
      <Card.Header className="flex flex-row items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </Card.Header>
      <Separator />
      <div className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </Card>
  );
}

function RideInfoSkeleton() {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Skeleton className="h-4 w-28 rounded" />
      </Card.Header>
      <Separator />
      <Card.Content className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function RouteSkeleton() {
  return (
    <Card>
      <Card.Header>
        <Skeleton className="h-4 w-28 rounded" />
      </Card.Header>
      <Separator />
      <Card.Content>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2 pt-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-10 w-0.5 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="flex-1 space-y-6">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-4 w-44 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <Skeleton className="h-4 w-44 rounded" />
      </Card.Content>
    </Card>
  );
}

function ReviewSkeleton() {
  return (
    <Card className="gap-2">
      <Card.Header>
        <Skeleton className="h-4 w-16 rounded" />
      </Card.Header>
      <div className="px-4 pb-4 space-y-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-5 rounded" />)}
          <Skeleton className="ml-1 h-4 w-8 rounded" />
        </div>
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </Card>
  );
}

function PageSkeleton() {
  return (
    <Surface className="h-full overflow-y-auto p-4 scrollbar-thin" variant="secondary">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-52 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <CardSkeleton rows={3} headerWidth="w-24" />
          <CardSkeleton rows={6} headerWidth="w-32" />
          <PaymentSkeleton />
        </div>
        <div className="space-y-4">
          <RideInfoSkeleton />
          <RouteSkeleton />
          <ReviewSkeleton />
        </div>
      </div>
    </Surface>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function BookingDetailsPage() {
  const params    = useParams<{ id: string }>();
  const bookingId = params.id;
  const router    = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: responseData, isLoading } = useQuery<Booking>({
    queryKey: ["booking", bookingId],
    queryFn:  () => request(`/api/bookings/${bookingId}`, { method: "GET" }),
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
    onError: (err: any) =>
      toast("Failed to cancel booking", { variant: "danger" }),
  });

  if (isLoading) return <PageSkeleton />;

  if (!responseData?.success || !responseData.data) {
    return (
      <Surface className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center" variant="secondary">
        <p className="text-sm font-semibold">Booking not found</p>
        <p className="text-xs text-muted">This booking may have been deleted or the ID is invalid.</p>
        <Button size="sm" variant="outline" onPress={() => router.push("/admin/bookings")}>
          Back to Bookings
        </Button>
      </Surface>
    );
  }

  const bookingDetails = responseData.data;
  const canCancel = CANCELLABLE.includes(bookingDetails.status);

  return (
    <>
      <Surface className="h-full overflow-y-auto p-4 scrollbar-thin" variant="secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Breadcrumbs>
              <Breadcrumbs.Item href="/admin/bookings">Bookings</Breadcrumbs.Item>
              <Breadcrumbs.Item>{bookingDetails.bookingRef ?? bookingId}</Breadcrumbs.Item>
            </Breadcrumbs>
            <StatusIndicator status={bookingDetails.status} />
          </div>

          <div className="flex items-center gap-2">
            {/* Master ride button — visible on return leg to jump to the outbound (primary) booking */}
            {bookingDetails.tripType === "roundtrip" && bookingDetails.legType === "return" && bookingDetails.linkedBookingId && (
              <Link href={`/admin/bookings/${bookingDetails.linkedBookingId}`}>
                <CustomButton variant="secondary" size="sm">
                  <RefreshCw size={15} />
                  Master Ride
                </CustomButton>
              </Link>
            )}
            {canCancel && (
              <CustomButton
                variant="secondary"
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
            <RiderDetails   rider={bookingDetails.rider} />
            <DriverDetails  driver={bookingDetails.driver} qrToken={(bookingDetails as any).qrToken} bookingId={bookingId} status={bookingDetails.status} />
            <PaymentDetails payment={bookingDetails.payment} bookingId={bookingId} />
          </div>
          <div className="space-y-4">
            <RideInformation info={bookingDetails.info} />
            <RouteDetails    route={bookingDetails.route} />
            <ReviewDetails   review={bookingDetails.review ?? null} />
            {bookingDetails.tripType === "roundtrip" && bookingDetails.linkedBookingId && (
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
                </span>?{" "}
                {bookingDetails.driver ? "The assigned driver will be notified." : ""}
              </p>

              <Separator className="my-4" />

              <Modal.Footer>
                <CustomButton
                  variant="secondary"
                  fullWidth
                  onPress={() => setConfirmOpen(false)}
                  isDisabled={cancelMutation.isPending}
                >
                  Keep Booking
                </CustomButton>
                <CustomButton
                  fullWidth
                  className="bg-danger text-white"
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
