import Footer from "@/components/footer";
import Navbar from "@/components/nav";
import React from "react";

function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export default WebLayout;
