"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface RouteCellProps {
  from: string;
  to: string;
}

function truncate(text: string, max = 24) {
  if (text.length <= max) return text;

  return `${text.slice(0, max)}...`;
}

export function RouteCell({ from, to }: RouteCellProps) {
  return (
    <div
      className="flex items-center gap-3 min-w-[320px] max-w-[520px]"
      title={`${from} → ${to}`}
    >
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{truncate(from)}</p>
      </div>
      <div className="relative h-7 w-14 overflow-hidden rounded-full bg-accent">
        <motion.div
          animate={{
            x: [-12, 35],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute inset-y-1 left-1 flex w-5 items-center justify-center rounded-full bg-white"
        >
          <ChevronRight size={12} className="text-accent" />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0 text-right">
        <p className="truncate text-sm font-medium">{truncate(to)}</p>
      </div>
    </div>
  );
}
