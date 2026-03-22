"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { HeatmapLayer } from "./HeatmapLayer";

export function LandingMap() {
  return (
    <MapContainer
      center={[30, 0]}
      zoom={3}
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
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <HeatmapLayer />
    </MapContainer>
  );
}
