"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";

interface SupplierMarkerProps {
  route: EnrichedRoute;
}

export function SupplierMarker({ route }: SupplierMarkerProps) {
  const { supplier } = route;
  return (
    <CircleMarker
      center={[supplier.coordinates.lat, supplier.coordinates.lng]}
      radius={4}
      pathOptions={{ color: "#475569", fillColor: "#94a3b8", fillOpacity: 0.9, weight: 1.5 }}
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
    </CircleMarker>
  );
}
