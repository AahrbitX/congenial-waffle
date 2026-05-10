"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Users, Award, Clock, Star } from "lucide-react";

// ─── Scroll Animation Hook ────────────────────────────────────────────────────

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "20+", label: "Years of Service" },
  { value: "5L+", label: "Happy Riders" },
  { value: "500+", label: "Verified Drivers" },
  { value: "24/7", label: "Support Available" },
];

const TIMELINE = [
  {
    year: "2005",
    title: "The Beginning",
    desc: "Founded in Trivandrum with a single car and a vision to give Kerala a cab service that truly shows up.",
    side: "left",
  },
  {
    year: "2010",
    title: "Growing Roots",
    desc: "Expanded to 50+ drivers across Trivandrum district. Word of mouth became our biggest marketing tool.",
    side: "right",
  },
  {
    year: "2016",
    title: "New Horizons",
    desc: "Launched outstation and airport transfer packages. Kerala's highways became our playground.",
    side: "left",
  },
  {
    year: "2021",
    title: "One Lakh Rides",
    desc: "Crossed 1 lakh rides and introduced corporate plans for businesses across the state.",
    side: "right",
  },
  {
    year: "2025",
    title: "All of Kerala",
    desc: "5 lakh+ riders. 500+ drivers. Every district covered. The mission hasn't changed — only the scale.",
    side: "left",
  },
];

const TESTIMONIALS = [
  {
    rating: 5,
    text: "Booked for my parents' hospital visit. Driver was polite, punctual, and helped them with their bags. Absolutely top-notch.",
    name: "Ramesh K.",
    location: "Delhi · Regular Customer",
    initial: "R",
    color: "#e8f3ff",
  },
  {
    rating: 5,
    text: "The airport package saved me so much stress. Flight was delayed and the driver waited without extra charges. Will always use Mohans Cabs!",
    name: "Priya S.",
    location: "Mumbai · Frequent Traveller",
    initial: "P",
    color: "#d1fae5",
  },
  {
    rating: 5,
    text: "Used the weekly commute plan for a month. Consistent, professional, and actually affordable. My go-to for office travel.",
    name: "Arjun T.",
    location: "Trivandrum · Daily Commuter",
    initial: "A",
    color: "#fef3c7",
  },
  {
    rating: 4,
    text: "Corporate plan is great for our team — GST invoices, professional drivers, no billing surprises. Made my admin job so much easier.",
    name: "Ankit M.",
    location: "Bangalore · HR Manager",
    initial: "M",
    color: "#ede9fe",
  },
];

const VALUES = [
  { Icon: MapPin, title: "Kerala Rooted", desc: "Born in Trivandrum, we understand Kerala roads and people better than anyone." },
  { Icon: Users, title: "Driver First", desc: "Fair earnings, flexible schedules, and continuous training for our driver partners." },
  { Icon: Award, title: "Zero Compromise", desc: "Background-checked drivers, maintained vehicles, and transparent billing — always." },
  { Icon: Clock, title: "Always Punctual", desc: "Live traffic tracking so your ride is on time, every time, no excuses." },
];

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-between px-8 sm:px-16 pt-36 pb-12 bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[55vw] h-full bg-[#f5f7ff] rounded-bl-[80px] -z-0" />
      <div className="absolute top-24 right-16 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">001 / Mohans Cabs</span>
        <Link href="/book" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-500 transition-colors group">
          Book a ride <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="relative z-10 max-w-5xl mt-16 sm:mt-0">
        <p className="text-sm font-medium text-gray-400 mb-6 tracking-wide">
          Headquartered in Trivandrum, Kerala — trusted across the state since 2005.
        </p>
        <h1 className="text-[clamp(3rem,8vw,7rem)] font-black leading-[1.05] tracking-tight text-[#0f0f0f]">
          Your ride,{" "}<br />
          <span className="text-blue-500 italic">your rules.</span><br />
          Our promise.
        </h1>
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-gray-100 pt-10 mt-10">
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <p className="text-4xl font-black text-[#0f0f0f] tracking-tight">{value}</p>
            <p className="text-sm text-gray-400 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 right-10 hidden sm:flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 [writing-mode:vertical-rl]">Scroll</span>
        <div className="w-px h-16 bg-gray-400" />
      </div>
    </section>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────

function TimelineItem({ year, title, desc, side, index }: {
  year: string; title: string; desc: string; side: string; index: number;
}) {
  const { ref, inView } = useInView(0.3);
  const isLeft = side === "left";

  const Card = (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-sm w-full">
      <p className="text-xs font-bold text-blue-500 tracking-widest mb-2 uppercase">{year}</p>
      <p className="text-base font-extrabold text-[#0f0f0f] mb-1">{title}</p>
      <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`relative grid grid-cols-[1fr_32px_1fr] gap-x-6 items-center py-6 transition-all duration-700 ease-out
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Left slot */}
      <div className="flex justify-end">
        {isLeft ? Card : null}
      </div>

      {/* Center dot — sits on top of the continuous line */}
      <div className="flex justify-center">
        <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-[#f8f9fe] shadow z-10 shrink-0" />
      </div>

      {/* Right slot */}
      <div className="flex justify-start">
        {!isLeft ? Card : null}
      </div>
    </div>
  );
}

// ─── Timeline Section ─────────────────────────────────────────────────────────

function TimelineSection() {
  const { ref: headRef, inView: headIn } = useInView(0.3);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      // start drawing when top enters viewport, finish when bottom leaves
      const progress = Math.min(1, Math.max(0, (windowH - top) / (height + windowH)));
      setLineHeight(progress * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="py-24 px-8 sm:px-16 bg-[#f8f9fe]">
      <div className="max-w-5xl mx-auto">
        <div
          ref={headRef}
          className={`text-center mb-16 transition-all duration-700 ${headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">002 / Our Journey</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight text-[#0f0f0f] mt-3">
            Two decades, one road.
          </h2>
          <p className="text-gray-400 text-[15px] mt-3 max-w-md mx-auto">
            From a single car in Trivandrum to all of Kerala — here&apos;s how we got here.
          </p>
        </div>

        {/* Timeline with scroll-driven line */}
        <div ref={containerRef} className="relative">
          {/* Track (background) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-100 -translate-x-1/2" />
          {/* Animated fill line */}
          <div
            className="absolute left-1/2 top-0 w-0.5 bg-blue-500 -translate-x-1/2 origin-top transition-none"
            style={{ height: `${lineHeight}%` }}
          />
          {TIMELINE.map((item, i) => (
            <TimelineItem key={item.year} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────

function TestimonialCard({ t, index }: { t: typeof TESTIMONIALS[0]; index: number }) {
  const { ref, inView } = useInView(0.2);
  return (
    <div
      ref={ref}
      className={`border border-gray-100 rounded-2xl p-6 shadow-sm transition-all duration-700 ease-out
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, s) => (
          <Star key={s} size={13} className={s < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
        ))}
      </div>
      <p className="text-[13px] text-gray-500 leading-[1.8] mb-5">&ldquo;{t.text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-extrabold text-[#0f0f0f] shrink-0" style={{ background: t.color }}>
          {t.initial}
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#0f0f0f]">{t.name}</p>
          <p className="text-[11px] text-gray-400">{t.location}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────────────

function TestimonialsSection() {
  const { ref: headRef, inView: headIn } = useInView(0.2);

  return (
    <section className="py-24 px-8 sm:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div
          ref={headRef}
          className={`mb-14 transition-all duration-700 ${headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">003 / Reviews</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight text-[#0f0f0f] mt-3">
            What our riders say.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Value Card ───────────────────────────────────────────────────────────────

function ValueCard({ Icon, title, desc, index }: { Icon: React.ElementType; title: string; desc: string; index: number }) {
  const { ref, inView } = useInView(0.2);
  return (
    <div
      ref={ref}
      className={`group transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <p className="text-[11px] font-bold text-gray-300 tracking-widest mb-6">0{index + 1}</p>
      <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 group-hover:bg-blue-500 transition-colors">
        <Icon size={20} className="text-blue-500 group-hover:text-white transition-colors" />
      </div>
      <p className="text-base font-extrabold text-[#0f0f0f] mb-2">{title}</p>
      <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Values Section ───────────────────────────────────────────────────────────

function ValuesSection() {
  const { ref: headRef, inView: headIn } = useInView(0.2);

  return (
    <section className="py-24 px-8 sm:px-16 bg-[#f8f9fe]">
      <div className="max-w-7xl mx-auto">
        <div
          ref={headRef}
          className={`mb-14 transition-all duration-700 ${headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase">004 / What We Stand For</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight text-[#0f0f0f] mt-3">Built on four pillars.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map(({ Icon, title, desc }, i) => (
            <ValueCard key={title} Icon={Icon} title={title} desc={desc} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="py-24 px-8 sm:px-16 bg-blue-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-tight tracking-tight max-w-xl">
          Ready to experience the difference?
        </h2>
        <Link
          href="/book"
          className="inline-flex items-center gap-3 bg-white text-blue-500 font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-blue-50 transition-colors group shrink-0"
        >
          Book Your Ride
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="w-full">
      <HeroSection />
      <TimelineSection />
      <TestimonialsSection />
      <ValuesSection />
      <CtaSection />
    </main>
  );
}
