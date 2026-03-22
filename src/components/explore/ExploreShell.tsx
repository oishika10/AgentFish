"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ArrowRightLeft, Filter, Route } from "lucide-react";
import { routes } from "@/data/routes";
import { suppliers } from "@/data/suppliers";
import { complianceRules } from "@/data/complianceRules";
import { tradeAgreements } from "@/data/tradeAgreements";
import { enrichRoutes, getBestRouteByPriority } from "@/lib/costCalculator";
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
