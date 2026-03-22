import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  buildSuppliersAndRoutesFromGemini,
  extractJsonFromModelText,
  normalizeGeminiSupply,
} from "@/lib/geminiSupply";
import { mapGeminiFailure } from "@/lib/supplySearchErrors";
import { enrichRoutes } from "@/lib/costCalculator";
import { complianceRules } from "@/data/complianceRules";
import { tradeAgreements } from "@/data/tradeAgreements";

export const runtime = "nodejs";

function supplySearchLog(...args: unknown[]) {
  if (process.env.NODE_ENV !== "development" && process.env.LOG_SUPPLY_SEARCH !== "true") {
    return;
  }
  console.log("[supply-search]", ...args);
}

const SYSTEM_INSTRUCTION = `You are a trade and procurement analyst. The user describes their role and a product they want to import.
Assume the import destination is the Toronto, Canada area unless the user clearly specifies another destination.
Return ONLY valid JSON (no markdown) with this exact structure:
{
  "destinationLabel": "string (e.g. Toronto Distribution Hub)",
  "destinationCoordinates": { "lat": number, "lng": number },
  "suppliers": [
    {
      "name": "string",
      "country": "string",
      "city": "string",
      "latitude": number,
      "longitude": number,
      "products": ["string"],
      "certifications": ["string"],
      "tariffRatePercent": number,
      "importTaxPercent": number,
      "importTaxUsd": number,
      "dutiesBeforeAgreementUsd": number,
      "dutiesAfterAgreementUsd": number,
      "baseShippingUsd": number,
      "handlingFeesUsd": number,
      "landedCostUsd": number,
      "deliveryTimeDays": number,
      "estimatedEmissionsKg": number,
      "tradeAgreementId": "cusma" | "cptpp" | "ceta" | "ckfta" | null,
      "tradeSavingsPercent": number,
      "routeClass": "cheapest" | "fastest" | "sustainable" | "tradeAdvantage",
      "confidence": "high" | "medium" | "low",
      "complianceNotes": ["string"],
      "primaryTransportMode": "truck" | "ship" | "rail" | "air"
    }
  ]
}

Rules:
- Provide 3 to 6 plausible supplier options in different countries relevant to the product.
- Coordinates must be realistic for the given city.
- tariffRatePercent: estimated applied tariff rate for this product lane (percentage).
- importTaxPercent: VAT/GST/HST-style import-side tax rate where applicable (percentage).
- importTaxUsd, duties*, shipping, handling, landedCostUsd: rough USD estimates for a representative shipment (consistent with each other).
- deliveryTimeDays: door-to-door lead time including ocean/air/truck as appropriate.
- tradeAgreementId must be one of cusma, cptpp, ceta, ckfta, or null if no clear match.
- Numbers must be JSON numbers, not strings.
- Be explicit that figures are illustrative estimates, not legal or customs advice.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server.", code: "CONFIG" },
      { status: 503 },
    );
  }

  let body: { userType?: string; product?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body.", code: "UNKNOWN" }, { status: 400 });
  }

  const userType = typeof body.userType === "string" ? body.userType.trim() : "";
  const product = typeof body.product === "string" ? body.product.trim() : "";

  if (!userType || !product) {
    return NextResponse.json(
      { error: "Role and product are required in the request.", code: "UNKNOWN" },
      { status: 400 },
    );
  }

  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  supplySearchLog("request", { userType, product, model: modelName });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = `User role: ${userType}\nProduct / category: ${product}\n\nProduce the JSON response.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    supplySearchLog("gemini raw text", text);

    const parsed = extractJsonFromModelText(text);
    supplySearchLog("parsed JSON", parsed);

    const normalized = normalizeGeminiSupply(parsed);
    supplySearchLog("normalized supply", normalized);

    if (!normalized) {
      supplySearchLog("normalize failed — raw parse was", parsed);
      return NextResponse.json(
        { error: "Could not parse supplier data from the model response.", code: "UNKNOWN" },
        { status: 502 },
      );
    }

    const built = buildSuppliersAndRoutesFromGemini(normalized);
    const enriched = enrichRoutes(built.routes, built.suppliers, complianceRules, tradeAgreements);

    supplySearchLog("API response (enriched routes)", JSON.stringify(enriched, null, 2));
    supplySearchLog("summary", { routeCount: enriched.length, routeIds: enriched.map((r) => r.id) });

    return NextResponse.json({ enriched });
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    supplySearchLog("Gemini / handler error (raw)", raw);
    const mapped = mapGeminiFailure(raw);
    supplySearchLog("mapped error for client", mapped);
    return NextResponse.json({ error: mapped.message, code: mapped.code }, { status: mapped.httpStatus });
  }
}
