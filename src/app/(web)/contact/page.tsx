"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  HeadphonesIcon,
} from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { TextAnimate } from "@/components/ui/text-animate";

import Link from "next/link";
import { Card, Accordion } from "@heroui/react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONTACT_INFO = [
  {
    Icon: Phone,
    label: "Call Us",
    value: "+91 79043 77385",
    sub: "Available 24/7",
    href: "tel:+917904377385",
  },
  {
    Icon: Mail,
    label: "Email Us",
    value: "info@mohancabs.in",
    sub: "Reply within 24 hours",
    href: "mailto:info@mohancabs.in",
  },
  {
    Icon: MapPin,
    label: "Head Office",
    value: "Kanyakumari, Tamil Nadu",
    sub: "17-103A8, Swamynathapuram, near Ottapuli Bus Stop",
    href: "#",
  },
  {
    Icon: Clock,
    label: "Working Hours",
    value: "24 / 7 Support",
    sub: "Driver helpline always open",
    href: "#",
  },
];

const FAQS = [
  {
    q: "How do I cancel or modify my booking?",
    a: "You can cancel or modify your booking up to 2 hours before the scheduled pickup from your profile page or by calling our support line.",
  },
  {
    q: "What is the refund policy?",
    a: "Cancellations made 24+ hours before the ride are fully refunded. Cancellations within 2-24 hours attract a 20% fee. Within 2 hours, no refund is applicable.",
  },
  {
    q: "How are drivers verified?",
    a: "Every driver undergoes police background verification, license validation, vehicle inspection, and a training session before being onboarded.",
  },
  {
    q: "Can I book for someone else?",
    a: "Yes. During booking you can enter a different pickup contact number and name for the passenger.",
  },
  {
    q: "Do you offer corporate billing?",
    a: "Yes. Our corporate plan includes monthly invoicing, GST receipts, dedicated account manager, and priority dispatch.",
  },
];

const TICKET_CATEGORIES = [
  "Booking Issue",
  "Payment / Refund",
  "Driver Complaint",
  "Lost Item",
  "App / Website Issue",
  "Corporate Enquiry",
  "Other",
];

type TicketStatus = "idle" | "submitting" | "success" | "error";

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="text-[14px] font-semibold text-[#0f0f0f]">{q}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 ml-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-[13px] text-gray-500 leading-relaxed border-t border-gray-50">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Ticket Form ──────────────────────────────────────────────────────────────

function TicketForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<TicketStatus>("idle");

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    // Simulate API call — replace with real endpoint
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-lg font-extrabold text-[#0f0f0f]">
          Ticket Submitted!
        </h3>
        <p className="text-[13px] text-gray-500 max-w-xs">
          We&apos;ve received your request and will get back to you within 24
          hours at <strong>{form.email}</strong>.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setForm({
              name: "",
              email: "",
              phone: "",
              category: "",
              subject: "",
              message: "",
            });
          }}
          className="mt-2 text-[13px] font-semibold text-accenthover:text-blue-600 transition-colors"
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
            Full Name *
          </label>
          <input
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Ramesh Kumar"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
            Email *
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
          />
        </div>
      </div>

      {/* Phone + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+91 79043 77385"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
            Category *
          </label>
          <select
            required
            value={form.category}
            onChange={set("category")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition bg-white appearance-none"
          >
            <option value="" disabled>
              Select a category
            </option>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
          Subject *
        </label>
        <input
          required
          value={form.subject}
          onChange={set("subject")}
          placeholder="Brief description of your issue"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
          Message *
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={set("message")}
          placeholder="Describe your issue in detail — booking ID, date, and what happened..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition resize-none"
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-500 text-[13px]">
          <AlertCircle size={14} /> Something went wrong. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-accenthover:bg-blue-600 disabled:opacity-60 text-white font-bold text-[14px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors group"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting…
          </>
        ) : (
          <>
            Submit Ticket{" "}
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </>
        )}
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="pt-8 md:pt-0 pb-10 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="relative overflow-hidden pt-24 sm:pt-36 pb-4 sm:pb-8">
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
            {/* Tag */}
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase text-center sm:text-left">
              Contact & Support
            </p>

            {/* Heading */}
            <h1 className="text-center sm:text-left mb-3 text-5xl font-black leading-[1.05] tracking-[-0.04em] text-black sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem] md:mr-10 mt-4 max-w-xl">
              <TextAnimate once as="span" animation="blurIn">
                {"We're here "}
              </TextAnimate>
              <TextAnimate
                once
                as="span"
                animation="blurIn"
                className="text-primary"
              >
                {"to help."}
              </TextAnimate>
            </h1>

            {/* Paragraph */}
            <TextAnimate
              as="p"
              className="text-sm md:text-base text-muted text-center md:text-left mt-5 max-w-lg leading-relaxed"
            >
              Reach us by phone, email, or WhatsApp — or raise a support ticket
              below and we&apos;ll get back to you within 24 hours.
            </TextAnimate>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 px-8 sm:px-16 bg-[#f8f9fe]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_INFO.map(({ Icon, label, value, sub, href }) => (
            <Link key={label} href={href}>
              <Card className="flex flex-col gap-2 hover:-translate-y-1 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-accent transition-colors">
                  <Icon
                    size={18}
                    className="text-accent group-hover:text-white transition-colors"
                  />
                </div>
                <p className="text-[11px] font-bold tracking-widest  uppercase text-accent">
                  {label}
                </p>
                <p className="text-base font-semibold ">{value}</p>
                <p className="text-sm text-muted">{sub}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Ticket form + FAQ */}
      <section className="py-10 px-8 sm:px-16 bg-white  ">
        <div className="mx-auto grid grid-cols-1 gap-16 max-w-2xl">
          {/* FAQ */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <HeadphonesIcon size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                  FAQ
                </p>
                <h2 className="text-2xl font-black tracking-tight">
                  Common Questions
                </h2>
              </div>
            </div>
            <div className="space-y-3">
              <Accordion className="w-full max-w-2xl">
                {FAQS.map((item, index) => (
                  <Accordion.Item key={index}>
                    <Accordion.Heading>
                      <Accordion.Trigger>
                        {item.q}
                        <Accordion.Indicator>
                          <ChevronDown />
                        </Accordion.Indicator>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body>{item.a}</Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>

            {/* WhatsApp quick link */}
            <a
              href="https://wa.me/917904377385"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-4 bg-[#f0fdf4] border border-green-100 rounded-2xl px-6 py-4 hover:bg-green-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 text-white">
                <BsWhatsapp />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-gray-800">
                  Chat with us on WhatsApp
                </p>
                <p className="text-[12px] text-gray-400">
                  Usually replies within minutes
                </p>
              </div>
              <ArrowRight
                size={15}
                className="text-gray-400 group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="px-8 sm:px-16 pb-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-72">
            <iframe
              title="Mohan Cabs Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.204!2d77.5385!3d8.0883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04ef8f1f7c9b9b%3A0x0!2sSwamynathapuram%2C%20Kanyakumari%2C%20Tamil%20Nadu%20629702!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
