import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Mohan Cabs has been serving Kanyakumari, Trivandrum and Tamil Nadu since 2005. 20+ years, 5 lakh+ riders, 500+ verified drivers — honest, punctual cab service you can trust.",
  openGraph: {
    title: "About Us | Mohan Cabs",
    description:
      "Two decades of honest, punctual cab service across Kanyakumari, Trivandrum and Tamil Nadu. Trusted by 5 lakh+ riders.",
    url: "/about",
  },
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
