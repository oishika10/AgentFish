"use client";

import { useState } from "react";
import L from "leaflet";
import { Polyline, Tooltip, Marker } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";
import { RouteTooltip } from "@/components/map/RouteTooltip";
import { useWorldCopyLngOffsetsForLngSpan } from "@/hooks/useWorldCopyLngOffsets";
import {
  getBearing,
  getRouteColor,
  greatCircleArc,
  shiftLngPath,
  unwrapLongitudes,
} from "@/lib/mapUtils";

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
    route.destinationCoordinates,
    route.supplier.coordinates,
  );

  // Unwrap longitudes so the arc is one continuous path (may exceed ±180°).
  // Duplicate that path at ±360° steps so the line appears in every map copy
  // when the basemap tiles repeat horizontally.
  const arc = unwrapLongitudes(rawArc);
  const lngs = arc.map((p) => p[1]);
  const lngMin = Math.min(...lngs);
  const lngMax = Math.max(...lngs);
  const lngOffsets = useWorldCopyLngOffsetsForLngSpan(lngMin, lngMax);
  const midIndex = Math.floor(arc.length / 2);
  const midPoint = arc[midIndex];
  const bearingFrom = arc[Math.max(0, midIndex - 3)];
  const bearingTo = arc[Math.min(arc.length - 1, midIndex + 3)];
  const bearing = arc.length > 1 ? getBearing(bearingFrom, bearingTo) : 0;
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
      {lngOffsets.map((lngOffset) => {
        const positions = shiftLngPath(arc, lngOffset);
        return (
          <Polyline
            key={`${route.id}-${lngOffset}`}
            positions={positions}
            pathOptions={pathOptions}
            eventHandlers={sharedHandlers}
          >
            <Tooltip sticky>
              <RouteTooltip route={route} />
            </Tooltip>
          </Polyline>
        );
      })}

      {!dimmed &&
        midPoint &&
        lngOffsets.map((lngOffset) => (
          <Marker
            key={`${route.id}-plane-${lngOffset}`}
            position={shiftLngPath([midPoint], lngOffset)[0]}
            icon={planeIcon}
            eventHandlers={sharedHandlers}
          />
        ))}
    </>
  );
}
