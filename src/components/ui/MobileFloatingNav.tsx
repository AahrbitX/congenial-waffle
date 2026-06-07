"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  BadgeIndianRupee,
  CalendarCheck,
  Car,
  LayoutDashboard,
  Menu,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { name: "Dispatchers", href: "/admin/dispatchers", icon: Users },
  { name: "Users", href: "/admin/users", icon: User },
  { name: "Drivers", href: "/admin/drivers", icon: Car },
  { name: "Payments", href: "/admin/payments", icon: BadgeIndianRupee },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
];

export function MobileFloatingNav() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 md:hidden print:hidden">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
            />

            {/* Navigation Items */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.92 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 24,
              }}
              className="absolute bottom-20 right-0 flex w-[220px] flex-col gap-2 rounded-3xl border border-divider bg-background/95 p-2 shadow-2xl backdrop-blur-xl"
            >
              {navLinks.map((link, index) => {
                const Icon = link.icon;

                const isActive =
                  pathname === link.href ||
                  (link.href !== "/admin" && pathname.startsWith(link.href));

                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{
                      delay: index * 0.04,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-lg"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon size={18} />

                      <span>{link.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => setOpen((p) => !p)}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl ring-4 ring-background"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={open ? "close" : "menu"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
