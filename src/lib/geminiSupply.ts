import {
  Coordinates,
  RouteClass,
  RouteCostBreakdown,
  RouteSegment,
  ShippingRoute,
  Supplier,
  TradeConfidence,
  TransportMode,
} from "@/types";

/** Parsed shape from Gemini JSON (loosely validated). */
export interface GeminiSupplierOptionRaw {
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  products: string[];
  certifications: string[];
  tariffRatePercent: number;
  importTaxPercent: number;
  importTaxUsd: number;
  dutiesBeforeAgreementUsd: number;
  dutiesAfterAgreementUsd: number;
  baseShippingUsd: number;
  handlingFeesUsd: number;
  landedCostUsd: number;
  deliveryTimeDays: number;
  estimatedEmissionsKg: number;
  tradeAgreementId: "cusma" | "cptpp" | "ceta" | "ckfta" | null;
  tradeSavingsPercent: number;
  routeClass: RouteClass;
  confidence: TradeConfidence;
  complianceNotes: string[];
  primaryTransportMode: TransportMode;
}

export interface GeminiSupplySearchRaw {
  destinationLabel: string;
  destinationCoordinates: Coordinates;
  suppliers: GeminiSupplierOptionRaw[];
}

const ROUTE_CLASSES: RouteClass[] = ["cheapest", "fastest", "sustainable", "tradeAdvantage"];
const CONFIDENCE: TradeConfidence[] = ["high", "medium", "low"];
const MODES: TransportMode[] = ["truck", "ship", "rail", "air"];
type TradeAgreementId = NonNullable<GeminiSupplierOptionRaw["tradeAgreementId"]>;
const TRADE_IDS: TradeAgreementId[] = ["cusma", "cptpp", "ceta", "ckfta"];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function num(n: unknown, fallback: number) {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function str(n: unknown, fallback: string) {
  return typeof n === "string" && n.trim().length ? n.trim() : fallback;
}

function strArr(n: unknown): string[] {
  if (!Array.isArray(n)) return [];
  return n.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function haversineKm(a: Coordinates, b: Coordinates) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function normalizeRouteClass(value: unknown): RouteClass {
  return ROUTE_CLASSES.includes(value as RouteClass) ? (value as RouteClass) : "cheapest";
}

function normalizeConfidence(value: unknown): TradeConfidence {
  return CONFIDENCE.includes(value as TradeConfidence) ? (value as TradeConfidence) : "medium";
}

function normalizeMode(value: unknown): TransportMode {
  return MODES.includes(value as TransportMode) ? (value as TransportMode) : "ship";
}

function normalizeTradeId(value: unknown): TradeAgreementId | null {
  if (value === null || value === undefined) return null;
  const id = String(value);
  return TRADE_IDS.includes(id as TradeAgreementId) ? (id as TradeAgreementId) : null;
}

export function normalizeGeminiSupply(raw: unknown): GeminiSupplySearchRaw | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const dest = obj.destinationCoordinates;
  if (!dest || typeof dest !== "object") return null;
  const d = dest as Record<string, unknown>;
  const destLat = num(d.lat, 43.6532);
  const destLng = num(d.lng, -79.3832);
  const suppliersIn = obj.suppliers;
  if (!Array.isArray(suppliersIn) || suppliersIn.length === 0) return null;

  const suppliers: GeminiSupplierOptionRaw[] = suppliersIn.slice(0, 8).map((item, index) => {
    const s = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const lat = num(s.latitude, 0);
    const lng = num(s.longitude, 0);
    const landed = Math.round(num(s.landedCostUsd, 25000));
    const days = clamp(Math.round(num(s.deliveryTimeDays, 14)), 1, 120);
    return {
      name: str(s.name, `Supplier ${index + 1}`),
      country: str(s.country, "Unknown"),
      city: str(s.city, "Unknown"),
      latitude: lat || 20 + index * 0.1,
      longitude: lng || 0,
      products: strArr(s.products).length ? strArr(s.products) : ["general"],
      certifications: strArr(s.certifications),
      tariffRatePercent: clamp(num(s.tariffRatePercent, 5), 0, 100),
      importTaxPercent: clamp(num(s.importTaxPercent, 5), 0, 50),
      importTaxUsd: Math.round(num(s.importTaxUsd, 800)),
      dutiesBeforeAgreementUsd: Math.round(num(s.dutiesBeforeAgreementUsd, 1200)),
      dutiesAfterAgreementUsd: Math.round(num(s.dutiesAfterAgreementUsd, 600)),
      baseShippingUsd: Math.round(num(s.baseShippingUsd, 4000)),
      handlingFeesUsd: Math.round(num(s.handlingFeesUsd, 400)),
      landedCostUsd: landed,
      deliveryTimeDays: days,
      estimatedEmissionsKg: Math.round(num(s.estimatedEmissionsKg, 1200)),
      tradeAgreementId: normalizeTradeId(s.tradeAgreementId),
      tradeSavingsPercent: clamp(num(s.tradeSavingsPercent, 10), 0, 100),
      routeClass: normalizeRouteClass(s.routeClass),
      confidence: normalizeConfidence(s.confidence),
      complianceNotes: strArr(s.complianceNotes).length
        ? strArr(s.complianceNotes)
        : ["Verify HS classification and origin documentation"],
      primaryTransportMode: normalizeMode(s.primaryTransportMode),
    };
  });

  return {
    destinationLabel: str(obj.destinationLabel, "Destination"),
    destinationCoordinates: { lat: destLat, lng: destLng },
    suppliers,
  };
}

export function buildSuppliersAndRoutesFromGemini(data: GeminiSupplySearchRaw): {
  suppliers: Supplier[];
  routes: ShippingRoute[];
} {
  const suppliers: Supplier[] = [];
  const routes: ShippingRoute[] = [];

  data.suppliers.forEach((opt, index) => {
    const supplierId = `ai-sup-${index}`;
    const from: Coordinates = { lat: opt.latitude, lng: opt.longitude };
    const to = data.destinationCoordinates;
    const distanceKm = Math.round(haversineKm(from, to));
    const durationHours = Math.max(6, opt.deliveryTimeDays * 24);

    const supplier: Supplier = {
      id: supplierId,
      name: opt.name,
      country: opt.country,
      city: opt.city,
      coordinates: from,
      products: opt.products,
      certifications: opt.certifications.length ? opt.certifications : ["Unverified"],
      sustainabilityRating: clamp(95 - index * 2, 40, 95),
      priceRange: [
        Math.round(opt.landedCostUsd * 0.92),
        Math.round(opt.landedCostUsd * 1.08),
      ],
    };
    suppliers.push(supplier);

    const costBreakdown: RouteCostBreakdown = {
      baseShipping: opt.baseShippingUsd,
      importTax: opt.importTaxUsd,
      dutiesBeforeAgreement: opt.dutiesBeforeAgreementUsd,
      dutiesAfterAgreement: opt.dutiesAfterAgreementUsd,
      handlingFees: opt.handlingFeesUsd,
      tariffRatePercent: opt.tariffRatePercent,
      importTaxPercent: opt.importTaxPercent,
    };

    const segment: RouteSegment = {
      id: `ai-seg-${index}`,
      mode: opt.primaryTransportMode,
      from: `${opt.city} (supplier)`,
      to: data.destinationLabel,
      fromCoordinates: from,
      toCoordinates: to,
      distanceKm: distanceKm || 1000,
      durationHours,
      costUsd: opt.baseShippingUsd,
      emissionsKg: opt.estimatedEmissionsKg,
    };

    const route: ShippingRoute = {
      id: `ai-route-${index}`,
      supplierId,
      destinationLabel: data.destinationLabel,
      destinationCoordinates: to,
      routeType: "direct",
      routeClass: opt.routeClass,
      segments: [segment],
      tradeAgreementId: opt.tradeAgreementId ?? undefined,
      tradeSavingsPercent: opt.tradeSavingsPercent,
      confidence: opt.confidence,
      complianceNotes: opt.complianceNotes,
      costBreakdown,
      totalLandedCost: opt.landedCostUsd,
      totalDurationHours: durationHours,
      totalEmissionsKg: opt.estimatedEmissionsKg,
    };
    routes.push(route);
  });

  return { suppliers, routes };
}

export function extractJsonFromModelText(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
