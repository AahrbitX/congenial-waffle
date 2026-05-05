"use client";

import React from "react";
import { Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Breadcrumbs, Button, Surface } from "@heroui/react";

import { Booking } from "@/types/bookings";
import { request } from "@/lib/api-client";

import RiderDetails from "./riderDetails";
import RouteDetails from "./routeDetails";
import ReviewDetails from "./reviewDetail";
import DriverDetails from "./driverDetails";
import PaymentDetails from "./paymentDetails";
import RideInformation from "./rideInformation";

function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params.id;

  const { data: responseData, isLoading } = useQuery<Booking>({
    queryKey: [bookingId],
    queryFn: async () => {
      return request(`/api/bookings/${bookingId}`, {
        method: "GET",
      });
    },
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!responseData || !responseData.success) {
    return <p>No data found</p>;
  }

  const bookingDetails = responseData.data;

  return (
    <Surface className="h-full overflow-y-auto p-4 scrollbar-thin">
      <div className="flex items-center justify-between">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/admin/drivers">Bookings</Breadcrumbs.Item>
          <Breadcrumbs.Item>{bookingId}</Breadcrumbs.Item>
        </Breadcrumbs>
        <Button size="sm">
          <Edit />
          Edit Booking
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-4">
          <RiderDetails rider={bookingDetails.rider} />
          <DriverDetails driver={bookingDetails.driver} />
          <PaymentDetails />
        </div>
        <div className="space-y-4">
          <RideInformation info={bookingDetails.info} />
          <RouteDetails route={bookingDetails.route} />
          <ReviewDetails />
        </div>
      </div>
    </Surface>
  );
}

export default BookingDetailsPage;
