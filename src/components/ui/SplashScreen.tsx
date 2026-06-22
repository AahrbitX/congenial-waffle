"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ASSETS } from "@/constants/assets";

export function SplashScreen() {
  // Start true → splash is visible immediately on first render (no layout flash).
  // The fixed overlay covers content visually but HTML is still in the DOM for crawlers.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismiss = () => setVisible(false);

    // Wait for both: minimum display time (500ms) AND page fully loaded
    const minDelay = new Promise<void>((r) => setTimeout(r, 500));
    const pageLoad = new Promise<void>((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", () => r(), { once: true });
    });

    Promise.all([minDelay, pageLoad]).then(dismiss);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white gap-5"
        >
          <Image
            src={ASSETS.logos.primary.src}
            alt="Mohan Cabs"
            width={160}
            height={56}
            priority
          />
          {/* Animated loading bar */}
          <div className="w-16 h-0.5 rounded-full bg-accent/10 overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "120%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
