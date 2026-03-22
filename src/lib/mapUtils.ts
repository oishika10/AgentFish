import { Coordinates, RouteClass } from "@/types";

export function getRouteColor(routeClass: RouteClass) {
  if (routeClass === "cheapest") return "#34d399";
  if (routeClass === "fastest") return "#60a5fa";
  if (routeClass === "sustainable") return "#a78bfa";
  return "#fb923c";
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
