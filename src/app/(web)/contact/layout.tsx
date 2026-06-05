import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Mohan Cabs — 24/7 support for bookings, payments, refunds and complaints. Serving Kanyakumari, Trivandrum and Tamil Nadu.",
  openGraph: {
    title: "Contact Us | Mohan Cabs",
    description:
      "24/7 support for bookings, payments, refunds and complaints. Call, email or use our contact form.",
    url: "/contact",
  },
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
