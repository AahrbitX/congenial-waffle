"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, Car, Key, Navigation, Plane, Train, Globe, Heart, Users, Briefcase, Palmtree, CalendarDays, GraduationCap, LogIn, LayoutDashboard, UserCircle } from "lucide-react";
import UserDropdown from "./userDropdown";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {ASSETS} from "@/constants/assets";

// ─── Services Dropdown Data ───────────────────────────────────────────────────

const BOOK_A_RIDE = [
  { Icon: Car,          label: "City Taxi",         desc: "Quick rides within Trivandrum",  href: "/services/city-taxi" },
  { Icon: Key,          label: "Rent a Car",         desc: "Self-drive options",             href: "/services/rent-a-car" },
  { Icon: Navigation,   label: "Outstation",         desc: "Inter-city travel packages",     href: "/services/outstation" },
  { Icon: Plane,        label: "Airport Transfer",   desc: "Reliable pickup & drop",         href: "/services/airport" },
  { Icon: Train,        label: "Railway Transfer",   desc: "Station pickup & drop",          href: "/services/railway" },
  { Icon: Globe,        label: "Nationwide Pickup",  desc: "Anywhere to Trivandrum",         href: "/services/nationwide" },
];

const SPECIAL_SERVICES = [
  { Icon: Heart,        label: "Wedding Cars",       desc: "Luxury fleet for events",        href: "/services/wedding" },
  { Icon: Users,        label: "Tempo Traveller",    desc: "Group travel solutions",          href: "/services/tempo" },
  { Icon: Briefcase,    label: "Corporate",          desc: "Business transport",              href: "/services/corporate" },
  { Icon: Palmtree,     label: "Tour Packages",      desc: "Explore Kerala",                  href: "/services/tours" },
  { Icon: CalendarDays, label: "Events",             desc: "Logistics support",               href: "/services/events" },
  { Icon: GraduationCap,label: "School",             desc: "Student transport",               href: "/services/school" },
];

// ─── Services Dropdown ────────────────────────────────────────────────────────

function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
          open ? "text-primary bg-primary-soft" : "text-text-secondary hover:text-text-primary hover:bg-border/30"
        }`}
      >
        Services
        <ChevronDown size={13} className={`opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[580px] bg-background rounded-2xl shadow-xl border border-border p-5 z-50">
          <div className="grid grid-cols-2 gap-x-8">
            {/* Book A Ride */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] text-text-muted uppercase mb-3">Book A Ride</p>
              <div className="space-y-1">
                {BOOK_A_RIDE.map(({ Icon, label, desc, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-border/30 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-border/40 flex items-center justify-center shrink-0 group-hover:bg-primary-soft transition-colors">
                      <Icon size={15} className="text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-text-primary leading-none">{label}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Special Services */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] text-text-muted uppercase mb-3">Special Services</p>
              <div className="space-y-1">
                {SPECIAL_SERVICES.map(({ Icon, label, desc, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-border/30 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-border/40 flex items-center justify-center shrink-0 group-hover:bg-primary-soft transition-colors">
                      <Icon size={15} className="text-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-text-primary leading-none">{label}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Footer link */}
          <div className="mt-4 pt-4 border-t border-border text-center">
            <Link
              href="/services"
              onClick={() => setOpen(false)}
              className="text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
            >
              View all services
              <ChevronDown size={13} className="-rotate-90" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav Links ────────────────────────────────────────────────────────────────

const navLinks = [
  { name: "Home",     href: "/" },
  { name: "About Us", href: "/about" },
  // { name: "Tours",    href: "/tours" },
  { name: "Fleet",    href: "/fleet" },
  { name: "Support",  href: "/contact" },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function LandingNavbar() {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { requireAuth } = useAuth();

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-7xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 pl-2 pr-3 py-1.5 border border-border bg-background rounded-full">
            <Image src={ASSETS.logos.minimal.src} alt={ASSETS.logos.minimal.alt} width={24} height={24} className="w-10 h-6 rounded-full" />
            <Image src={ASSETS.logos.drakfullname.src} alt={ASSETS.logos.drakfullname.alt} width={100} height={32} className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5 px-4 py-2 border border-border bg-background rounded-full">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathName === link.href ? "text-primary bg-primary-soft" : "text-text-secondary hover:text-text-primary hover:bg-border/30"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <ServicesDropdown />

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathName === link.href ? "text-primary bg-primary-soft" : "text-text-secondary hover:text-text-primary hover:bg-border/30"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:inline-block border border-border bg-background rounded-full">
            <UserDropdown />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-secondary hover:bg-border/30 rounded-lg transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background rounded-2xl mt-1 px-4 py-3 space-y-1 shadow-lg">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-text-secondary hover:bg-border/30">Home</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-text-secondary hover:bg-border/30">About Us</Link>
          <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold tracking-widest text-text-muted uppercase">Book A Ride</div>
          {BOOK_A_RIDE.map(({ label, href }) => (
            <Link key={label} href={href} onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-text-secondary hover:bg-border/30 pl-5">
              {label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-text-secondary hover:bg-border/30">Support</Link>

          {/* Divider */}
          <div className="border-t border-border my-2" />

          {/* Login / User section */}
          {session?.user ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                  <UserCircle size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{session.user.name}</p>
                  <p className="text-xs text-text-muted truncate">{session.user.email}</p>
                </div>
              </div>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg text-primary hover:bg-primary-soft transition-colors">
                <LayoutDashboard size={16} />
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <button
              onClick={() => { setIsOpen(false); requireAuth(() => {}); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              <LogIn size={16} />
              Login / Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
