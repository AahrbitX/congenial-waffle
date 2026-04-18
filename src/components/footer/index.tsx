import Link from "next/link";
import { Car, Mail, Phone } from "lucide-react";

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
    <footer className="w-full border-t border-divider bg-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Car className="text-primary w-6 h-6" />
              <span className="font-bold text-xl tracking-tight uppercase">
                Mohan Cabs
              </span>
            </Link>
            <p className="text-default-500 text-sm max-w-xs leading-relaxed">
              Premium transportation services tailored for your comfort.
              Reliable, safe, and always on time—wherever you need to go.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="p-2 rounded-full bg-default-100 hover:text-primary transition-colors"
              >
                X
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-default-100 hover:text-primary transition-colors"
              >
                Facebook
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-default-100 hover:text-primary transition-colors"
              >
                Instagram
              </Link>
            </div>
          </div>

          {/* Link Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-default-500 hover:text-primary transition-colors"
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
        <div className="mt-16 pt-8 border-t border-divider flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-default-400">
            © {currentYear} Mohan Cabs. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-default-400">
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
