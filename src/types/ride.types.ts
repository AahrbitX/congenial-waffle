export type RideStatus = "completed" | "cancelled" | "ongoing";
export type RideFilter = "all" | "completed" | "cancelled";

export interface Ride {
  id: string;
  status: RideStatus;
  date: string;
  from: string;
  to: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  plate: string;
  fare: number;
  distance: string;
  duration: string;
  rating: number;
  payment: string;
  tip: number;
}

export const STATUS_COLOR: Record<RideStatus, "success" | "danger" | "accent"> = {
  completed: "success",
  cancelled: "danger",
  ongoing:   "accent",
};
