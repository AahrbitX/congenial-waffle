import { Metadata } from "next";

import { CtaSection } from "@/components/web/home/ctaSection";
import { HeroSection } from "@/components/web/home/heroSection";
import { CarsSection } from "@/components/web/home/carsSection";
import { WhyUsSection } from "@/components/web/home/whyusSection";
import { PackagesSection } from "@/components/web/home/packageSection";
import { TestimonialsSection } from "@/components/web/home/testimonialSection";

export const metadata: Metadata = {};

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
