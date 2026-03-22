"use client";

import { ShieldCheck, X } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";

interface TradeInsightsOverlayProps {
  showTradeAdvantages: boolean;
  onChange: (value: boolean) => void;
  onDismiss: () => void;
}

export function TradeInsightsOverlay({ showTradeAdvantages, onChange, onDismiss }: TradeInsightsOverlayProps) {
  return (
    <div className="absolute right-4 top-4 z-[500] w-72 rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-md backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-zinc-800">Trade Data Integration</p>
        <button
          type="button"
          onClick={onDismiss}
          title="Dismiss"
          className="ml-auto rounded-md p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mb-3 text-xs text-zinc-600">Powered by Canadian trade + customs data</p>
      <Toggle checked={showTradeAdvantages} onChange={onChange} label="Show trade advantages" />
    </div>
  );
}
