export interface Vehicle {
  type: string;
  seats: number;
  fare: number;
  eta: string;
  desc: string;
}

export interface Place {
  label: string;
  sub: string;
}

export interface BookingRequest {
  pickup: string;
  dropoff: string;
  vehicleType: string;
  payment: string;
}

export interface BookingResponse {
  id: string;
  status: "searching" | "confirmed" | "cancelled";
}
