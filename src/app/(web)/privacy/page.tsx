import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read Mohan Cabs' privacy policy — how we collect, use and protect your personal information.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    number: "01",
    title: "Information We Collect",
    content: [
      "We collect information you provide directly to us, including your name, phone number, email address, and payment details when you create an account or make a booking.",
      "We automatically collect certain information when you use our services, including device information, IP address, browser type, pages visited, and usage data through cookies and similar tracking technologies.",
      "For ride bookings, we collect pickup and drop-off location data, journey history, and any preferences you set within the app.",
    ],
  },
  {
    number: "02",
    title: "How We Use Your Information",
    content: [
      "We use the information we collect to provide, maintain, and improve our services — including processing bookings, facilitating payments, and connecting you with drivers.",
      "We use your contact details to send booking confirmations, ride updates, receipts, and important service notifications via SMS, WhatsApp, or email.",
      "We may use your data to personalise your experience, analyse usage patterns, and improve our platform's performance and safety.",
      "We do not sell your personal information to third parties for their marketing purposes.",
    ],
  },
  {
    number: "03",
    title: "Sharing of Information",
    content: [
      "We share your name and phone number with the assigned driver to facilitate your ride. Drivers do not have access to your payment details or full account history.",
      "We work with trusted third-party service providers — including payment processors (Razorpay), messaging services (Fast2SMS, Meta WhatsApp Cloud API), and mapping providers (Mapbox) — who process data on our behalf under strict confidentiality agreements.",
      "We may disclose your information if required by law, court order, or government authority, or to protect the safety of our users, employees, or the public.",
    ],
  },
  {
    number: "04",
    title: "Cookies & Tracking",
    content: [
      "Our website uses cookies and similar technologies to remember your preferences, maintain your session, and understand how visitors use our platform.",
      "You can control cookie settings through your browser. Disabling cookies may affect certain features of our website.",
      "We use analytics tools to monitor platform performance and user behaviour in aggregate, anonymised form.",
    ],
  },
  {
    number: "05",
    title: "Data Retention",
    content: [
      "We retain your personal information for as long as your account is active or as needed to provide our services and comply with legal obligations.",
      "Booking and payment records are retained for a minimum of seven years in accordance with applicable financial regulations.",
      "You may request deletion of your account and associated data at any time. Some data may be retained in anonymised form for analytical purposes.",
    ],
  },
  {
    number: "06",
    title: "Your Rights",
    content: [
      "You have the right to access, correct, or update the personal information we hold about you at any time through your account settings or by contacting our support team.",
      "You may request a copy of your personal data or ask us to delete your account and associated information, subject to any legal retention requirements.",
      "You can opt out of promotional communications at any time by contacting us. Transactional messages related to active bookings cannot be disabled.",
    ],
  },
  {
    number: "07",
    title: "Data Security",
    content: [
      "We implement industry-standard security measures including encryption in transit (HTTPS/TLS), secure payment tokenisation via Razorpay, and access controls to protect your data.",
      "We do not store full card numbers or CVV codes on our servers. All card transactions are handled directly by our PCI-compliant payment processor.",
      "Despite our best efforts, no data transmission or storage system is completely secure. If you believe your account has been compromised, please contact us immediately.",
    ],
  },
  {
    number: "08",
    title: "Children's Privacy",
    content: [
      "Our services are not directed to children under 18 years of age. We do not knowingly collect personal information from minors.",
      "If we become aware that we have inadvertently collected information from a child under 18, we will take steps to delete it promptly.",
    ],
  },
  {
    number: "09",
    title: "Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The date at the top of this page indicates when it was last revised.",
      "We will notify you of material changes via email or a prominent notice on our platform. Continued use of our services after changes take effect constitutes your acceptance of the revised policy.",
    ],
  },
  {
    number: "10",
    title: "Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us at info@mohancabs.in or call +91 79043 77385.",
      "Our support team is available 24/7 to assist you with any privacy-related queries.",
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy &amp;<br />
            <span className="text-blue-500 italic">Policy.</span>
          </h1>
          <p className="mt-4 text-gray-400 text-[15px] max-w-lg">
            Last updated: June 2026. Learn how we collect, use, and protect your personal information.
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
            <h2 className="text-2xl font-black text-white">Have questions about your data?</h2>
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
