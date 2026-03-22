"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EnrichedRoute } from "@/lib/costCalculator";
import { formatCurrency, formatEmissions, formatHours, formatPercent } from "@/lib/formatters";
import { OptimizeFor } from "@/types";

interface ComparisonPanelProps {
  routes: EnrichedRoute[];
  priority: OptimizeFor;
  onPriorityChange: (value: OptimizeFor) => void;
}

type SortKey = "supplier" | "cost" | "time" | "tax" | "emissions" | "benefit";

export function ComparisonPanel({ routes, priority, onPriorityChange }: ComparisonPanelProps) {
  const [sortKey, setSortKey] = useState<SortKey>("cost");

  const sorted = useMemo(() => {
    return [...routes].sort((a, b) => {
      if (sortKey === "supplier") return a.supplier.name.localeCompare(b.supplier.name);
      if (sortKey === "time") return a.totalDurationHours - b.totalDurationHours;
      if (sortKey === "tax") return a.costBreakdown.importTax - b.costBreakdown.importTax;
      if (sortKey === "emissions") return a.totalEmissionsKg - b.totalEmissionsKg;
      if (sortKey === "benefit") return b.tradeSavingsPercent - a.tradeSavingsPercent;
      return a.totalLandedCost - b.totalLandedCost;
    });
  }, [routes, sortKey]);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-zinc-200 p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Route Comparison</h3>
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
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-3 py-2">Supplier</th>
              <th className="px-3 py-2">Landed Cost</th>
              <th className="px-3 py-2">Delivery Time</th>
              <th className="px-3 py-2">Import Tax</th>
              <th className="px-3 py-2">CO2</th>
              <th className="px-3 py-2">Trade Benefit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((route, index) => (
              <tr key={route.id} className={index === 0 ? "bg-emerald-50/80" : "border-t border-zinc-100"}>
                <td className="px-3 py-2 font-medium text-zinc-800">{route.supplier.name}</td>
                <td className="px-3 py-2">{formatCurrency(route.totalLandedCost)}</td>
                <td className="px-3 py-2">{formatHours(route.totalDurationHours)}</td>
                <td className="px-3 py-2">{formatCurrency(route.costBreakdown.importTax)}</td>
                <td className="px-3 py-2">{formatEmissions(route.totalEmissionsKg)}</td>
                <td className="px-3 py-2">{formatPercent(route.tradeSavingsPercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
