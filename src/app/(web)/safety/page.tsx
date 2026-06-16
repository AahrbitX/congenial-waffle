import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "Your safety is our top priority. Learn about Mohan Cabs' driver verification, vehicle checks, trip monitoring, emergency assistance and women's safety features.",
  alternates: { canonical: "/safety" },
};

const SECTIONS = [
  {
    number: "01",
    title: "Driver Verification",
    content: [
      "Every driver on the Mohan Cabs platform undergoes a thorough background check before onboarding. This includes police verification, identity validation, and license authenticity checks.",
      "All drivers hold valid commercial driving licenses (badge) and are required to renew their documents periodically. Non-compliant drivers are immediately suspended from the platform.",
      "Drivers are trained on passenger safety, emergency protocols, and professional conduct standards before their first ride.",
    ],
  },
  {
    number: "02",
    title: "Vehicle Safety",
    content: [
      "All vehicles on our platform are inspected for roadworthiness before being approved. We verify valid PUC certificates, insurance, and fitness certificates.",
      "Vehicles are required to be clean, well-maintained, and equipped with functioning seatbelts for all passengers. Air conditioning is available in AC-category vehicles.",
      "We conduct periodic re-inspections and act on passenger reports of substandard vehicles promptly.",
    ],
  },
  {
    number: "03",
    title: "Trip Monitoring",
    content: [
      "Each booking generates a unique tracking link that can be shared with family or friends so they can follow your ride in real time.",
      "Our operations team monitors active rides and is alerted to any significant deviations from the planned route.",
      "Drivers are required to follow the agreed route. Any unauthorised detours can be reported immediately to our support team.",
    ],
  },
  {
    number: "04",
    title: "Emergency Assistance",
    content: [
      "In case of any emergency during a ride, contact local emergency services (100 for police, 108 for ambulance) immediately.",
      "Our 24/7 support line (+91 79043 77385) is available for urgent safety concerns. Share your booking reference for faster assistance.",
      "If you feel unsafe at any point, you have the right to end the ride and exit the vehicle in a safe location. Your safety always takes precedence.",
    ],
  },
  {
    number: "05",
    title: "Passenger Code of Conduct",
    content: [
      "We expect all passengers to treat drivers with respect. Abusive language, threatening behaviour, or physical harm toward drivers will result in immediate account suspension.",
      "Passengers must wear seatbelts at all times during the journey. This is both a legal requirement and a critical safety measure.",
      "Smoking, consuming alcohol, and carrying illegal substances or weapons inside the vehicle are strictly prohibited.",
    ],
  },
  {
    number: "06",
    title: "Women's Safety",
    content: [
      "Female passengers travelling alone can share their live trip details with a trusted contact using our trip-sharing feature.",
      "All driver profiles are visible to passengers before the ride begins. If you feel uncomfortable at any point, you may cancel and request a new booking.",
      "We have a dedicated process for handling complaints from female passengers, with priority response and investigation timelines.",
    ],
  },
  {
    number: "07",
    title: "Reporting Safety Issues",
    content: [
      "To report a safety concern, contact us at info@mohancabs.in or call +91 79043 77385 with your booking reference and a description of the incident.",
      "All safety reports are treated with strict confidentiality. We investigate every report and take appropriate action, including removing drivers from the platform when necessary.",
      "Your feedback makes our platform safer for everyone. We encourage all passengers to report any concerns, no matter how minor they may seem.",
    ],
  },
];

export default function SafetyPage() {
  return (
    <main className="w-full bg-white">
      {/* Hero */}
      <section className="min-h-[40vh] flex flex-col justify-end px-8 sm:px-16 pt-36 pb-16 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[55vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="absolute top-24 right-16 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="relative z-10">
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">
            Trust &amp; Safety · Mohan Cabs
          </span>
          <h1 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f]">
            Your Safety
            <br />
            <span className="text-blue-500 italic">Comes First.</span>
          </h1>
          <p className="mt-4 text-gray-400 text-[15px] max-w-lg">
            Learn about the measures we take to keep every journey safe,
            comfortable, and reliable.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-8 sm:px-16 bg-[#f8f9fe]">
        <div className="max-w-4xl mx-auto space-y-12">
          {SECTIONS.map(({ number, title, content }) => (
            <div
              key={number}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
            >
              <p className="text-[11px] font-bold text-blue-500 tracking-widest uppercase mb-3">
                {number}
              </p>
              <h2 className="text-xl font-black text-[#0f0f0f] mb-5">
                {title}
              </h2>
              <div className="space-y-3">
                {content.map((para, i) => (
                  <p
                    key={i}
                    className="text-[14px] text-gray-500 leading-relaxed"
                  >
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
            <h2 className="text-2xl font-black text-white">
              Have a safety concern?
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Our support team is available 24/7.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-white text-blue-500 font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group shrink-0"
          >
            Contact Us
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
