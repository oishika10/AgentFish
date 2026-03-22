import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { mapGeminiFailure } from "@/lib/supplySearchErrors";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_INSTRUCTION = `You are a market intelligence analyst for international trade and procurement.
Write a market landscape overview in Markdown for the buyer and product given.
Use ## for section headings. Suggested sections (adapt as needed): ## Supply landscape, ## Demand & pricing dynamics, ## Trade & compliance context, ## Risks & opportunities.
Assume the buyer is interested in importing into Canada (Greater Vancouver area) unless the prompt implies otherwise.
Be concise and scannable. End with a one-line disclaimer that this is directional intelligence, not financial or legal advice.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it in project settings or .env.local.", code: "CONFIG" },
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
      { error: "Role and product are required.", code: "UNKNOWN" },
      { status: 400 },
    );
  }

  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const prompt = `Buyer role: ${userType}\nProduct / category: ${product}\n\nProduce the market landscape overview.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.45, maxOutputTokens: 3072 },
        });

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (error) {
        const raw = error instanceof Error ? error.message : String(error);
        const mapped = mapGeminiFailure(raw);
        controller.enqueue(
          encoder.encode(
            `\n\n---\n\n**Could not complete stream.** ${mapped.message} (code: ${mapped.code})`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
