"use client";

import { CircleMarker, Popup } from "react-leaflet";

interface UserLocationMarkerProps {
  lat: number;
  lng: number;
}

export function UserLocationMarker({ lat, lng }: UserLocationMarkerProps) {
  return (
    <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.9 }}>
      <Popup>
        <p className="text-xs font-medium">Your location (Canada)</p>
      </Popup>
    </CircleMarker>
  );
}
