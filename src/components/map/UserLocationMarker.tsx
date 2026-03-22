"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";

interface UserLocationMarkerProps {
  lat: number;
  lng: number;
  label?: string;
}

export function UserLocationMarker({ lat, lng, label = "Your Location" }: UserLocationMarkerProps) {
  const icon = L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:13px;height:13px;background:#111827;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);flex-shrink:0;"></div>
        <div style="margin-top:3px;font-size:10px;font-weight:700;color:#111827;background:rgba(255,255,255,0.96);padding:2px 7px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.15);line-height:1.4;">${label}</div>
      </div>
    `,
    iconSize: [120, 34],
    iconAnchor: [60, 12],
  });

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup>
        <p className="text-xs font-medium">Your destination · {label}</p>
      </Popup>
    </Marker>
  );
}
