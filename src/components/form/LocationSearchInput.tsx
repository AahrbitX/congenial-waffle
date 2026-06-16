"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin, X, Loader2, Map } from "lucide-react";
import { cn } from "@heroui/react";
import { LocationPickerMap } from "@/components/map/LocationPickerMap";

export interface LocationResult {
  name: string;
  zone: string;
  lat:  number;
  lng:  number;
}

interface Suggestion {
  id:       string;
  name:     string;
  fullName: string;
  zone:     string;
  lat:      number;
  lng:      number;
}

interface LocationSearchInputProps {
  label:       string;
  placeholder: string;
  value:       string;
  onSelect:    (result: LocationResult) => void;
  onClear:     () => void;
  required?:   boolean;
  className?:  string;
}

export function LocationSearchInput({
  label,
  placeholder,
  value,
  onSelect,
  onClear,
  required,
  className,
}: LocationSearchInputProps) {
  const [query, setQuery]             = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isOpen, setIsOpen]           = useState(false);
  const [selected, setSelected]       = useState(!!value);
  const [showMap, setShowMap]         = useState(false);

  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  // Sync incoming value (e.g. on form reset)
  useEffect(() => {
    setQuery(value);
    setSelected(!!value);
    if (!value) { setSuggestions([]); setShowMap(false); }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(q)}`);
      const data = await res.json();

      const items: Suggestion[] = (data.predictions ?? []).map((p: any) => ({
        id:       p.place_id ?? p.reference,
        name:     p.structured_formatting?.main_text ?? p.description,
        fullName: p.description,
        zone:     "",
        lat:      p.geometry?.location?.lat,
        lng:      p.geometry?.location?.lng,
      }));

      setSuggestions(items);
      if (items.length > 0 && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
      setIsOpen(items.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 320);
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name);
    setSelected(true);
    setIsOpen(false);
    setSuggestions([]);
    setShowMap(false);
    onSelect({ name: s.name, zone: s.zone, lat: s.lat, lng: s.lng });
  };

  const handleClear = () => {
    setQuery("");
    setSelected(false);
    setSuggestions([]);
    setIsOpen(false);
    setShowMap(false);
    onClear();
    inputRef.current?.focus();
  };

  // Called when user confirms a pin from the map picker
  const handleMapConfirm = (address: string, coords: { lat: number; lng: number }) => {
    setQuery(address);
    setSelected(true);
    setShowMap(false);
    setSuggestions([]);
    onSelect({ name: address, zone: "", lat: coords.lat, lng: coords.lng });
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>

      {/* Input row */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-surface-muted px-3 h-10 transition-colors",
          isOpen ? "border-primary ring-1 ring-primary/20" : "border-border",
        )}
      >
        <MapPin size={15} className="text-text-tertiary shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none min-w-0"
        />
        {isLoading && (
          <Loader2 size={14} className="text-text-tertiary animate-spin shrink-0" />
        )}
        {selected && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-text-tertiary hover:text-text-primary shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        )}
        {/* Map toggle */}
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          title={showMap ? "Hide map" : "Pin on map"}
          className={cn(
            "shrink-0 p-0.5 rounded transition-colors",
            showMap
              ? "text-primary"
              : "text-text-tertiary hover:text-primary",
          )}
        >
          <Map size={15} />
        </button>
      </div>

      {/* Search suggestions dropdown — portal so it floats above modal/overflow containers */}
      {isOpen && suggestions.length > 0 && dropdownRect && typeof document !== "undefined" && createPortal(
        <div
          style={{ position: "fixed", top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width, zIndex: 9999 }}
          className="bg-background border border-border rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto"
        >
          <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-widest text-muted uppercase">Suggestions</p>
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted">
              <Loader2 size={13} className="animate-spin shrink-0" />
              Searching…
            </div>
          ) : (
            suggestions.slice(0, 6).map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-border/30 transition-colors"
              >
                <MapPin size={13} className="shrink-0 text-primary" />
                <span className="truncate">{s.fullName}</span>
              </button>
            ))
          )}
        </div>,
        document.body
      )}

      {/* Inline map picker */}
      {showMap && (
        <div className="mt-2 rounded-xl border border-border overflow-hidden bg-surface">
          <LocationPickerMap
            initialAddress={selected ? query : undefined}
            onConfirm={handleMapConfirm}
            onCancel={() => setShowMap(false)}
          />
        </div>
      )}
    </div>
  );
}
