"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";
import { useWorldCopyLngOffsetsForPoint } from "@/hooks/useWorldCopyLngOffsets";
import { shiftLngPoint } from "@/lib/mapUtils";

interface SupplierMarkerProps {
  route: EnrichedRoute;
}

export function SupplierMarker({ route }: SupplierMarkerProps) {
  const { supplier } = route;
  const lngOffsets = useWorldCopyLngOffsetsForPoint(supplier.coordinates.lng);

  const icon = L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:9px;height:9px;background:#374151;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.35);flex-shrink:0;"></div>
        <div style="margin-top:3px;font-size:10px;font-weight:600;color:#1f2937;background:rgba(255,255,255,0.92);padding:1px 6px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.12);line-height:1.4;">${supplier.city}</div>
      </div>
    `,
    iconSize: [90, 32],
    iconAnchor: [45, 9],
  });

  return (
    <>
      {lngOffsets.map((lngOffset) => (
        <Marker
          key={lngOffset}
          position={shiftLngPoint(
            supplier.coordinates.lat,
            supplier.coordinates.lng,
            lngOffset,
          )}
          icon={icon}
        >
          <Popup>
            <div className="space-y-1 text-xs">
              <p className="font-semibold">{supplier.name}</p>
              <p>
                {supplier.city}, {supplier.country}
              </p>
              <p>Products: {supplier.products.join(", ")}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
