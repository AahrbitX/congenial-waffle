"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/Button";
import { IconMapPin, IconLoader } from "@/constants/icons";
import { reverseGeocode } from "@/utils/geocoding";

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
  const [coords,    setCoords]    = useState<LatLng>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [address,   setAddress]   = useState(initialAddress ?? "");
  const [locating,  setLocating]  = useState(true);
  const [viewport,  setViewport]  = useState({ latitude: DEFAULT_LAT, longitude: DEFAULT_LNG, zoom: 14 });
  const [mapStyle,  setMapStyle]  = useState<object | null>(null);
  const styleFetched = useRef(false);

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

  return (
    <div className="flex flex-col gap-3 mt-2">
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
