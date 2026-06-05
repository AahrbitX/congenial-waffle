import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";
import { Providers } from "@/providers";
import { ConsentBanner } from "@/components/ui/ConsentBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mohan Cabs — Trusted Cab Service in Kanyakumari & Tamil Nadu",
    template: "%s | Mohan Cabs",
  },
  description:
    "Book safe, reliable cabs in Kanyakumari, Trivandrum and Tamil Nadu. City rides, airport transfers, outstation trips — fixed fares, verified drivers, available 24/7.",
  keywords: [
    "cab booking Kanyakumari",
    "taxi Kanyakumari",
    "cab service Tamil Nadu",
    "cab booking Trivandrum",
    "airport transfer Kanyakumari",
    "outstation cab Kerala",
    "Mohan Cabs",
    "taxi service Nagercoil",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mohancabs.com"),
  openGraph: {
    type: "website",
    siteName: "Mohan Cabs",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mohancabs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>{children}</Providers>
        <ConsentBanner />
      </body>
    </html>
  );
}
