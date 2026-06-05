import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Find answers to common questions about booking a cab, payments, refunds, account management and more on the Mohan Cabs help center.",
  alternates: { canonical: "/help" },
};

const SECTIONS = [
  {
    number: "01",
    title: "How to Book a Ride",
    content: [
      "Visit our website or open the Mohan Cabs app. Click 'Book a Ride', select your pickup location, drop-off destination, travel date, and preferred vehicle type.",
      "Review the estimated fare and click 'Confirm Booking'. You'll be taken to the payment page where you can pay online (card, UPI, net banking) or choose cash payment.",
      "Once payment is confirmed, you'll receive a booking reference and a notification when a driver is assigned to your ride.",
    ],
  },
  {
    number: "02",
    title: "Managing Your Bookings",
    content: [
      "Log in to your account and navigate to 'My Bookings' to view all upcoming and past rides. You can see booking details, driver information, and trip status in real time.",
      "To cancel a booking, open the booking and click 'Cancel Ride'. Cancellations made more than 24 hours before the journey are eligible for a full refund.",
      "You can contact your assigned driver directly via the phone number shown on the booking page once a driver has been assigned.",
    ],
  },
  {
    number: "03",
    title: "Payments & Refunds",
    content: [
      "We accept online payments via Razorpay (credit/debit cards, UPI, net banking) and cash payments directly to the driver.",
      "Refunds for online payments are processed within 5–7 business days to your original payment method. You'll receive an email confirmation once the refund is initiated.",
      "If you believe you were charged incorrectly, contact our support team with your booking reference and we'll investigate within 24 hours.",
    ],
  },
  {
    number: "04",
    title: "Account & Profile",
    content: [
      "You can update your name, phone number, and other profile details from the 'Profile' section in your dashboard after logging in.",
      "To reset your password, use the 'Forgot Password' option on the login page. An OTP will be sent to your registered phone number.",
      "If you wish to delete your account, contact our support team at support@mohancabs.in. Account deletion is processed within 7 business days.",
    ],
  },
  {
    number: "05",
    title: "Driver Issues & Complaints",
    content: [
      "After each completed ride, you'll be prompted to rate your driver and leave a review. Your feedback helps us maintain service quality.",
      "If you experienced misconduct or a safety issue during your ride, please contact us immediately at +91 81223 54855 or support@mohancabs.in with your booking reference.",
      "All complaints are taken seriously. Our team will investigate and respond within 48 hours. Verified complaints result in appropriate action against the driver.",
    ],
  },
  {
    number: "06",
    title: "Lost & Found",
    content: [
      "If you left an item in the vehicle, contact our support team as soon as possible with your booking reference and a description of the item.",
      "We will reach out to the driver on your behalf. Mohan Cabs is not liable for lost items but will make every reasonable effort to assist recovery.",
      "For urgent situations, you can directly call your driver's number visible on your completed booking page within 30 minutes of ride completion.",
    ],
  },
  {
    number: "07",
    title: "Contact Support",
    content: [
      "Our customer support team is available 24/7. You can reach us at support@mohancabs.in or call +91 81223 54855.",
      "For faster resolution, always include your booking reference number when contacting support.",
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="w-full bg-white">

      {/* Hero */}
      <section className="min-h-[40vh] flex flex-col justify-end px-8 sm:px-16 pt-36 pb-16 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[55vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="absolute top-24 right-16 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="relative z-10">
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">
            Support · Mohan Cabs
          </span>
          <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f]">
            Help<br />
            <span className="text-blue-500 italic">Center.</span>
          </h1>
          <p className="mt-4 text-gray-400 text-[15px] max-w-lg">
            Find answers to common questions about bookings, payments, and our services.
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
            <h2 className="text-2xl font-black text-white">Still need help?</h2>
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
