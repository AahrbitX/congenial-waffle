import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Mohan Cabs has been serving Kanyakumari and Tamil Nadu since 2017. Clean vehicles, affordable fares, and highly courteous drivers — honest, punctual cab service you can trust.",
  openGraph: {
    title: "About Us | Mohan Cabs",
    description:
      "Serving Kanyakumari and Tamil Nadu since 2017. Affordable fares, clean vehicles, and courteous drivers for a comfortable journey.",
    url: "/about",
  },
  alternates: { canonical: "/about" },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
