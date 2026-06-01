export type FleetCategory = "All" | "Hatchback" | "Sedan" | "MUV" | "Luxury" | "Traveller";

export interface FleetCar {
  id: string;
  name: string;
  tagline: string;
  category: Exclude<FleetCategory, "All">;
  image: string;
  seats: number;
  bags: number;
  ac: boolean;
  fuel: string;
  features: string[];
  priceFrom: string;
}

/** DB-backed fleet vehicle (from /api/fleet) */
export interface FleetVehicle {
  id: string;
  name: string;
  tagline: string | null;
  category: string;
  image: string | null;
  seats: number;
  bags: number;
  ac: boolean;
  fuel: string;
  features: string[];
  priceFrom: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
