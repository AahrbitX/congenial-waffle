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
  title: "Mohan Cabs",
  description: "A Cab booking application built with Next.js",
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
