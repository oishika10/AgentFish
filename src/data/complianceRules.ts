import { ComplianceRule } from "@/types";

export const complianceRules: ComplianceRule[] = [
  {
    country: "China",
    baseDutyPercent: 8,
    importTaxPercent: 5,
    restrictedProducts: ["dual-use sensors"],
    requiredDocuments: ["Commercial Invoice", "Bill of Lading", "Importer Number", "Product Datasheet"],
  },
  {
    country: "Mexico",
    baseDutyPercent: 6,
    importTaxPercent: 4,
    restrictedProducts: [],
    requiredDocuments: ["Certificate of Origin", "Commercial Invoice", "Transport Manifest"],
  },
  {
    country: "Vietnam",
    baseDutyPercent: 7.5,
    importTaxPercent: 4.5,
    restrictedProducts: ["certain treated fabrics"],
    requiredDocuments: ["Certificate of Origin", "Commercial Invoice", "Packing List"],
  },
  {
    country: "Germany",
    baseDutyPercent: 5.5,
    importTaxPercent: 4,
    restrictedProducts: [],
    requiredDocuments: ["Import Permit", "Commercial Invoice", "Safety Compliance Declaration"],
  },
  {
    country: "South Korea",
    baseDutyPercent: 7.2,
    importTaxPercent: 4.2,
    restrictedProducts: ["high-frequency modules"],
    requiredDocuments: ["Certificate of Origin", "HS Classification", "Commercial Invoice"],
  },
  {
    country: "Japan",
    baseDutyPercent: 6.2,
    importTaxPercent: 4.1,
    restrictedProducts: [],
    requiredDocuments: ["Certificate of Origin", "Commercial Invoice", "Technical Specification Sheet"],
  },
];
