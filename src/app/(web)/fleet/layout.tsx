import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Fleet",
  description:
    "Choose from hatchbacks, sedans, luxury cars, MUVs and travellers. All AC, all verified, transparent fares across Kanyakumari, Trivandrum and Tamil Nadu.",
  openGraph: {
    title: "Our Fleet | Mohan Cabs",
    description:
      "Hatchbacks, sedans, luxury cars, MUVs and travellers — all AC, verified, at transparent fares.",
    url: "/fleet",
  },
  alternates: { canonical: "/fleet" },
};

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
