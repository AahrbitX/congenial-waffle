"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LocationPickerMap, type LatLng } from "./LocationPickerMap";
import { IconMapPin } from "@/constants/icons";

interface LocationInputProps {
  value: string;
  onChange: (address: string, coords?: LatLng) => void;
  placeholder?: string;
  className?: string;
  /** Called instead of opening the map directly — use for auth gating */
  onBeforeOpen?: (open: () => void) => void;
}

export function LocationInput({ value, onChange, placeholder = "Pickup location", className, onBeforeOpen }: LocationInputProps) {
  const [showMap, setShowMap] = useState(false);

  const handleToggle = () => {
    if (showMap) { setShowMap(false); return; }
    if (onBeforeOpen) { onBeforeOpen(() => setShowMap(true)); }
    else { setShowMap(true); }
  };

  return (
    <div className={className}>
      {/* Text input row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={handleToggle}
          title="Pin on map"
          className={`p-2 rounded-xl border transition-colors ${
            showMap
              ? "bg-primary text-white border-primary"
              : "bg-background border-border text-text-secondary hover:text-primary hover:border-primary"
          }`}
        >
          <IconMapPin size={16} />
        </button>
      </div>

      {/* Inline map picker */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <LocationPickerMap
              initialAddress={value}
              onConfirm={(addr, coords) => {
                onChange(addr, coords);
                setShowMap(false);
              }}
              onCancel={() => setShowMap(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
