"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/Button";
import { IconMapPin, IconSearch, IconLoader } from "@/constants/icons";
import { forwardGeocode, reverseGeocode } from "@/utils/geocoding";
import type { GeoResult } from "@/utils/geocoding";

type MapMoveEvent = { viewState: { latitude: number; longitude: number; zoom: number } };

// ── Constants ─────────────────────────────────────────────────────────────────

const TOKEN        = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const DEFAULT_LNG  = 76.9366;
const DEFAULT_LAT  = 8.5241; // Trivandrum

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LatLng { lat: number; lng: number }

interface LocationPickerMapProps {
  initialAddress?: string;
  onConfirm: (address: string, coords: LatLng) => void;
  onCancel: () => void;
}

// ── Search box ────────────────────────────────────────────────────────────────

function PlaceSearch({ onPlace }: { onPlace: (name: string, coords: LatLng) => void }) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<GeoResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const r = await forwardGeocode(val);
      setResults(r);
      setLoading(false);
    }, 350);
  };

  const handleSelect = (r: GeoResult) => {
    setQuery(r.name);
    setResults([]);
    onPlace(r.name, { lat: r.lat, lng: r.lng });
  };

  return (
    <div className="relative">
      <div className="relative">
        <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search for a location…"
          className="w-full pl-8 pr-8 py-2 text-sm rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {loading && (
          <IconLoader size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-muted" />
        )}
      </div>

      {results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          {results.map((r) => (
            <li key={r.name}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full flex items-start gap-2 px-3 py-2.5 text-sm text-left hover:bg-border/30 transition-colors"
              >
                <IconMapPin size={13} className="mt-0.5 shrink-0 text-primary" />
                <span className="line-clamp-2 text-text-primary">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LocationPickerMap({ initialAddress, onConfirm, onCancel }: LocationPickerMapProps) {
  const [coords,   setCoords]   = useState<LatLng>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [address,  setAddress]  = useState(initialAddress ?? "");
  const [locating, setLocating] = useState(true);
  const [viewport, setViewport] = useState({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG, zoom: 14 });

  // Auto-detect GPS on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords: pos }) => {
        const loc = { lat: pos.latitude, lng: pos.longitude };
        setCoords(loc);
        setViewport((v) => ({ ...v, latitude: loc.lat, longitude: loc.lng }));
        setLocating(false);
        if (!initialAddress) {
          const addr = await reverseGeocode(loc.lat, loc.lng);
          setAddress(addr);
        }
      },
      () => setLocating(false),
      { timeout: 6000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkerDrag = useCallback(async (e: any) => {
    const loc = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    setCoords(loc);
    const addr = await reverseGeocode(loc.lat, loc.lng);
    setAddress(addr);
  }, []);

  const handlePlace = useCallback((name: string, loc: LatLng) => {
    setAddress(name);
    setCoords(loc);
    setViewport((v) => ({ ...v, latitude: loc.lat, longitude: loc.lng, zoom: 15 }));
  }, []);

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Search */}
      <PlaceSearch onPlace={handlePlace} />

      {/* Map */}
      <div className="h-56 rounded-xl overflow-hidden border border-border">
        {locating ? (
          <div className="h-full flex items-center justify-center bg-border/20 text-sm text-text-muted gap-2">
            <IconLoader size={16} className="animate-spin" />
            Detecting your location…
          </div>
        ) : (
          <Map
            {...viewport}
            onMove={(e: MapMoveEvent) => setViewport(e.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={TOKEN}
            style={{ width: "100%", height: "100%" }}
          >
            <NavigationControl position="top-right" showCompass={false} />
            <Marker
              latitude={coords.lat}
              longitude={coords.lng}
              draggable
              onDragEnd={handleMarkerDrag}
              anchor="bottom"
            >
              <IconMapPin size={32} className="text-primary drop-shadow-md" />
            </Marker>
          </Map>
        )}
      </div>

      {/* Address preview */}
      {address && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-primary-soft text-sm text-primary">
          <IconMapPin size={14} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{address}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1"
          disabled={!address}
          onClick={() => onConfirm(address, coords)}
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
