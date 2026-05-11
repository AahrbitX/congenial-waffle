export type ServiceTab = "local" | "outstation" | "airport";
export type TripTab    = "oneway" | "roundtrip";

export interface BookingInitialData {
  serviceId?:           string;   // key into SERVICE_CONFIGS — drives form type
  preselectedCategory?: string;   // pre-selects a vehicle category in Step 2
  // Hero form pre-fill (when navigating from hero)
  serviceTab?:         ServiceTab;
  tripTab?:            TripTab;
  pickup?:             string;
  destination?:        string;
  date?:               string;
  time?:               string;
  returnDate?:         string;
}

export interface VehicleFare {
  amount: number;
  unit:   string;   // "per km" | "flat" | "per 8 hrs" | "per day" | "per week"
  label?: string;   // optional display override e.g. "₹599 flat"
}

export interface Vehicle {
  type:         string;
  category:     string;
  seats:        number;
  defaultFare:  VehicleFare;   // shown when no service-specific fare applies
  serviceFares: Record<string, VehicleFare>;  // keyed by serviceId
  eta:          string;
  desc:         string;
  ac:           boolean;
  services:     ServiceTab[];
}

export interface Place {
  label: string;
  sub:   string;
}

export interface BookingRequest {
  serviceId:    string;
  serviceTab:   ServiceTab;
  tripTab:      TripTab;
  pickup:       string;
  dropoff:      string;
  date:         string;
  time:         string;
  returnDate?:  string;
  vehicleType:  string;
  ac:           boolean;
  seats:        number;
  payment:      string;
}

export interface BookingResponse {
  id:     string;
  status: "searching" | "confirmed" | "cancelled";
}
