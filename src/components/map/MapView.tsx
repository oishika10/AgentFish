"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { EnrichedRoute } from "@/lib/costCalculator";
import { UserLocation } from "@/hooks/useGeolocation";
import { RoutePolyline } from "@/components/map/RoutePolyline";
import { SupplierMarker } from "@/components/map/SupplierMarker";
import { UserLocationMarker } from "@/components/map/UserLocationMarker";

interface MapViewProps {
  routes: EnrichedRoute[];
  selectedRouteId: string | null;
  comparedRouteIds: string[];
  showTradeAdvantages: boolean;
  onSelectRoute: (routeId: string) => void;
  onCompareRoute: (routeId: string) => void;
  userLocation: UserLocation;
}

function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

export function MapView({ routes, selectedRouteId, comparedRouteIds, showTradeAdvantages, onSelectRoute, onCompareRoute, userLocation }: MapViewProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={3}
      style={{ height: "100%", width: "100%" }}
      zoomControl
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapCenterUpdater lat={userLocation.lat} lng={userLocation.lng} />
      <UserLocationMarker lat={userLocation.lat} lng={userLocation.lng} label={userLocation.label} />

      {routes.map((route) => {
        const dimmed = showTradeAdvantages && !route.tradeAgreementId;
        return (
          <RoutePolyline
            key={route.id}
            route={route}
            isSelected={selectedRouteId === route.id}
            isCompared={comparedRouteIds.includes(route.id)}
            dimmed={dimmed}
            onSelect={onSelectRoute}
            onCompare={onCompareRoute}
          />
        );
      })}

      {routes.map((route) => (
        <SupplierMarker key={`${route.id}-supplier`} route={route} />
      ))}
    </MapContainer>
  );
}
