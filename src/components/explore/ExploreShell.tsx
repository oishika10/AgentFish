"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Filter, LocateFixed } from "lucide-react";
import { routes } from "@/data/routes";
import { suppliers } from "@/data/suppliers";
import { complianceRules } from "@/data/complianceRules";
import { tradeAgreements } from "@/data/tradeAgreements";
import { enrichRoutes, getBestRouteByPriority } from "@/lib/costCalculator";
import { formatCurrency, formatEmissions, formatHours } from "@/lib/formatters";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { AIRecommendation } from "@/components/panels/AIRecommendation";
import { ComparisonPanel } from "@/components/panels/ComparisonPanel";
import { FiltersPanel } from "@/components/panels/FiltersPanel";
import { RouteDetailPanel } from "@/components/panels/RouteDetailPanel";
import { TradeInsightsOverlay } from "@/components/panels/TradeInsightsOverlay";
import { RouteTimelineModal } from "@/components/modals/RouteTimelineModal";
import { ScenarioToggle } from "@/components/modals/ScenarioToggle";
import { OptimizeFor } from "@/types";

const DynamicMapView = dynamic(() => import("@/components/map/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-zinc-100" />,
});

type TabId = "routes" | "compare" | "filters";

export function ExploreShell() {
  const [tab, setTab] = useState<TabId>("routes");
  const [priority, setPriority] = useState<OptimizeFor>("cost");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(routes[0]?.id ?? null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [showTradeAdvantages, setShowTradeAdvantages] = useState(true);
  const [onlyTradeRoutes, setOnlyTradeRoutes] = useState(false);
  const [minimizeImportTax, setMinimizeImportTax] = useState(false);

  const { location, loading: geoLoading, permissionDenied } = useGeolocation();

  const enriched = useMemo(
    () => enrichRoutes(routes, suppliers, complianceRules, tradeAgreements),
    [],
  );

  const filteredRoutes = useMemo(() => {
    return enriched.filter((routeItem) => {
      if (onlyTradeRoutes && !routeItem.tradeAgreementId) return false;
      if (minimizeImportTax && routeItem.costBreakdown.importTax > 1400) return false;
      return true;
    });
  }, [enriched, minimizeImportTax, onlyTradeRoutes]);

  // Override destination coordinates with the user's actual location
  const routesForMap = useMemo(
    () =>
      filteredRoutes.map((r) => ({
        ...r,
        destinationCoordinates: { lat: location.lat, lng: location.lng },
      })),
    [filteredRoutes, location],
  );

  const selectedRoute = filteredRoutes.find((routeItem) => routeItem.id === selectedRouteId) ?? null;
  const bestRoute = getBestRouteByPriority(
    filteredRoutes,
    priority === "compliance" ? "cost" : priority,
  );

  const destinationCity = location.label.split(",")[0].trim();
  const destinationCountry = location.label.split(",").slice(1).join(",").trim() || "You";

  return (
    <>
      <div className="h-screen bg-zinc-50 p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
          <aside className="flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
            <Tabs
              items={[
                { id: "routes", label: "Routes" },
                { id: "compare", label: "Compare" },
                { id: "filters", label: "Filters" },
              ]}
              active={tab}
              onChange={(id) => setTab(id as TabId)}
            />

            {tab === "routes" ? (
              <>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  <AIRecommendation route={bestRoute} />
                  <ScenarioToggle />
                  {filteredRoutes.map((routeItem) => (
                    <Card
                      key={routeItem.id}
                      className={`cursor-pointer p-3 transition-all ${
                        selectedRouteId === routeItem.id
                          ? "border-zinc-400 bg-zinc-50 shadow-md"
                          : "hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                      onClick={() => setSelectedRouteId(routeItem.id)}
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-zinc-900">
                              {routeItem.supplier.city}
                            </p>
                            <p className="text-[11px] text-zinc-400">{routeItem.supplier.country}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5 px-1">
                            <span className="h-px w-4 bg-zinc-300" />
                            <span className="text-sm text-zinc-400">✈</span>
                            <span className="h-px w-4 bg-zinc-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-zinc-900">
                              {geoLoading ? "Locating…" : destinationCity}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {geoLoading ? "" : destinationCountry}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <Badge label={routeItem.tradeAgreement?.name ?? "No FTA"} tone="warning" />
                        </div>
                      </div>
                      <p className="mb-2.5 text-xs text-zinc-500">{routeItem.supplier.name}</p>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <div className="rounded-lg bg-zinc-100 px-2 py-1.5">
                          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">Cost</p>
                          <p className="font-semibold text-zinc-800">{formatCurrency(routeItem.totalLandedCost)}</p>
                        </div>
                        <div className="rounded-lg bg-zinc-100 px-2 py-1.5">
                          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">Time</p>
                          <p className="font-semibold text-zinc-800">{formatHours(routeItem.totalDurationHours)}</p>
                        </div>
                        <div className="rounded-lg bg-zinc-100 px-2 py-1.5">
                          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">CO₂</p>
                          <p className="font-semibold text-zinc-800">{formatEmissions(routeItem.totalEmissionsKg)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {selectedRoute && (
                  <div className="max-h-[42%] shrink-0 overflow-y-auto border-t border-zinc-100 pt-2 pr-1">
                    <RouteDetailPanel route={selectedRoute} onOpenTimeline={() => setTimelineOpen(true)} />
                  </div>
                )}
              </>
            ) : null}

            {tab === "compare" ? (
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <ComparisonPanel routes={filteredRoutes} priority={priority} onPriorityChange={setPriority} />
              </div>
            ) : null}

            {tab === "filters" ? (
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <FiltersPanel
                  onlyTradeRoutes={onlyTradeRoutes}
                  onOnlyTradeRoutesChange={setOnlyTradeRoutes}
                  minimizeImportTax={minimizeImportTax}
                  onMinimizeImportTaxChange={setMinimizeImportTax}
                />
              </div>
            ) : null}
          </aside>

          <section className="relative h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <DynamicMapView
              routes={routesForMap}
              selectedRouteId={selectedRouteId}
              showTradeAdvantages={showTradeAdvantages}
              onSelectRoute={setSelectedRouteId}
              userLocation={location}
            />
            <TradeInsightsOverlay showTradeAdvantages={showTradeAdvantages} onChange={setShowTradeAdvantages} />

            <div className="pointer-events-none absolute left-4 top-4 z-[500]">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm">
                <LocateFixed
                  className={`h-3.5 w-3.5 ${
                    geoLoading
                      ? "animate-pulse text-zinc-400"
                      : permissionDenied
                        ? "text-zinc-400"
                        : "text-zinc-700"
                  }`}
                />
                <span className="text-zinc-700">
                  {geoLoading
                    ? "Detecting your location…"
                    : permissionDenied
                      ? `Using default · ${location.label}`
                      : `Delivering to · ${location.label}`}
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] grid gap-2 text-xs text-zinc-700">
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                <span className="text-zinc-500">✈</span>
                Dashed lines show shipping routes
              </div>
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                <Filter className="h-3.5 w-3.5 text-zinc-600" />
                Hover route for cost, time, CO2, import duties
              </div>
            </div>
          </section>
        </div>
      </div>

      <RouteTimelineModal open={timelineOpen} onClose={() => setTimelineOpen(false)} route={selectedRoute} />
    </>
  );
}
