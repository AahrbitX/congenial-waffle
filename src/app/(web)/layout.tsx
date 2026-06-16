import React from "react";

import Footer from "@/components/footer";
import LandingNavbar from "@/components/nav/LandingNavbar";

import { BookingProvider } from "@/context/BookingContext";
import { FloatingActionButtons } from "@/components/ui/FloatingActionButtons";

function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BookingProvider>
      <div suppressHydrationWarning className="">
        <LandingNavbar />
        {children}
        <Footer />
        <FloatingActionButtons
          whatsappNumber="917904377385"
          phoneNumber="+917904377385"
        />
      </div>
    </BookingProvider>
  );
}

export default WebLayout;
