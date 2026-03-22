import { RouteClass } from "@/types";

export function getRouteColor(routeClass: RouteClass) {
  if (routeClass === "cheapest") return "#22c55e";
  if (routeClass === "fastest") return "#3b82f6";
  if (routeClass === "sustainable") return "#8b5cf6";
  return "#f97316";
}

export function toMidPoint(a: [number, number], b: [number, number]) {
  return [(a[0] + b[0]) / 2 + 8, (a[1] + b[1]) / 2] as [number, number];
}

export function asLatLngTuple(lat: number, lng: number): [number, number] {
  return [lat, lng];
}
