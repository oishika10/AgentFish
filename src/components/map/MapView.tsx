"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";
import { RoutePolyline } from "@/components/map/RoutePolyline";
import { SupplierMarker } from "@/components/map/SupplierMarker";
import { UserLocationMarker } from "@/components/map/UserLocationMarker";

interface MapViewProps {
  routes: EnrichedRoute[];
  selectedRouteId: string | null;
  showTradeAdvantages: boolean;
  onSelectRoute: (routeId: string) => void;
}

export function MapView({ routes, selectedRouteId, showTradeAdvantages, onSelectRoute }: MapViewProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer center={[43.6532, -79.3832]} zoom={3} style={{ height: "100%", width: "100%" }} zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <UserLocationMarker lat={43.6532} lng={-79.3832} />

      {routes.map((route) => {
        const dimmed = showTradeAdvantages && !route.tradeAgreementId;
        return (
          <RoutePolyline
            key={route.id}
            route={route}
            isSelected={selectedRouteId === route.id}
            dimmed={dimmed}
            onSelect={onSelectRoute}
          />
        );
      })}

      {routes.map((route) => (
        <SupplierMarker key={`${route.id}-supplier`} route={route} />
      ))}
    </MapContainer>
  );
}
