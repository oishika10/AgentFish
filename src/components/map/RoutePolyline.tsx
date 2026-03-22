"use client";

import L from "leaflet";
import { Polyline, Tooltip, Marker } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";
import { RouteTooltip } from "@/components/map/RouteTooltip";
import { getBearing, getRouteColor, greatCircleArc, splitAtAntimeridian } from "@/lib/mapUtils";

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

  // Split the arc wherever it crosses ±180° so Leaflet doesn't draw a
  // line all the way across the map (antimeridian crossing issue).
  const segments = splitAtAntimeridian(arcPositions);

  // Airplane marker — use the true midpoint of the full (unsplit) arc
  const midIndex = Math.floor(arcPositions.length / 2);
  const midPoint = arcPositions[midIndex];
  const bearingFrom = arcPositions[Math.max(0, midIndex - 3)];
  const bearingTo = arcPositions[Math.min(arcPositions.length - 1, midIndex + 3)];
  const bearing = arcPositions.length > 1 ? getBearing(bearingFrom, bearingTo) : 0;
  const planeRotation = bearing - 90;

  const planeIcon = L.divIcon({
    className: "",
    html: `<span style="display:block;transform:rotate(${planeRotation}deg);font-size:15px;filter:grayscale(1) brightness(0.3);line-height:1;user-select:none;">✈</span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const pathOptions = {
    color: isSelected ? "#111827" : getRouteColor(route.routeClass),
    weight: isSelected ? 2.5 : 1.5,
    opacity: dimmed ? 0.12 : isSelected ? 0.95 : 0.45,
    dashArray: isSelected ? "10 7" : "6 6",
    lineCap: "round" as const,
    lineJoin: "round" as const,
  };

  return (
    <>
      {segments.map((seg, idx) => (
        <Polyline
          key={idx}
          positions={seg}
          pathOptions={pathOptions}
          eventHandlers={{ click: () => onSelect(route.id) }}
        >
          {/* Only attach the tooltip to the first segment */}
          {idx === 0 && (
            <Tooltip sticky>
              <RouteTooltip route={route} />
            </Tooltip>
          )}
        </Polyline>
      ))}

      {!dimmed && midPoint && (
        <Marker
          position={midPoint}
          icon={planeIcon}
          eventHandlers={{ click: () => onSelect(route.id) }}
        />
      )}
    </>
  );
}
