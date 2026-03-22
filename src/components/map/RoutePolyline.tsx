"use client";

import { Polyline, Tooltip } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";
import { RouteTooltip } from "@/components/map/RouteTooltip";
import { asLatLngTuple, getRouteColor, toMidPoint } from "@/lib/mapUtils";

interface RoutePolylineProps {
  route: EnrichedRoute;
  isSelected: boolean;
  dimmed: boolean;
  onSelect: (routeId: string) => void;
}

export function RoutePolyline({ route, isSelected, dimmed, onSelect }: RoutePolylineProps) {
  return (
    <>
      {route.segments.map((segment) => {
        const start = asLatLngTuple(segment.fromCoordinates.lat, segment.fromCoordinates.lng);
        const end = asLatLngTuple(segment.toCoordinates.lat, segment.toCoordinates.lng);
        const mid = toMidPoint(start, end);

        return (
          <Polyline
            key={segment.id}
            positions={[start, mid, end]}
            pathOptions={{
              color: getRouteColor(route.routeClass),
              weight: isSelected ? 6 : 3,
              opacity: dimmed ? 0.2 : isSelected ? 0.95 : 0.65,
              dashArray: isSelected ? "10 6" : undefined,
            }}
            eventHandlers={{
              click: () => onSelect(route.id),
            }}
          >
            <Tooltip sticky>
              <RouteTooltip route={route} />
            </Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}
