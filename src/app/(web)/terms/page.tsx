import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions governing the use of Mohan Cabs — booking policies, payment, cancellations, driver conduct and more.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms",
    content: [
      "By accessing or using Mohan Cabs services — including our website, mobile application, or any booking made through our platform — you agree to be bound by these Terms and Conditions.",
      "If you do not agree with any part of these terms, you must not use our services. We reserve the right to update these terms at any time, and continued use of our services after changes constitutes your acceptance of the revised terms.",
    ],
  },
  {
    number: "02",
    title: "Services Provided",
    content: [
      "Mohan Cabs provides cab and taxi services including local city rides, outstation trips, airport and railway transfers, vehicle hire, and related transportation services within Kanyakumari district and across Tamil Nadu.",
      "We act as an intermediary connecting passengers with verified driver-partners. All rides are subject to availability and may vary based on location, time, and demand.",
      "Mohan Cabs reserves the right to modify, suspend, or discontinue any service at any time without prior notice.",
    ],
  },
  {
    number: "03",
    title: "Booking & Payment",
    content: [
      "Bookings can be made via our website or mobile application. A booking is confirmed only after successful payment of the advance or full fare as applicable.",
      "Fares are calculated based on distance, vehicle type, and applicable taxes. Displayed fares are estimates; final fares may vary for outstation trips, waiting time, or route changes.",
      "We accept payments via Razorpay (credit/debit cards, UPI, net banking) and cash payments to the driver. Partial advance payments are available for eligible bookings.",
      "All payments are processed securely. Mohan Cabs does not store card details on its servers.",
    ],
  },
  {
    number: "04",
    title: "Cancellation & Refunds",
    content: [
      "Cancellations made more than 24 hours before the scheduled journey are eligible for a full refund. Cancellations within 24 hours may attract a cancellation fee.",
      "Refunds for online payments are processed within 5–7 business days to the original payment method. Cash payments are non-refundable post-ride.",
      "Mohan Cabs reserves the right to cancel a booking due to unavailability of drivers, adverse weather, or safety concerns, in which case a full refund will be issued.",
      "No-shows by the passenger without cancellation will forfeit the advance payment.",
    ],
  },
  {
    number: "05",
    title: "User Responsibilities",
    content: [
      "You must provide accurate personal information including name, phone number, and pickup/drop details. Incorrect information may result in booking cancellation.",
      "Passengers are responsible for their conduct during the ride. Any damage caused to the vehicle by the passenger will be charged accordingly.",
      "The use of our services for illegal activities, transporting prohibited items, or any purpose that violates applicable laws is strictly prohibited.",
      "You must be at least 18 years of age to create an account and make bookings. Minors may travel only when accompanied by a responsible adult.",
    ],
  },
  {
    number: "06",
    title: "Driver Conduct & Safety",
    content: [
      "All Mohan Cabs drivers are verified, background-checked, and trained to maintain professional conduct. Drivers hold valid commercial driving licenses.",
      "Passengers may rate and review their driver after each trip. We take feedback seriously and act on consistent complaints.",
      "In case of safety concerns during a ride, passengers should contact local emergency services immediately. Our 24/7 support team is also available.",
      "Mohan Cabs is not liable for delays caused by traffic, road conditions, natural events, or circumstances beyond our control.",
    ],
  },
  {
    number: "07",
    title: "Limitation of Liability",
    content: [
      "Mohan Cabs shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services, including but not limited to loss of income, data, or goodwill.",
      "Our total liability for any claim arising out of or relating to these terms shall not exceed the fare paid for the specific booking giving rise to the claim.",
      "We are not responsible for items left behind in vehicles. Passengers are encouraged to check for personal belongings before exiting.",
    ],
  },
  {
    number: "08",
    title: "Intellectual Property",
    content: [
      "All content on the Mohan Cabs platform — including logos, text, graphics, and software — is the exclusive property of Mohan Cabs and protected under applicable intellectual property laws.",
      "You may not reproduce, distribute, or create derivative works from our content without express written permission.",
    ],
  },
  {
    number: "09",
    title: "Governing Law",
    content: [
      "These Terms and Conditions are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of courts in Kanyakumari, Tamil Nadu.",
      "We encourage resolving disputes amicably. Formal legal proceedings should be a last resort after exhausting our customer support channels.",
    ],
  },
  {
    number: "10",
    title: "Contact Us",
    content: [
      "If you have any questions about these Terms and Conditions, please contact us at info@mohancabs.in or call our customer support line at +91 79043 77385.",
      "Our support team is available 24/7 to assist you.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="w-full bg-white">

      {/* Hero */}
      <section className="min-h-[40vh] flex flex-col justify-end px-8 sm:px-16 pt-36 pb-16 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[55vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="absolute top-24 right-16 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="relative z-10">
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">
            Legal · Mohan Cabs
          </span>
          <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f]">
            Terms &amp;<br />
            <span className="text-blue-500 italic">Conditions.</span>
          </h1>
          <p className="mt-4 text-gray-400 text-[15px] max-w-lg">
            Last updated: June 2026. Please read these terms carefully before using our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-8 sm:px-16 bg-[#f8f9fe]">
        <div className="max-w-4xl mx-auto space-y-12">
          {SECTIONS.map(({ number, title, content }) => (
            <div key={number} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <p className="text-[11px] font-bold text-blue-500 tracking-widest uppercase mb-3">
                {number}
              </p>
              <h2 className="text-xl font-black text-[#0f0f0f] mb-5">{title}</h2>
              <div className="space-y-3">
                {content.map((para, i) => (
                  <p key={i} className="text-[14px] text-gray-500 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8 sm:px-16 bg-blue-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white">Have questions about our terms?</h2>
            <p className="text-blue-100 text-sm mt-1">Our support team is available 24/7.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-white text-blue-500 font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group shrink-0"
          >
            Contact Us
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </main>
  );
}
