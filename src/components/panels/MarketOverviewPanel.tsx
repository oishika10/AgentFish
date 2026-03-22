"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { DashboardLoader } from "@/components/panels/DashboardLoader";

type ErrorBanner = { title: string; message: string };

interface MarketOverviewPanelProps {
  userType: string;
  product: string;
  /** null = not loaded yet; string = content (may be empty) */
  markdown: string | null;
  loading: boolean;
  error: ErrorBanner | null;
}

const STREAM_CHARS_PER_TICK = 6;
const STREAM_INTERVAL_MS = 18;

export function MarketOverviewPanel({
  userType,
  product,
  markdown,
  loading,
  error,
}: MarketOverviewPanelProps) {
  const [streamedText, setStreamedText] = useState("");

  useEffect(() => {
    if (loading || error) {
      setStreamedText("");
      return;
    }
    if (markdown === null || markdown.length === 0) {
      setStreamedText("");
      return;
    }

    setStreamedText("");
    let index = 0;
    const id = setInterval(() => {
      index = Math.min(index + STREAM_CHARS_PER_TICK, markdown.length);
      setStreamedText(markdown.slice(0, index));
      if (index >= markdown.length) {
        clearInterval(id);
      }
    }, STREAM_INTERVAL_MS);

    return () => clearInterval(id);
  }, [markdown, loading, error]);

  if (!userType || !product) {
    return (
      <p className="text-sm leading-relaxed text-zinc-600">
        Start from the home page with your role and product to generate a market landscape overview.
      </p>
    );
  }

  const waitingOnApi = loading && markdown === null;
  const streamingCopy =
    !error &&
    markdown !== null &&
    markdown.length > 0 &&
    streamedText.length < markdown.length;
  const showDashboardLoader = waitingOnApi || streamingCopy;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {showDashboardLoader ? <DashboardLoader /> : null}

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          <p className="font-semibold">{error.title}</p>
          <p className="mt-1 text-amber-900">{error.message}</p>
        </div>
      ) : null}

      {!error && streamedText.length > 0 ? (
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
            {streamedText}
          </ReactMarkdown>
        </div>
      ) : null}

      {!loading && !error && markdown === "" ? (
        <p className="text-sm text-zinc-500">No market overview text was returned for this search.</p>
      ) : null}
    </div>
  );
}
