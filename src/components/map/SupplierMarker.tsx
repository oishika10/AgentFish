"use client";

import { Marker, Popup } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";

interface SupplierMarkerProps {
  route: EnrichedRoute;
}

export function SupplierMarker({ route }: SupplierMarkerProps) {
  const { supplier } = route;
  return (
    <Marker position={[supplier.coordinates.lat, supplier.coordinates.lng]}>
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
  );
}
