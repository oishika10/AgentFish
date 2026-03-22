"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip } from "recharts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EnrichedRoute } from "@/lib/costCalculator";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface RouteDetailPanelProps {
  route: EnrichedRoute | null;
  onOpenTimeline: () => void;
}

export function RouteDetailPanel({ route, onOpenTimeline }: RouteDetailPanelProps) {
  if (!route) {
    return (
      <Card className="p-4">
        <p className="text-sm text-zinc-600">Select a route on the map or in the routes list to view full details.</p>
      </Card>
    );
  }

  const breakdown = [
    { label: "Base shipping", value: route.costBreakdown.baseShipping },
    { label: "Import tax", value: route.costBreakdown.importTax },
    { label: "Duties", value: route.costBreakdown.dutiesAfterAgreement },
    { label: "Handling", value: route.costBreakdown.handlingFees },
  ];

  return (
    <div className="space-y-3">
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Route Breakdown</h3>
          <Badge label={route.routeType} tone="info" />
        </div>
        <p className="text-sm text-zinc-600">{route.supplier.name}</p>
        <p className="text-xl font-semibold text-zinc-900">{formatCurrency(route.totalLandedCost)}</p>
        <div className="overflow-x-auto">
          <BarChart data={breakdown} width={320} height={160}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <RechartTooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </div>
        <p className="text-xs text-zinc-500">
          Duties adjusted from {formatCurrency(route.costBreakdown.dutiesBeforeAgreement)} to{" "}
          {formatCurrency(route.costBreakdown.dutiesAfterAgreement)} through trade benefits.
        </p>
      </Card>

      <Card className="space-y-3 p-4">
        <h4 className="text-sm font-semibold text-zinc-900">Trade Agreement Insight</h4>
        <div className="flex flex-wrap items-center gap-2">
          <Badge label={route.tradeAgreement?.name ?? "No agreement"} tone="success" />
          <Badge label={`Savings ${formatPercent(route.tradeSavingsPercent)}`} tone="warning" />
        </div>
        <p className="text-sm text-zinc-600">
          Eligible under Canadian agreement. Reduced tariff applied with {route.confidence} confidence.
        </p>
        <ProgressBar value={route.confidence === "high" ? 90 : route.confidence === "medium" ? 70 : 45} />
      </Card>

      <Card className="space-y-2 p-4">
        <h4 className="text-sm font-semibold text-zinc-900">Compliance Checklist</h4>
        <ul className="space-y-1 text-sm text-zinc-700">
          {(route.complianceRule?.requiredDocuments ?? []).map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
        {route.complianceRule?.restrictedProducts.length ? (
          <p className="text-xs text-rose-600">
            Restrictions: {route.complianceRule.restrictedProducts.join(", ")}
          </p>
        ) : (
          <p className="text-xs text-emerald-600">No active restrictions for selected product category.</p>
        )}
        <Button variant="secondary" onClick={onOpenTimeline}>
          Open Route Timeline
        </Button>
      </Card>
    </div>
  );
}
