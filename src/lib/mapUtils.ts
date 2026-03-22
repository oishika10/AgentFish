import { Coordinates, RouteClass } from "@/types";

export function getRouteColor(routeClass: RouteClass) {
  if (routeClass === "cheapest") return "#1f2937";
  if (routeClass === "fastest") return "#374151";
  if (routeClass === "sustainable") return "#4b5563";
  return "#6b7280";
}

export function getBearing(from: [number, number], to: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);
  const dLng = toRad(to[1] - from[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function asLatLngTuple(lat: number, lng: number): [number, number] {
  return [lat, lng];
}

export function greatCircleArc(
  from: Coordinates,
  to: Coordinates,
  numPoints = 60,
): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const lat1 = toRad(from.lat);
  const lng1 = toRad(from.lng);
  const lat2 = toRad(to.lat);
  const lng2 = toRad(to.lng);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2,
      ),
    );

  if (d < 1e-10) return [[from.lat, from.lng]];

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const a = Math.sin((1 - f) * d) / Math.sin(d);
    const b = Math.sin(f * d) / Math.sin(d);
    const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
    const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);
    points.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
  }

  return points;
}

/**
 * Split a great-circle arc into sub-arrays wherever it crosses the antimeridian
 * (±180° longitude). Without this, Leaflet draws a straight line all the way
 * across the world map instead of continuing on the other side.
 */
export function splitAtAntimeridian(points: [number, number][]): [number, number][][] {
  if (points.length < 2) return [points];

  const segments: [number, number][][] = [];
  let current: [number, number][] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prevLng = current[current.length - 1][1];
    const currLng = points[i][1];
    const diff = currLng - prevLng;

    if (Math.abs(diff) > 180) {
      // Antimeridian crossing — close current segment and start a new one
      if (current.length > 1) segments.push(current);
      current = [points[i]];
    } else {
      current.push(points[i]);
    }
  }

  if (current.length > 1) segments.push(current);
  return segments.length > 0 ? segments : [points];
}
