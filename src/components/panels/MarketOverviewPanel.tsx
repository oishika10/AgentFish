"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { DashboardLoader } from "@/components/panels/DashboardLoader";
import { clientFriendlySupplyError, titleForSupplyErrorCode } from "@/lib/supplySearchErrors";

interface MarketOverviewPanelProps {
  userType: string;
  product: string;
  tabActive: boolean;
}

export function MarketOverviewPanel({ userType, product, tabActive }: MarketOverviewPanelProps) {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const key = `${userType}|${product}`;

  useEffect(() => {
    if (!userType || !product || !tabActive) {
      return;
    }

    const cached = cacheRef.current.get(key);
    if (cached !== undefined) {
      setText(cached);
      setStreaming(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setText("");
    setError(null);
    setStreaming(true);

    void (async () => {
      try {
        const response = await fetch("/api/market-overview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userType, product }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string; code?: string };
          const code = payload.code ?? "UNKNOWN";
          setError({
            title: titleForSupplyErrorCode(code),
            message: payload.error ?? "Could not load market overview.",
          });
          setStreaming(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          accumulated += decoder.decode(value, { stream: true });
          setText(accumulated);
        }

        cacheRef.current.set(key, accumulated);
        setStreaming(false);
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }
        const f = clientFriendlySupplyError(e);
        setError({ title: f.title, message: f.message });
        setStreaming(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [userType, product, tabActive, key]);

  if (!userType || !product) {
    return (
      <p className="text-sm leading-relaxed text-zinc-600">
        Start from the home page with your role and product to generate a streamed market landscape overview.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {streaming ? <DashboardLoader /> : null}

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          <p className="font-semibold">{error.title}</p>
          <p className="mt-1 text-amber-900">{error.message}</p>
        </div>
      ) : null}

      {text ? (
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 text-zinc-800">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="mt-4 border-b border-zinc-200 pb-1 text-sm font-semibold text-zinc-900 first:mt-0">
                  {children}
                </h2>
              ),
              p: ({ children }) => <p className="text-sm leading-relaxed text-zinc-700">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 text-sm text-zinc-700">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 text-sm text-zinc-700">{children}</ol>,
              li: ({ children }) => <li className="mt-1">{children}</li>,
              hr: () => <hr className="my-4 border-zinc-200" />,
              strong: ({ children }) => <strong className="font-semibold text-zinc-900">{children}</strong>,
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
