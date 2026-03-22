import { ComplianceRule, ShippingRoute, Supplier, TradeAgreement } from "@/types";

export interface EnrichedRoute extends ShippingRoute {
  supplier: Supplier;
  complianceRule?: ComplianceRule;
  tradeAgreement?: TradeAgreement;
}

export function enrichRoutes(
  routes: ShippingRoute[],
  suppliers: Supplier[],
  complianceRules: ComplianceRule[],
  tradeAgreements: TradeAgreement[],
): EnrichedRoute[] {
  return routes.reduce<EnrichedRoute[]>((accumulator, route) => {
      const supplier = suppliers.find((item) => item.id === route.supplierId);
      if (!supplier) {
        return accumulator;
      }

      accumulator.push({
        ...route,
        supplier,
        complianceRule: complianceRules.find((rule) => rule.country === supplier.country),
        tradeAgreement: tradeAgreements.find((agreement) => agreement.id === route.tradeAgreementId),
      });

      return accumulator;
    }, []);
}

export function getBestRouteByPriority(routes: EnrichedRoute[], priority: "cost" | "speed" | "sustainability") {
  if (!routes.length) {
    return null;
  }

  const sorted = [...routes].sort((a, b) => {
    if (priority === "speed") {
      return a.totalDurationHours - b.totalDurationHours;
    }
    if (priority === "sustainability") {
      return a.totalEmissionsKg - b.totalEmissionsKg;
    }
    return a.totalLandedCost - b.totalLandedCost;
  });

  return sorted[0];
}
