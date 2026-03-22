"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Filter, LocateFixed, Maximize2, Minimize2 } from "lucide-react";
import { routes } from "@/data/routes";
import { suppliers } from "@/data/suppliers";
import { complianceRules } from "@/data/complianceRules";
import { tradeAgreements } from "@/data/tradeAgreements";
import { EnrichedRoute, enrichRoutes, getBestRouteByPriority } from "@/lib/costCalculator";
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
import { Scenario, ScenarioToggle } from "@/components/modals/ScenarioToggle";
import { MarketOverviewPanel } from "@/components/panels/MarketOverviewPanel";
import { OptimizeFor } from "@/types";
import { clientFriendlySupplyError, titleForSupplyErrorCode } from "@/lib/supplySearchErrors";
import { cn } from "@/lib/cn";

const DynamicMapView = dynamic(() => import("@/components/map/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-zinc-100" />,
});

type TabId = "overview" | "routes" | "compare" | "filters";

type GeminiErrorBanner = { title: string; message: string; code: string };

export function ExploreShell() {
  const searchParams = useSearchParams();
  const userType = searchParams.get("userType")?.trim() ?? "";
  const product = searchParams.get("product")?.trim() ?? "";

  const [tab, setTab] = useState<TabId>("overview");
  const [priority, setPriority] = useState<OptimizeFor>("cost");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(routes[0]?.id ?? null);
  const [comparedRouteIds, setComparedRouteIds] = useState<string[]>([]);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [showTradeAdvantages, setShowTradeAdvantages] = useState(true);
  const [tradeOverlayVisible, setTradeOverlayVisible] = useState(true);
  const [onlyTradeRoutes, setOnlyTradeRoutes] = useState(false);
  const [minimizeImportTax, setMinimizeImportTax] = useState(false);
  const [geminiRoutes, setGeminiRoutes] = useState<EnrichedRoute[] | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<GeminiErrorBanner | null>(null);
  const [scenario, setScenario] = useState<Scenario>("Baseline");
  const [marketOverview, setMarketOverview] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [sidebarWidth]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    const next = Math.min(Math.max(dragStartWidth.current + delta, 280), 900);
    setSidebarWidth(next);
  }, []);

  const onDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setComparedRouteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const { location, loading: geoLoading, permissionDenied } = useGeolocation();

  const fallbackEnriched = useMemo(
    () => enrichRoutes(routes, suppliers, complianceRules, tradeAgreements),
    [],
  );

  useEffect(() => {
    if (!userType || !product) {
      setGeminiRoutes(null);
      setGeminiError(null);
      setGeminiLoading(false);
      setMarketOverview(null);
      setSelectedRouteId(routes[0]?.id ?? null);
      return;
    }

    const controller = new AbortController();
    setGeminiLoading(true);
    setGeminiError(null);
    setMarketOverview(null);

    fetch("/api/supply-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userType, product }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          enriched?: EnrichedRoute[];
          marketOverview?: string;
          error?: string;
          code?: string;
        };

        if (!response.ok) {
          setGeminiRoutes(null);
          const code = payload.code ?? "UNKNOWN";
          setGeminiError({
            title: titleForSupplyErrorCode(code),
            message: payload.error ?? "Supplier search failed.",
            code,
          });
          setMarketOverview(
            typeof payload.marketOverview === "string" ? payload.marketOverview : null,
          );
          setSelectedRouteId(routes[0]?.id ?? null);
          return;
        }

        setMarketOverview(
          typeof payload.marketOverview === "string" ? payload.marketOverview : "",
        );

        const next = Array.isArray(payload.enriched) ? payload.enriched : [];
        if (next.length) {
          setGeminiRoutes(next);
          setSelectedRouteId(next[0]?.id ?? null);
        } else {
          setGeminiRoutes(null);
          setGeminiError({
            title: titleForSupplyErrorCode("EMPTY"),
            message: "The model returned no supplier rows. Try a different product description.",
            code: "EMPTY",
          });
          setSelectedRouteId(routes[0]?.id ?? null);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setGeminiRoutes(null);
        setMarketOverview(null);
        setGeminiError(clientFriendlySupplyError(error));
        setSelectedRouteId(routes[0]?.id ?? null);
      })
      .finally(() => {
        setGeminiLoading(false);
      });

    return () => controller.abort();
  }, [userType, product]);

  const enriched = geminiRoutes && geminiRoutes.length > 0 ? geminiRoutes : fallbackEnriched;
  const usingGemini = Boolean(geminiRoutes && geminiRoutes.length > 0);

  const filteredRoutes = useMemo(() => {
    let result = enriched.filter((routeItem) => {
      if (onlyTradeRoutes && !routeItem.tradeAgreementId) return false;
      if (minimizeImportTax && routeItem.costBreakdown.importTax > 1400) return false;
      return true;
    });

    if (scenario === "Switch supplier country") {
      // Exclude routes from the primary supplier's country (the currently selected or first route)
      const primaryCountry =
        enriched.find((r) => r.id === selectedRouteId)?.supplier.country ??
        enriched[0]?.supplier.country;
      if (primaryCountry) {
        result = result.filter((r) => r.supplier.country !== primaryCountry);
      }
    } else if (scenario === "Tariffs +10%" || scenario === "Tariffs -10%") {
      const multiplier = scenario === "Tariffs +10%" ? 1.1 : 0.9;
      result = result.map((r) => {
        const newImportTax = Math.round(r.costBreakdown.importTax * multiplier);
        const taxDelta = newImportTax - r.costBreakdown.importTax;
        return {
          ...r,
          costBreakdown: { ...r.costBreakdown, importTax: newImportTax },
          totalLandedCost: Math.round(r.totalLandedCost + taxDelta),
        };
      });
    }

    return result;
  }, [enriched, minimizeImportTax, onlyTradeRoutes, scenario, selectedRouteId]);

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
        <div className="flex h-full gap-0">
          <aside
            className="flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
            style={{ width: sidebarExpanded ? "100%" : sidebarWidth, flexShrink: 0 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Tabs
                  items={[
                    { id: "overview", label: "Overview" },
                    { id: "routes", label: "Routes" },
                    { id: "compare", label: "Compare" },
                    { id: "filters", label: "Filters" },
                  ]}
                  active={tab}
                  onChange={(id) => setTab(id as TabId)}
                />
              </div>
              <button
                type="button"
                onClick={() => setSidebarExpanded((v) => !v)}
                title={sidebarExpanded ? "Collapse panel" : "Expand to full page"}
                className="shrink-0 rounded-lg border border-zinc-200 p-1.5 text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700"
              >
                {sidebarExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>

            {userType && product ? (
              <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-xs text-zinc-700">
                <p className="font-medium text-zinc-800">Search</p>
                <p>
                  <span className="text-zinc-500">Role:</span> {userType}
                </p>
                <p>
                  <span className="text-zinc-500">Product:</span> {product}
                </p>
                {geminiLoading ? (
                  <p className="text-blue-700">Loading suppliers and market overview (single Gemini request)…</p>
                ) : null}
                {usingGemini ? (
                  <p className="text-emerald-800">
                    Showing Gemini-sourced suppliers with estimated tariffs, import taxes, duties, and lead times.
                    Verify figures with customs and your broker before committing.
                  </p>
                ) : null}
                {geminiError && !usingGemini ? (
                  <div className="flex gap-2.5 rounded-lg border border-amber-200/90 bg-amber-50 p-3 text-left shadow-sm">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                      aria-hidden
                    />
                    <div className="min-w-0 space-y-1.5">
                      <p className="font-semibold text-amber-950">{geminiError.title}</p>
                      <p className="leading-relaxed text-amber-900/95">{geminiError.message}</p>
                      <p className="border-t border-amber-200/80 pt-1.5 text-amber-800/90">
                        Showing built-in demo routes.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="h-full space-y-3 overflow-y-auto pr-1">
              <div
                className={cn(
                  "min-h-0 flex-1 flex-col",
                  tab !== "overview" && "hidden",
                )}
                aria-hidden={tab !== "overview"}
              >
                <MarketOverviewPanel
                  userType={userType}
                  product={product}
                  markdown={marketOverview}
                  loading={geminiLoading}
                  error={geminiError}
                />
              </div>

              {tab === "routes" ? (
                <>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    <AIRecommendation route={bestRoute} />
                    <ScenarioToggle scenario={scenario} onScenarioChange={setScenario} />
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
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompare(routeItem.id);
                                setTab("compare");
                              }}
                              title={comparedRouteIds.includes(routeItem.id) ? "Remove from comparison" : "Add to comparison"}
                              className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                                comparedRouteIds.includes(routeItem.id)
                                  ? "border-blue-300 bg-blue-50 text-blue-700"
                                  : "border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600"
                              }`}
                            >
                              {comparedRouteIds.includes(routeItem.id) ? "✓ Compare" : "+ Compare"}
                            </button>
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
                  <ComparisonPanel
                    routes={filteredRoutes}
                    priority={priority}
                    onPriorityChange={setPriority}
                    comparedRouteIds={comparedRouteIds}
                    onToggleCompare={toggleCompare}
                  />
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
            </div>
          </aside>

          {!sidebarExpanded && (
            <>
              {/* Drag handle */}
              <div
                role="separator"
                aria-label="Resize panel"
                onPointerDown={onDragStart}
                onPointerMove={onDragMove}
                onPointerUp={onDragEnd}
                onPointerCancel={onDragEnd}
                className="group relative mx-1 flex w-2 shrink-0 cursor-col-resize items-center justify-center"
              >
                <div className="h-12 w-1 rounded-full bg-zinc-200 transition-colors group-hover:bg-zinc-400 group-active:bg-zinc-500" />
              </div>

          <section className="relative h-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <DynamicMapView
              routes={routesForMap}
              selectedRouteId={selectedRouteId}
              comparedRouteIds={comparedRouteIds}
              showTradeAdvantages={showTradeAdvantages}
              onSelectRoute={setSelectedRouteId}
              onCompareRoute={toggleCompare}
              userLocation={location}
            />
            {tradeOverlayVisible && (
              <TradeInsightsOverlay showTradeAdvantages={showTradeAdvantages} onChange={setShowTradeAdvantages} onDismiss={() => setTradeOverlayVisible(false)} />
            )}

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
            </>
          )}
        </div>
      </div>

      <RouteTimelineModal open={timelineOpen} onClose={() => setTimelineOpen(false)} route={selectedRoute} />
    </>
  );
}
