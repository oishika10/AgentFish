export type OptimizeFor = "cost" | "speed" | "sustainability" | "compliance";
export type RouteClass = "cheapest" | "fastest" | "sustainable" | "tradeAdvantage";
export type TransportMode = "truck" | "ship" | "rail" | "air";
export type TradeConfidence = "high" | "medium" | "low";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  city: string;
  coordinates: Coordinates;
  products: string[];
  certifications: string[];
  sustainabilityRating: number;
  priceRange: [number, number];
}

export interface TradeAgreement {
  id: string;
  name: string;
  eligibleCountries: string[];
  productCategories: string[];
  tariffReductionPercent: number;
  customsClearanceBoostPercent: number;
  requiredDocuments: string[];
}

export interface ComplianceRule {
  country: string;
  baseDutyPercent: number;
  importTaxPercent: number;
  restrictedProducts: string[];
  requiredDocuments: string[];
}

export interface RouteSegment {
  id: string;
  mode: TransportMode;
  from: string;
  to: string;
  fromCoordinates: Coordinates;
  toCoordinates: Coordinates;
  distanceKm: number;
  durationHours: number;
  costUsd: number;
  emissionsKg: number;
}

export interface RouteCostBreakdown {
  baseShipping: number;
  importTax: number;
  dutiesBeforeAgreement: number;
  dutiesAfterAgreement: number;
  handlingFees: number;
  /** Estimated tariff rate (%) when sourced from AI or external estimates */
  tariffRatePercent?: number;
  /** Estimated import-side tax rate (%) when sourced from AI or external estimates */
  importTaxPercent?: number;
}

export interface ShippingRoute {
  id: string;
  supplierId: string;
  destinationLabel: string;
  destinationCoordinates: Coordinates;
  routeType: "direct" | "multiModal" | "alternative";
  routeClass: RouteClass;
  segments: RouteSegment[];
  tradeAgreementId?: string;
  tradeSavingsPercent: number;
  confidence: TradeConfidence;
  complianceNotes: string[];
  costBreakdown: RouteCostBreakdown;
  totalLandedCost: number;
  totalDurationHours: number;
  totalEmissionsKg: number;
}
