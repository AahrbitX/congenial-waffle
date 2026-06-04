"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ASSETS } from "@/constants/assets";

export default function RedirectingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const to = searchParams.get("to") ?? "/dashboard/overview";
  const navigated = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!navigated.current) {
        navigated.current = true;
        router.replace(to);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [to, router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-primary">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <Image
          src={ASSETS.logos.whiteBlueBackground.src}
          alt={ASSETS.logos.whiteBlueBackground.alt}
          width={160}
          height={160}
          priority
        />

        {/* Loading bar — sits directly below the logo */}
        <motion.div
          className="relative w-32 h-1 rounded-full bg-white/20 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full w-10 rounded-full bg-white"
            animate={{ x: ["-40px", "88px", "-40px"] }}
            transition={{ duration: 1.4, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
