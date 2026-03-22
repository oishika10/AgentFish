"use client";

import { Polyline, Tooltip } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";
import { RouteTooltip } from "@/components/map/RouteTooltip";
import { getRouteColor, greatCircleArc } from "@/lib/mapUtils";

interface RoutePolylineProps {
  route: EnrichedRoute;
  isSelected: boolean;
  dimmed: boolean;
  onSelect: (routeId: string) => void;
}

export function RoutePolyline({ route, isSelected, dimmed, onSelect }: RoutePolylineProps) {
  const arcPositions = greatCircleArc(
    route.supplier.coordinates,
    route.destinationCoordinates,
  );

  return (
    <Polyline
      positions={arcPositions}
      pathOptions={{
        color: getRouteColor(route.routeClass),
        weight: isSelected ? 3 : 1.5,
        opacity: dimmed ? 0.12 : isSelected ? 0.9 : 0.4,
        lineCap: "round",
        lineJoin: "round",
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
}
