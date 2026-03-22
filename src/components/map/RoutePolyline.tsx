"use client";

import { useState } from "react";
import L from "leaflet";
import { Polyline, Tooltip, Marker } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";
import { RouteTooltip } from "@/components/map/RouteTooltip";
import { getBearing, getRouteColor, greatCircleArc, splitAtAntimeridian, unwrapLongitudes } from "@/lib/mapUtils";

interface RoutePolylineProps {
  route: EnrichedRoute;
  isSelected: boolean;
  isCompared: boolean;
  dimmed: boolean;
  onSelect: (routeId: string) => void;
  onCompare: (routeId: string) => void;
}

export function RoutePolyline({ route, isSelected, isCompared, dimmed, onSelect, onCompare }: RoutePolylineProps) {
  const [hovered, setHovered] = useState(false);
  const rawArc = greatCircleArc(
    route.supplier.coordinates,
    route.destinationCoordinates,
  );

  // Split at the antimeridian so every coordinate stays within [-180°, 180°]
  // and all segments render on the same world copy in Leaflet.
  const segments = splitAtAntimeridian(rawArc);

  // Unwrap the raw arc (may exceed ±180°) only for the midpoint & bearing
  // calculation so the plane icon sits at the true geographic midpoint.
  const unwrapped = unwrapLongitudes(rawArc);
  const midIndex = Math.floor(unwrapped.length / 2);
  const midPoint = rawArc[midIndex]; // use canonical coordinates for the marker
  const bearingFrom = unwrapped[Math.max(0, midIndex - 3)];
  const bearingTo = unwrapped[Math.min(unwrapped.length - 1, midIndex + 3)];
  const bearing = unwrapped.length > 1 ? getBearing(bearingFrom, bearingTo) : 0;
  const planeRotation = bearing - 90;

  const planeIcon = L.divIcon({
    className: "",
    html: `<span style="display:block;transform:rotate(${planeRotation}deg);font-size:15px;filter:grayscale(1) brightness(0.3);line-height:1;user-select:none;">✈</span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const pathOptions = {
    color: isCompared
      ? "#2563eb"
      : isSelected
        ? "#111827"
        : getRouteColor(route.routeClass),
    weight: hovered ? 3.5 : isCompared ? 3 : isSelected ? 2.5 : 1.5,
    opacity: dimmed ? 0.12 : hovered ? 0.95 : isCompared ? 0.88 : isSelected ? 0.95 : 0.45,
    dashArray: isCompared ? undefined : isSelected ? "10 7" : "6 6",
    lineCap: "round" as const,
    lineJoin: "round" as const,
  };

  const sharedHandlers = {
    click: () => { onSelect(route.id); onCompare(route.id); },
    mouseover: () => setHovered(true),
    mouseout: () => setHovered(false),
  };

  return (
    <>
      {segments.map((seg, idx) => (
        <Polyline
          key={idx}
          positions={seg}
          pathOptions={pathOptions}
          eventHandlers={sharedHandlers}
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
          eventHandlers={sharedHandlers}
        />
      )}
    </>
  );
}
