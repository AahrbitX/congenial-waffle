"use client";

import { useState } from "react";
import {
  Phone, Mail, MapPin, Clock, MessageSquare, ChevronDown,
  CheckCircle, AlertCircle, Loader2, ArrowRight, HeadphonesIcon,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONTACT_INFO = [
  {
    Icon: Phone,
    label: "Call Us",
    value: "+91 98765 43210",
    sub: "Mon – Sat, 8am – 8pm",
    href: "tel:+919876543210",
  },
  {
    Icon: Mail,
    label: "Email Us",
    value: "support@mohanscabs.com",
    sub: "Reply within 24 hours",
    href: "mailto:support@mohanscabs.com",
  },
  {
    Icon: MapPin,
    label: "Head Office",
    value: "Trivandrum, Kerala",
    sub: "MG Road, Near Central Station",
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
    a: "Cancellations made 24+ hours before the ride are fully refunded. Cancellations within 2–24 hours attract a 20% fee. Within 2 hours, no refund is applicable.",
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
    name: "", email: "", phone: "", category: "", subject: "", message: "",
  });
  const [status, setStatus] = useState<TicketStatus>("idle");

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

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
        <h3 className="text-lg font-extrabold text-[#0f0f0f]">Ticket Submitted!</h3>
        <p className="text-[13px] text-gray-500 max-w-xs">
          We&apos;ve received your request and will get back to you within 24 hours at <strong>{form.email}</strong>.
        </p>
        <button
          onClick={() => { setStatus("idle"); setForm({ name: "", email: "", phone: "", category: "", subject: "", message: "" }); }}
          className="mt-2 text-[13px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
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
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Full Name *</label>
          <input
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Ramesh Kumar"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Email *</label>
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
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+91 98765 43210"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Category *</label>
          <select
            required
            value={form.category}
            onChange={set("category")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition bg-white appearance-none"
          >
            <option value="" disabled>Select a category</option>
            {TICKET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Subject *</label>
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
        <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Message *</label>
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
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-[14px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors group"
      >
        {status === "submitting" ? (
          <><Loader2 size={16} className="animate-spin" /> Submitting…</>
        ) : (
          <>Submit Ticket <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
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
      <section className="pt-36 pb-16 px-8 sm:px-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">Contact & Support</span>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f] mt-4 max-w-2xl">
            We&apos;re here<br />
            <span className="text-blue-500 italic">to help.</span>
          </h1>
          <p className="text-gray-400 text-[15px] mt-4 max-w-lg leading-relaxed">
            Reach us by phone, email, or WhatsApp — or raise a support ticket below and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 px-8 sm:px-16 bg-[#f8f9fe]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_INFO.map(({ Icon, label, value, sub, href }) => (
            <a
              key={label}
              href={href}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <Icon size={18} className="text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">{label}</p>
              <p className="text-[14px] font-extrabold text-[#0f0f0f]">{value}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Ticket form + FAQ */}
      <section className="py-20 px-8 sm:px-16 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Support ticket */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <MessageSquare size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Support Ticket</p>
                <h2 className="text-[1.4rem] font-black text-[#0f0f0f] tracking-tight">Raise a Request</h2>
              </div>
            </div>
            <TicketForm />
          </div>

          {/* FAQ */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <HeadphonesIcon size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">FAQ</p>
                <h2 className="text-[1.4rem] font-black text-[#0f0f0f] tracking-tight">Common Questions</h2>
              </div>
            </div>
            <div className="space-y-3">
              {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
            </div>

            {/* WhatsApp quick link */}
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-4 bg-[#f0fdf4] border border-green-100 rounded-2xl px-6 py-4 hover:bg-green-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-gray-800">Chat with us on WhatsApp</p>
                <p className="text-[12px] text-gray-400">Usually replies within minutes</p>
              </div>
              <ArrowRight size={15} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="px-8 sm:px-16 pb-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-72 bg-[#e8edf5] flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">MG Road, Trivandrum, Kerala</p>
              <p className="text-[12px] text-gray-400">Embed your Google Maps iframe here</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
