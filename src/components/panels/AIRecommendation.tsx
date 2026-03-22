import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EnrichedRoute } from "@/lib/costCalculator";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface AIRecommendationProps {
  route: EnrichedRoute | null;
}

export function AIRecommendation({ route }: AIRecommendationProps) {
  if (!route) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 via-violet-50 to-emerald-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
        <Sparkles className="h-4 w-4 text-blue-600" />
        Best Route Recommendation
      </div>
      <p className="text-sm text-zinc-700">
        {route.supplier.name} is currently the strongest option at {formatCurrency(route.totalLandedCost)} with{" "}
        {formatPercent(route.tradeSavingsPercent)} estimated savings from {route.tradeAgreement?.name ?? "agreement"}
        .
      </p>
    </Card>
  );
}
