const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export interface GeoResult {
  name: string;
  lat: number;
  lng: number;
}

/** Returns road distance in km (1 decimal), or null if routing failed. */
export async function getRouteDistance(
  pickupLat: number, pickupLng: number,
  dropLat:   number, dropLng:   number,
): Promise<number | null> {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/` +
    `${pickupLng},${pickupLat};${dropLng},${dropLat}` +
    `?access_token=${TOKEN}&overview=false`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    const meters: number | undefined = data.routes?.[0]?.distance;
    if (meters == null) return null;
    return Math.round((meters / 1000) * 10) / 10; // 1 decimal place in km
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${TOKEN}&country=IN&language=en`
  );
  const data = await res.json();
  return (data.features?.[0]?.place_name as string) ?? "";
}

export async function forwardGeocode(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${TOKEN}&country=IN&language=en&limit=5`
  );
  const data = await res.json();
  return (data.features ?? []).map((f: any) => ({
    name: f.place_name as string,
    lng: f.center[0] as number,
    lat: f.center[1] as number,
  }));
}
