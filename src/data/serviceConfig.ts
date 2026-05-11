import type { ServiceTab, TripTab } from "@/types/booking.types";

export type ServiceFormType =
  | "standard"    // City Taxi, Nationwide — pickup, destination, date/time
  | "outstation"  // Outstation — from city, to city, one-way/round, return date
  | "airport"     // Airport Transfer — direction, address, flight date/time, flight no.
  | "railway"     // Railway Transfer — direction, address, train date/time, train no.
  | "hire"        // Full Day Hire, Weekly Commute, Rent a Car — pickup, duration
  | "event"       // Wedding Cars, Tour Packages, Events — event date, venue, passengers
  | "group"       // Tempo Traveller — pickup, destination, passengers, one-way/round
  | "inquiry";    // Corporate, School — contact form, no vehicle booking

export interface ServiceFormConfig {
  id:                   string;
  label:                string;
  formType:             ServiceFormType;
  serviceTab:           ServiceTab;
  defaultTripTab?:      TripTab;
  vehicleCategories:    string[];  // empty = all
  preselectedCategory?: string;
}

export const SERVICE_CONFIGS: Record<string, ServiceFormConfig> = {
  // ── Book A Ride ───────────────────────────────────────────────────────────
  "city-taxi":            { id: "city-taxi",            label: "City Taxi",          formType: "standard",   serviceTab: "local",      vehicleCategories: ["Hatchback", "Sedan", "MUV"] },
  "rent-a-car":           { id: "rent-a-car",           label: "Rent a Car",         formType: "hire",       serviceTab: "local",      vehicleCategories: ["Hatchback", "Sedan", "MUV", "Luxury"] },
  "outstation":           { id: "outstation",           label: "Outstation",         formType: "outstation", serviceTab: "outstation", vehicleCategories: ["Sedan", "MUV", "Luxury"] },
  "outstation-oneway":    { id: "outstation-oneway",    label: "One-Way Drop",       formType: "outstation", serviceTab: "outstation", defaultTripTab: "oneway",    vehicleCategories: ["Sedan", "MUV", "Luxury"] },
  "outstation-roundtrip": { id: "outstation-roundtrip", label: "Round Trip Package", formType: "outstation", serviceTab: "outstation", defaultTripTab: "roundtrip", vehicleCategories: ["Sedan", "MUV", "Luxury"] },
  "airport":              { id: "airport",              label: "Airport Transfer",   formType: "airport",    serviceTab: "airport",    vehicleCategories: ["Sedan", "MUV", "Luxury"] },
  "railway":              { id: "railway",              label: "Railway Transfer",   formType: "railway",    serviceTab: "local",      vehicleCategories: ["Sedan", "MUV"] },
  "nationwide":           { id: "nationwide",           label: "Nationwide Pickup",  formType: "outstation", serviceTab: "outstation", vehicleCategories: ["Sedan", "MUV", "Luxury"] },
  // ── Special Services ──────────────────────────────────────────────────────
  "wedding":              { id: "wedding",              label: "Wedding Cars",       formType: "event",      serviceTab: "local",      vehicleCategories: ["Luxury"] },
  "tempo":                { id: "tempo",                label: "Tempo Traveller",    formType: "group",      serviceTab: "airport",    vehicleCategories: ["Traveller"] },
  "corporate":            { id: "corporate",            label: "Corporate Plan",     formType: "inquiry",    serviceTab: "local",      vehicleCategories: [] },
  "tours":                { id: "tours",                label: "Tour Packages",      formType: "event",      serviceTab: "outstation", vehicleCategories: ["Sedan", "MUV", "Luxury", "Traveller"] },
  "events":               { id: "events",               label: "Events",             formType: "event",      serviceTab: "local",      vehicleCategories: ["Sedan", "MUV", "Luxury"] },
  "school":               { id: "school",               label: "School Transport",   formType: "inquiry",    serviceTab: "local",      vehicleCategories: [] },
  // ── Package shortcuts ─────────────────────────────────────────────────────
  "full-day-hire":        { id: "full-day-hire",        label: "Full Day Hire",      formType: "hire",       serviceTab: "local",      vehicleCategories: ["Sedan", "MUV", "Luxury"] },
  "weekly-commute":       { id: "weekly-commute",       label: "Weekly Commute",     formType: "hire",       serviceTab: "local",      vehicleCategories: ["Hatchback", "Sedan", "MUV"] },
};

export function getServiceConfig(serviceId: string): ServiceFormConfig | undefined {
  return SERVICE_CONFIGS[serviceId];
}
