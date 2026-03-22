"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Maximize2, Minimize2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EnrichedRoute } from "@/lib/costCalculator";
import { formatCurrency, formatEmissions, formatHours, formatPercent } from "@/lib/formatters";
import { OptimizeFor } from "@/types";

interface ComparisonPanelProps {
  routes: EnrichedRoute[];
  priority: OptimizeFor;
  onPriorityChange: (value: OptimizeFor) => void;
  comparedRouteIds: string[];
  onToggleCompare: (id: string) => void;
}

type SortKey = "supplier" | "cost" | "time" | "tax" | "emissions" | "benefit";

function ComparisonTable({
  sorted,
  onRemove,
}: {
  sorted: EnrichedRoute[];
  onRemove: (id: string) => void;
}) {
  return (
    <table className="w-full text-left text-xs">
      <thead className="sticky top-0 bg-zinc-50 text-zinc-600">
        <tr>
          <th className="px-3 py-2">Supplier</th>
          <th className="px-3 py-2">Landed Cost</th>
          <th className="px-3 py-2">Delivery Time</th>
          <th className="px-3 py-2">Import Tax</th>
          <th className="px-3 py-2">CO2</th>
          <th className="px-3 py-2">Trade Benefit</th>
          <th className="px-3 py-2" />
        </tr>
      </thead>
      <tbody>
        {sorted.map((route, index) => (
          <tr key={route.id} className={index === 0 ? "bg-emerald-50/80" : "border-t border-zinc-100"}>
            <td className="px-3 py-2 font-medium text-zinc-800">
              <div>{route.supplier.name}</div>
              <div className="text-[10px] text-zinc-400">{route.supplier.city}, {route.supplier.country}</div>
            </td>
            <td className="px-3 py-2">{formatCurrency(route.totalLandedCost)}</td>
            <td className="px-3 py-2">{formatHours(route.totalDurationHours)}</td>
            <td className="px-3 py-2">{formatCurrency(route.costBreakdown.importTax)}</td>
            <td className="px-3 py-2">{formatEmissions(route.totalEmissionsKg)}</td>
            <td className="px-3 py-2">{formatPercent(route.tradeSavingsPercent)}</td>
            <td className="px-3 py-2">
              <button
                type="button"
                onClick={() => onRemove(route.id)}
                className="rounded p-0.5 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                title="Remove from comparison"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ComparisonPanel({ routes, priority, onPriorityChange, comparedRouteIds, onToggleCompare }: ComparisonPanelProps) {
  const [sortKey, setSortKey] = useState<SortKey>("cost");
  const [expanded, setExpanded] = useState(false);

  const comparedRoutes = useMemo(
    () => routes.filter((r) => comparedRouteIds.includes(r.id)),
    [routes, comparedRouteIds],
  );

  const sorted = useMemo(() => {
    return [...comparedRoutes].sort((a, b) => {
      if (sortKey === "supplier") return a.supplier.name.localeCompare(b.supplier.name);
      if (sortKey === "time") return a.totalDurationHours - b.totalDurationHours;
      if (sortKey === "tax") return a.costBreakdown.importTax - b.costBreakdown.importTax;
      if (sortKey === "emissions") return a.totalEmissionsKg - b.totalEmissionsKg;
      if (sortKey === "benefit") return b.tradeSavingsPercent - a.tradeSavingsPercent;
      return a.totalLandedCost - b.totalLandedCost;
    });
  }, [comparedRoutes, sortKey]);

  const header = (
    <div className="border-b border-zinc-200 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Route Comparison</h3>
          {comparedRouteIds.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
              {comparedRouteIds.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {comparedRoutes.length > 1 && (
            <>
              <ArrowDownUp className="h-4 w-4 text-zinc-500" />
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="rounded-md border border-zinc-200 px-2 py-1 text-xs"
              >
                <option value="cost">Sort: Total Cost</option>
                <option value="time">Sort: Delivery Time</option>
                <option value="tax">Sort: Import Tax</option>
                <option value="emissions">Sort: CO2</option>
                <option value="benefit">Sort: Trade Benefit</option>
              </select>
            </>
          )}
          {comparedRoutes.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              title="Expand comparison"
              className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        {(["cost", "speed", "compliance", "sustainability"] as OptimizeFor[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPriorityChange(item)}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              priority === item ? "border-blue-300 bg-blue-50 text-blue-700" : "border-zinc-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Card className="overflow-hidden">
        {header}
        {comparedRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <span className="text-2xl">📊</span>
            <p className="text-sm font-medium text-zinc-700">No routes selected</p>
            <p className="max-w-[200px] text-xs text-zinc-400">
              Click any route on the map, or click{" "}
              <span className="font-medium text-zinc-600">+ Compare</span> in the Routes tab to add it here.
            </p>
          </div>
        ) : (
          <div className="max-h-[360px] overflow-auto">
            <ComparisonTable sorted={sorted} onRemove={onToggleCompare} />
          </div>
        )}
      </Card>

      {/* Expanded modal overlay */}
      {expanded && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-[min(95vw,900px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900">Route Comparison</h2>
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                  {comparedRouteIds.length} routes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4 text-zinc-500" />
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  className="rounded-md border border-zinc-200 px-2 py-1 text-xs"
                >
                  <option value="cost">Sort: Total Cost</option>
                  <option value="time">Sort: Delivery Time</option>
                  <option value="tax">Sort: Import Tax</option>
                  <option value="emissions">Sort: CO2</option>
                  <option value="benefit">Sort: Trade Benefit</option>
                </select>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  title="Collapse"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-auto">
              <ComparisonTable sorted={sorted} onRemove={onToggleCompare} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
