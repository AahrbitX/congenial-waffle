"use client";

import { useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LocationPickerMap, type LatLng } from "./LocationPickerMap";
import {
  IconMapPin,
  IconClock,
  IconLoader,
  IconLocate,
} from "@/constants/icons";
import {
  forwardGeocode,
  reverseGeocode,
  type GeoResult,
} from "@/utils/geocoding";
import { useRides } from "@/hooks/useRides";

interface LocationInputProps {
  value: string;
  onChange: (address: string, coords?: LatLng) => void;
  placeholder?: string;
  className?: string;
  /** Called instead of opening the map / dropdown directly — use for auth gating */
  onBeforeOpen?: (open: () => void) => void;
}

export function LocationInput({
  value,
  onChange,
  placeholder = "Pickup location",
  className,
  onBeforeOpen,
}: LocationInputProps) {
  const [showMap, setShowMap] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [loadingSug, setLoadingSug] = useState(false);
  const [locating, setLocating] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recent places from ride history
  const { data: rides } = useRides();
  const recentPlaces = useMemo(() => {
    if (!rides) return [];
    const seen = new Set<string>();
    const places: string[] = [];
    for (const r of rides) {
      if (r.from && !seen.has(r.from)) {
        seen.add(r.from);
        places.push(r.from);
      }
      if (r.to && !seen.has(r.to)) {
        seen.add(r.to);
        places.push(r.to);
      }
    }
    return places.slice(0, 5);
  }, [rides]);

  const openDropdown = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setShowDropdown(true);
  };

  const handleFocus = () => {
    if (onBeforeOpen) {
      onBeforeOpen(openDropdown);
    } else {
      openDropdown();
    }
  };

  const handleBlur = () => {
    // Delay so onMouseDown on dropdown items fires before blur closes it
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSug(true);
      const results = await forwardGeocode(val);
      setSuggestions(results);
      setLoadingSug(false);
    }, 350);
  };

  const handleSelectRecent = (place: string) => {
    onChange(place);
    setShowDropdown(false);
  };

  const handleSelectSuggestion = (result: GeoResult) => {
    onChange(result.name, { lat: result.lat, lng: result.lng });
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: pos }) => {
        const addr = await reverseGeocode(pos.latitude, pos.longitude);
        onChange(addr, { lat: pos.latitude, lng: pos.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  };

  const handleToggleMap = () => {
    if (showMap) {
      setShowMap(false);
      return;
    }
    if (onBeforeOpen) {
      onBeforeOpen(() => setShowMap(true));
    } else {
      setShowMap(true);
    }
  };

  const showingRecent = !value.trim() && recentPlaces.length > 0;
  const showingSuggestions =
    !!value.trim() && (suggestions.length > 0 || loadingSug);
  const dropdownVisible = showDropdown && (showingRecent || showingSuggestions);

  return (
    <div className={className}>
      {/* Input row */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pr-16 px-3 py-2 text-sm rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {/* Current location button */}
        <button
          type="button"
          onClick={handleLocate}
          title="Use current location"
          disabled={locating}
          className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors text-text-muted hover:text-primary disabled:opacity-50"
        >
          {locating ? (
            <IconLoader size={14} className="animate-spin" />
          ) : (
            <IconLocate size={14} />
          )}
        </button>
        {/* Map pin button */}
        <button
          type="button"
          onClick={handleToggleMap}
          title="Pin on map"
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
            showMap ? "text-primary" : "text-text-muted hover:text-primary"
          }`}
        >
          <IconMapPin size={15} />
        </button>

        {/* Dropdown — portal so it floats above overflow:hidden containers */}
        {dropdownVisible && dropdownRect && typeof document !== "undefined" && createPortal(
          <div
            style={{ position: "fixed", top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width, zIndex: 9999 }}
            className="bg-background border border-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
          >
            {/* Recent section */}
            {showingRecent && (
              <>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                  Recent
                </p>
                {recentPlaces.map((place) => (
                  <button
                    key={place}
                    type="button"
                    onMouseDown={() => handleSelectRecent(place)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-border/30 transition-colors"
                  >
                    <IconClock size={13} className="shrink-0 text-text-muted" />
                    <span className="truncate text-text-primary">{place}</span>
                  </button>
                ))}
              </>
            )}

            {/* Suggestions section */}
            {showingSuggestions && (
              <>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                  Suggestions
                </p>
                {loadingSug ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-muted">
                    <IconLoader size={13} className="animate-spin shrink-0" />
                    Searching…
                  </div>
                ) : (
                  suggestions.map((r) => (
                    <button
                      key={r.name}
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(r)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-border/30 transition-colors"
                    >
                      <IconMapPin size={13} className="shrink-0 text-primary" />
                      <span className="truncate text-text-primary">{r.name}</span>
                    </button>
                  ))
                )}
              </>
            )}
          </div>,
          document.body
        )}
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
