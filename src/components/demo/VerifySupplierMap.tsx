"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { getMapRasterConfig } from "@/lib/mapTiles";

const SUPPLIERS = [
  { id: "1", lat: 25.6866, lng: -100.3161, name: "Monterrey Precision Metals", verified: true, note: "TCC vetted · 12 successful shipments" },
  { id: "2", lat: 22.5431, lng: 114.0579, name: "Shenzhen Nova Components", verified: true, note: "Trade commissioner site visit · 2024" },
  { id: "3", lat: 13.7563, lng: 100.5018, name: "Bangkok Electronics Co.", verified: false, note: "No commissioner record" },
  { id: "4", lat: 16.0544, lng: 108.2022, name: "Da Nang Textile Collective", verified: true, note: "CBSA-aligned docs · 8 shipments" },
] as const;

export function VerifySupplierMap() {
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const raster = getMapRasterConfig();

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const visible = showVerifiedOnly ? SUPPLIERS.filter((s) => s.verified) : SUPPLIERS;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-600">
          Layer: suppliers with Canadian trade network signals vs. unknown legitimacy risk.
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-700">
          <input
            type="checkbox"
            checked={showVerifiedOnly}
            onChange={(e) => setShowVerifiedOnly(e.target.checked)}
            className="rounded border-zinc-300"
          />
          Verified only
        </label>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50" style={{ height: 280 }}>
        <MapContainer center={[20, 110]} zoom={3} minZoom={2} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer url={raster.url} attribution={raster.attribution} />
          {visible.map((s) => (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={s.verified ? 11 : 9}
              pathOptions={{
                color: s.verified ? "#059669" : "#a1a1aa",
                fillColor: s.verified ? "#34d399" : "#e4e4e7",
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <div className="max-w-[200px] p-1 text-xs">
                  <div className="flex items-center gap-1 font-semibold text-zinc-900">
                    {s.verified ? (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    {s.name}
                  </div>
                  <p className="mt-0.5 text-zinc-600">{s.note}</p>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-emerald-600" /> Verified (TCC / shipment history)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-zinc-300 ring-2 ring-zinc-400" /> Unverified
        </span>
      </div>
    </div>
  );
}
