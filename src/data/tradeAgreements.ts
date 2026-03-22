import { TradeAgreement } from "@/types";

export const tradeAgreements: TradeAgreement[] = [
  {
    id: "cusma",
    name: "CUSMA",
    eligibleCountries: ["Canada", "United States", "Mexico"],
    productCategories: ["automotive parts", "industrial fasteners", "machinery parts"],
    tariffReductionPercent: 100,
    customsClearanceBoostPercent: 16,
    requiredDocuments: ["Certificate of Origin", "Commercial Invoice", "Bill of Lading"],
  },
  {
    id: "cptpp",
    name: "CPTPP",
    eligibleCountries: ["Vietnam", "Japan", "Mexico"],
    productCategories: ["textiles", "electronics components", "precision bearings"],
    tariffReductionPercent: 65,
    customsClearanceBoostPercent: 12,
    requiredDocuments: ["Certificate of Origin", "Packing List", "Commercial Invoice"],
  },
  {
    id: "ceta",
    name: "CETA",
    eligibleCountries: ["Germany", "France", "Italy", "Netherlands"],
    productCategories: ["machinery parts", "industrial sensors", "automation equipment"],
    tariffReductionPercent: 92,
    customsClearanceBoostPercent: 9,
    requiredDocuments: ["Supplier Declaration", "Commercial Invoice", "Import Permit"],
  },
  {
    id: "ckfta",
    name: "Canada-Korea FTA",
    eligibleCountries: ["South Korea"],
    productCategories: ["electronics components", "semiconductor tooling"],
    tariffReductionPercent: 80,
    customsClearanceBoostPercent: 11,
    requiredDocuments: ["Certificate of Origin", "Commercial Invoice", "HS Classification"],
  },
];
