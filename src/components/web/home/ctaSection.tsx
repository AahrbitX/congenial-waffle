"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";

function CtaSection() {
  return (
    <div className="px-4 sm:px-12 pt-5 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-accent rounded-3xl px-6 md:px-10 sm:px-16 py-8 md:py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <h2 className="text-[2.2rem] sm:text-[2.6rem] font-extrabold text-white leading-[1.15] tracking-tight max-w-md">
            Ready to ride with{" "}
            <span className="text-white/80">Mohan Cabs?</span>
          </h2>
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
            <p className="text-white/70 text-sm font-medium">
              Join 5 lakh+ happy riders today
            </p>
            <Link href="/login">
              <Button
                fullWidth
                variant="secondary"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-accent font-bold text-[15px] border-none hover:bg-white/90 h-auto"
              >
                Create Free Account
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CtaSection };
