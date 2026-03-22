"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { HeatmapLayer } from "./HeatmapLayer";
import { UserLocationMarker } from "@/components/map/UserLocationMarker";
import { UserLocation } from "@/hooks/useGeolocation";

interface LandingMapProps {
  userLocation?: UserLocation | null;
}

export function LandingMap({ userLocation }: LandingMapProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [30, 0];

  return (
    <MapContainer
      center={center}
      zoom={userLocation ? 5 : 3}
      minZoom={2}
      maxZoom={18}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
      attributionControl={false}
      dragging={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
      />
      <HeatmapLayer />
      {userLocation && (
        <UserLocationMarker lat={userLocation.lat} lng={userLocation.lng} label={userLocation.label} />
      )}
    </MapContainer>
  );
}
