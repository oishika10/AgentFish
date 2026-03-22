"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRightLeft, Filter, Route } from "lucide-react";
import { routes } from "@/data/routes";
import { suppliers } from "@/data/suppliers";
import { complianceRules } from "@/data/complianceRules";
import { tradeAgreements } from "@/data/tradeAgreements";
import { EnrichedRoute, enrichRoutes, getBestRouteByPriority } from "@/lib/costCalculator";
import { formatCurrency, formatEmissions, formatHours, formatPercent } from "@/lib/formatters";
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
import { clientFriendlySupplyError, titleForSupplyErrorCode } from "@/lib/supplySearchErrors";

const DynamicMapView = dynamic(() => import("@/components/map/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-zinc-100" />,
});

type TabId = "routes" | "compare" | "filters";

type GeminiErrorBanner = { title: string; message: string; code: string };

export function ExploreShell() {
  const searchParams = useSearchParams();
  const userType = searchParams.get("userType")?.trim() ?? "";
  const product = searchParams.get("product")?.trim() ?? "";

  const [tab, setTab] = useState<TabId>("routes");
  const [priority, setPriority] = useState<OptimizeFor>("cost");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(routes[0]?.id ?? null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [showTradeAdvantages, setShowTradeAdvantages] = useState(true);
  const [onlyTradeRoutes, setOnlyTradeRoutes] = useState(false);
  const [minimizeImportTax, setMinimizeImportTax] = useState(false);
  const [geminiRoutes, setGeminiRoutes] = useState<EnrichedRoute[] | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<GeminiErrorBanner | null>(null);

  const fallbackEnriched = useMemo(
    () => enrichRoutes(routes, suppliers, complianceRules, tradeAgreements),
    [],
  );

  useEffect(() => {
    if (!userType || !product) {
      setGeminiRoutes(null);
      setGeminiError(null);
      setGeminiLoading(false);
      setSelectedRouteId(routes[0]?.id ?? null);
      return;
    }

    const controller = new AbortController();
    setGeminiLoading(true);
    setGeminiError(null);

    fetch("/api/supply-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userType, product }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          enriched?: EnrichedRoute[];
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
          setSelectedRouteId(routes[0]?.id ?? null);
          return;
        }

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
    return enriched.filter((routeItem) => {
      if (onlyTradeRoutes && !routeItem.tradeAgreementId) return false;
      if (minimizeImportTax && routeItem.costBreakdown.importTax > 1400) return false;
      return true;
    });
  }, [enriched, minimizeImportTax, onlyTradeRoutes]);

  const selectedRoute = filteredRoutes.find((routeItem) => routeItem.id === selectedRouteId) ?? null;
  const bestRoute = getBestRouteByPriority(
    filteredRoutes,
    priority === "compliance" ? "cost" : priority,
  );

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
                  <p className="text-blue-700">Finding suppliers and trade estimates with Gemini…</p>
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
              {tab === "routes" ? (
                <>
                  <AIRecommendation route={bestRoute} />
                  <ScenarioToggle />
                  {filteredRoutes.map((routeItem) => (
                    <Card
                      key={routeItem.id}
                      className={`cursor-pointer p-3 transition-colors ${
                        selectedRouteId === routeItem.id ? "border-blue-300 bg-blue-50/40" : "hover:bg-zinc-50"
                      }`}
                      onClick={() => setSelectedRouteId(routeItem.id)}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{routeItem.supplier.name}</p>
                          <p className="text-xs text-zinc-500">{routeItem.supplier.country}</p>
                        </div>
                        <Badge label={routeItem.tradeAgreement?.name ?? "No FTA"} tone="warning" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-700">
                        <p>Cost: {formatCurrency(routeItem.totalLandedCost)}</p>
                        <p>Time: {formatHours(routeItem.totalDurationHours)}</p>
                        <p>CO2: {formatEmissions(routeItem.totalEmissionsKg)}</p>
                        <p>Benefit: {formatPercent(routeItem.tradeSavingsPercent)}</p>
                      </div>
                    </Card>
                  ))}
                  <RouteDetailPanel route={selectedRoute} onOpenTimeline={() => setTimelineOpen(true)} />
                </>
              ) : null}

              {tab === "compare" ? (
                <ComparisonPanel routes={filteredRoutes} priority={priority} onPriorityChange={setPriority} />
              ) : null}

              {tab === "filters" ? (
                <FiltersPanel
                  onlyTradeRoutes={onlyTradeRoutes}
                  onOnlyTradeRoutesChange={setOnlyTradeRoutes}
                  minimizeImportTax={minimizeImportTax}
                  onMinimizeImportTaxChange={setMinimizeImportTax}
                />
              ) : null}
            </div>
          </aside>

          <section className="relative h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <DynamicMapView
              routes={filteredRoutes}
              selectedRouteId={selectedRouteId}
              showTradeAdvantages={showTradeAdvantages}
              onSelectRoute={setSelectedRouteId}
            />
            <TradeInsightsOverlay showTradeAdvantages={showTradeAdvantages} onChange={setShowTradeAdvantages} />
            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] grid gap-2 text-xs text-zinc-700">
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                <Route className="h-3.5 w-3.5 text-emerald-600" />
                Green cheapest
              </div>
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
                Blue fastest / Purple sustainable / Orange trade advantage
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
