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
