import { EnrichedRoute } from "@/lib/costCalculator";
import { formatCurrency, formatEmissions, formatHours } from "@/lib/formatters";

interface RouteTooltipProps {
  route: EnrichedRoute;
}

export function RouteTooltip({ route }: RouteTooltipProps) {
  return (
    <div className="space-y-1 text-xs">
      <p className="font-semibold text-zinc-800">{route.supplier.name}</p>
      <p>Cost: {formatCurrency(route.totalLandedCost)}</p>
      <p>Delivery: {formatHours(route.totalDurationHours)}</p>
      <p>CO2: {formatEmissions(route.totalEmissionsKg)}</p>
      <p>Import duties: {formatCurrency(route.costBreakdown.dutiesAfterAgreement)}</p>
    </div>
  );
}
