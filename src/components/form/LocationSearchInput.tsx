"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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

      {/* Search suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-surface-muted transition-colors group"
            >
              <MapPin size={14} className="text-text-tertiary group-hover:text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                <p className="text-xs text-text-tertiary truncate">{s.fullName}</p>
              </div>
              {s.zone && (
                <span className="ml-auto text-[10px] text-text-tertiary bg-surface-muted rounded px-1.5 py-0.5 shrink-0">
                  {s.zone}
                </span>
              )}
            </button>
          ))}
        </div>
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
