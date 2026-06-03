"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { ASSETS } from "@/constants/assets";
import { FaXTwitter, FaFacebook, FaInstagram } from "react-icons/fa6";

const SOCIAL_LINKS = [
  { name: "X (Twitter)", href: "#", icon: FaXTwitter },
  { name: "Facebook",    href: "#", icon: FaFacebook },
  { name: "Instagram",   href: "#", icon: FaInstagram },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Services",
      links: [
        { name: "Local Rides", href: "/services#local" },
        { name: "Outstation", href: "/services#outstation" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Terms & Conditions", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Safety", href: "/safety" },
        { name: "Contact Us", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-border bg-background pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={ASSETS.logos.minimal.src}
                alt={ASSETS.logos.minimal.alt}
                width={24}
                height={24}
                className="rounded-full w-10 h-6"
              />
              <Image
                src={ASSETS.logos.darkFullName.src}
                alt={ASSETS.logos.darkFullName.alt}
                width={100}
                height={24}
                className="hidden sm:inline-block h-8"
              />
            </Link>

            <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
              Premium transportation services tailored for your comfort.
              Reliable, safe, and always on time—wherever you need to go.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={name}
                  className="p-2 rounded-full bg-border/40 hover:text-primary transition-colors"
                >
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6 text-text-primary">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            © {currentYear} Mohan Cabs. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Phone size={14} className="text-primary" /> +91 98765 43210
            </span>
            <span className="flex items-center gap-1">
              <Mail size={14} className="text-primary" /> support@mohandcabs.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
