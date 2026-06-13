export interface GeoResult {
  name: string;
  lat: number;
  lng: number;
}

/** Returns road distance in km (1 decimal) via backend proxy, or null if routing failed. */
export async function getRouteDistance(
  pickupLat: number, pickupLng: number,
  dropLat:   number, dropLng:   number,
): Promise<number | null> {
  try {
    const params = new URLSearchParams({
      pickupLat: String(pickupLat),
      pickupLng: String(pickupLng),
      dropLat:   String(dropLat),
      dropLng:   String(dropLng),
    });
    const res  = await fetch(`/api/distance?${params}`);
    const data = await res.json();
    return data.distanceKm ?? null;
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res  = await fetch(`/api/places/reverse-geocode?latlng=${lat},${lng}`);
  const data = await res.json();
  const result = data.results?.[0];
  return (result?.formatted_address ?? result?.name ?? "") as string;
}

/** Autocomplete suggestions for real-time search dropdowns */
export async function forwardGeocode(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  const res  = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
  const data = await res.json();
  return (data.predictions ?? []).map((p: any) => ({
    name: p.description as string,
    lat:  p.geometry?.location?.lat as number,
    lng:  p.geometry?.location?.lng as number,
  }));
}

/** Geocode a complete address string into coordinates */
export async function geocodeAddress(address: string): Promise<GeoResult[]> {
  if (!address.trim()) return [];
  const res  = await fetch(`/api/places/geocode?address=${encodeURIComponent(address)}`);
  const data = await res.json();
  return (data.geocodingResults ?? []).map((r: any) => ({
    name: r.formatted_address as string,
    lat:  r.geometry?.location?.lat as number,
    lng:  r.geometry?.location?.lng as number,
  }));
}
