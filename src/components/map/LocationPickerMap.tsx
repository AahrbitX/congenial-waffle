"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/Button";
import { IconMapPin, IconLoader, IconSearch, IconX } from "@/constants/icons";
import { reverseGeocode, forwardGeocode, type GeoResult } from "@/utils/geocoding";

type MapMoveEvent = { viewState: { latitude: number; longitude: number; zoom: number } };

// ── Constants ─────────────────────────────────────────────────────────────────

const API_KEY      = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY!;
const STYLE_URL    = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`;
const BROKEN_LAYER = "3d_model_data";
const DEFAULT_LNG  = 76.9366;
const DEFAULT_LAT  = 8.5241; // Trivandrum

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LatLng { lat: number; lng: number }

interface LocationPickerMapProps {
  initialAddress?: string;
  onConfirm: (address: string, coords: LatLng) => void;
  onCancel: () => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export function LocationPickerMap({ initialAddress, onConfirm, onCancel }: LocationPickerMapProps) {
  const [coords,      setCoords]      = useState<LatLng>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [address,     setAddress]     = useState(initialAddress ?? "");
  const [locating,    setLocating]    = useState(true);
  const [viewport,    setViewport]    = useState({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG, zoom: 14 });
  const [mapStyle,    setMapStyle]    = useState<object | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [searching,   setSearching]   = useState(false);
  const styleFetched  = useRef(false);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch & pre-filter style so the broken 3d_model_data layer never reaches MapLibre
  useEffect(() => {
    if (styleFetched.current) return;
    styleFetched.current = true;
    fetch(STYLE_URL)
      .then((r) => r.json())
      .then((style) =>
        setMapStyle({
          ...style,
          layers: (style.layers ?? []).filter((l: any) => l.id !== BROKEN_LAYER),
        })
      )
      .catch(() => setMapStyle({}));
  }, []);

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
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkerDrag = useCallback(async (e: any) => {
    const loc = { lat: e.lngLat.lat, lng: e.lngLat.lng };
    setCoords(loc);
    const addr = await reverseGeocode(loc.lat, loc.lng);
    setAddress(addr);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await forwardGeocode(val);
        setSuggestions(results);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (s: GeoResult) => {
    const loc = { lat: s.lat, lng: s.lng };
    setCoords(loc);
    setViewport((v) => ({ ...v, latitude: loc.lat, longitude: loc.lng, zoom: 16 }));
    setAddress(s.name);
    setSearchQuery(s.name);
    setSuggestions([]);
  };

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          {searching
            ? <IconLoader size={14} className="text-muted shrink-0 animate-spin" />
            : <IconSearch size={14} className="text-muted shrink-0" />}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search for a place…"
            className="flex-1 text-sm bg-transparent outline-none text-accent placeholder:text-muted"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSuggestions([]); }}
              className="p-0.5 rounded text-muted hover:text-accent"
            >
              <IconX size={13} />
            </button>
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelectSuggestion(s)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-surface-muted transition-colors flex items-start gap-2"
              >
                <IconMapPin size={13} className="text-primary shrink-0 mt-0.5" />
                <span className="text-accent leading-snug">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-56 rounded-xl overflow-hidden border border-border">
        {locating || !mapStyle ? (
          <div className="h-full flex items-center justify-center bg-border/20 text-sm text-text-muted gap-2">
            <IconLoader size={16} className="animate-spin" />
            {locating ? "Detecting your location…" : "Loading map…"}
          </div>
        ) : (
          <Map
            {...viewport}
            onMove={(e: MapMoveEvent) => setViewport(e.viewState)}
            mapStyle={mapStyle}
            style={{ width: "100%", height: "100%" }}
            transformRequest={(url: string) => {
              if (url.startsWith("https://api.olamaps.io")) {
                const sep = url.includes("?") ? "&" : "?";
                return { url: `${url}${sep}api_key=${API_KEY}` };
              }
              return { url };
            }}
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

      {/* Drag hint */}
      <p className="text-xs text-text-muted text-center -mt-1">
        Pin not accurate? Drag it to your exact location.
      </p>

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
