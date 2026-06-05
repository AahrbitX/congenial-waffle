import { Metadata } from "next";

import { CtaSection } from "@/components/web/home/ctaSection";
import { HeroSection } from "@/components/web/home/heroSection";
import { CarsSection } from "@/components/web/home/carsSection";
import { WhyUsSection } from "@/components/web/home/whyusSection";
import { PackagesSection } from "@/components/web/home/packageSection";
import { TestimonialsSection } from "@/components/web/home/testimonialSection";

export const metadata: Metadata = {
  title: {
    absolute: "Mohan Cabs — Book a Cab in Kanyakumari & Tamil Nadu",
  },
  description:
    "Book safe, reliable cabs in Kanyakumari, Trivandrum and Tamil Nadu. City rides, airport transfers, outstation trips & more — fixed fares, verified drivers, 24/7 support. Trusted by 1,00,000+ riders.",
  openGraph: {
    title: "Mohan Cabs — Book a Cab in Kanyakumari & Tamil Nadu",
    description:
      "Safe, reliable cabs for city rides, outstation trips & airport transfers across Kanyakumari, Trivandrum and Tamil Nadu. Fixed fares, verified drivers, available 24/7.",
    url: "/",
    type: "website",
  },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="w-full">
      <HeroSection />
      <CarsSection />
      <PackagesSection />
      <WhyUsSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
