export type ServiceTab = "local" | "outstation" | "airport";
export type TripTab    = "oneway" | "roundtrip";

export interface BookingInitialData {
  serviceTab?:  ServiceTab;
  tripTab?:     TripTab;
  pickup?:      string;
  destination?: string;
  date?:        string;
  time?:        string;
  returnDate?:  string;
}

export interface Vehicle {
  type:     string;
  category: string;       // "Hatchback" | "Sedan" | "MUV" | "Luxury" | "Traveller"
  seats:    number;
  fare:     number;
  fareUnit: string;       // "per km" | "flat" | "per day"
  eta:      string;
  desc:     string;
  ac:       boolean;
  services: ServiceTab[]; // which tabs this vehicle appears under
}

export interface Place {
  label: string;
  sub:   string;
}

export interface BookingRequest {
  // Step 1
  serviceTab:   ServiceTab;
  tripTab:      TripTab;
  pickup:       string;
  dropoff:      string;
  date:         string;
  time:         string;
  returnDate?:  string;
  // Step 2
  vehicleType:  string;
  ac:           boolean;
  seats:        number;
  // Step 3
  payment:      string;
}

export interface BookingResponse {
  id:     string;
  status: "searching" | "confirmed" | "cancelled";
}
