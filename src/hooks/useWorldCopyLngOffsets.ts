"use client";

import { useMemo, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { worldCopyLngOffsetsForLngRange } from "@/lib/mapUtils";

/** Recomputes when the map viewport changes (pan / zoom / resize). */
function useViewportEpoch() {
  const [v, setV] = useState(0);
  useMapEvents({
    moveend: () => setV((x) => x + 1),
    zoomend: () => setV((x) => x + 1),
    resize: () => setV((x) => x + 1),
    load: () => setV((x) => x + 1),
  });
  return v;
}

export function useWorldCopyLngOffsetsForPoint(lng: number) {
  const map = useMap();
  const viewportEpoch = useViewportEpoch();
  return useMemo(() => {
    void viewportEpoch;
    const b = map.getBounds();
    return worldCopyLngOffsetsForLngRange(lng, lng, b.getWest(), b.getEast());
  }, [map, viewportEpoch, lng]);
}

export function useWorldCopyLngOffsetsForLngSpan(lngMin: number, lngMax: number) {
  const map = useMap();
  const viewportEpoch = useViewportEpoch();
  return useMemo(() => {
    void viewportEpoch;
    const b = map.getBounds();
    return worldCopyLngOffsetsForLngRange(lngMin, lngMax, b.getWest(), b.getEast());
  }, [map, viewportEpoch, lngMin, lngMax]);
}
